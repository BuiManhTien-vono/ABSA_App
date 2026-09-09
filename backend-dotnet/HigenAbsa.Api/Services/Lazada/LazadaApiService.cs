// Services/Lazada/LazadaApiService.cs - Implementation of Lazada Product Review API & DB Sync
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using HigenAbsa.Api.Data;
using HigenAbsa.Api.Data.Entities;
using HigenAbsa.Api.Models.Lazada;
using HigenAbsa.Api.Models.Review;

using ProductEntity = HigenAbsa.Api.Data.Entities.Product;
using CustomerEntity = HigenAbsa.Api.Data.Entities.Customer;
using ReviewEntity = HigenAbsa.Api.Data.Entities.Review;

namespace HigenAbsa.Api.Services.Lazada;

public class LazadaApiService(
    HttpClient httpClient,
    LazadaOptions options,
    ILazadaSignatureService signatureService,
    AppDbContext db,
    IInferenceService inferenceService,
    ILogger<LazadaApiService> logger) : ILazadaApiService
{
    public async Task<LazadaReviewListResponse> GetProductReviewListAsync(
        string accessToken,
        long? itemId = null,
        int pageNo = 1,
        int pageSize = 20)
    {
        const string apiPath = "/review/seller/list";
        string timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString();

        var parameters = new Dictionary<string, string>
        {
            { "app_key", options.AppKey },
            { "access_token", accessToken },
            { "timestamp", timestamp },
            { "sign_method", "sha256" },
            { "page_no", pageNo.ToString() },
            { "page_size", pageSize.ToString() }
        };

        if (itemId.HasValue && itemId.Value > 0)
        {
            parameters.Add("item_id", itemId.Value.ToString());
        }

        string sign = signatureService.GenerateSign(apiPath, parameters, options.AppSecret);
        parameters.Add("sign", sign);

        string queryString = string.Join("&", parameters.Select(kvp => $"{Uri.EscapeDataString(kvp.Key)}={Uri.EscapeDataString(kvp.Value)}"));
        string requestUrl = $"{options.ApiBaseUrl.TrimEnd('/')}{apiPath}?{queryString}";

        logger.LogInformation("Calling Lazada Product Review API: {Url}", requestUrl);

        var response = await httpClient.GetAsync(requestUrl);
        string responseString = await response.Content.ReadAsStringAsync();

        logger.LogInformation("Lazada Product Review API Response: {Response}", responseString);

        var reviewResponse = JsonSerializer.Deserialize<LazadaReviewListResponse>(responseString, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        return reviewResponse ?? new LazadaReviewListResponse
        {
            Code = "ERROR",
            Message = "Failed to parse product review list response from Lazada."
        };
    }

    public async Task<LazadaSyncResultDto> SyncReviewsToDatabaseAsync(
        Guid storeId,
        string? accessToken = null,
        long? itemId = null,
        int pageNo = 1,
        int pageSize = 20)
    {
        var store = await db.StoreConnections
            .FirstOrDefaultAsync(s => s.Id == storeId);

        if (store == null)
        {
            throw new InvalidOperationException($"Store connection with ID {storeId} not found.");
        }

        string effectiveToken = !string.IsNullOrWhiteSpace(accessToken)
            ? accessToken
            : store.AccessToken ?? "";

        if (string.IsNullOrWhiteSpace(effectiveToken))
        {
            throw new InvalidOperationException("No valid Lazada Access Token provided or stored for this connection.");
        }

        var apiResponse = await GetProductReviewListAsync(effectiveToken, itemId, pageNo, pageSize);

        var syncResult = new LazadaSyncResultDto
        {
            StoreId = store.Id,
            StoreName = store.StoreName
        };

        var reviewItems = apiResponse.Data?.Reviews;
        if (reviewItems == null || reviewItems.Count == 0)
        {
            logger.LogInformation("No reviews returned from Lazada API or API code: {Code}, message: {Msg}", apiResponse.Code, apiResponse.Message);
            return syncResult;
        }

        foreach (var item in reviewItems)
        {
            string platformReviewId = !string.IsNullOrWhiteSpace(item.ReviewId)
                ? item.ReviewId
                : item.Id > 0 ? item.Id.ToString() : Guid.NewGuid().ToString("N");

            var existingReview = await db.Reviews
                .Include(r => r.AIAnalysis)
                .FirstOrDefaultAsync(r => r.PlatformReviewId == platformReviewId);

            if (existingReview != null)
            {
                syncResult.SkippedCount++;
                continue;
            }

            // 1. Product mapping/upsert
            string platformProductId = item.ItemId > 0 ? item.ItemId.ToString() : "LAZADA-ITEM-001";
            var product = await db.Products
                .FirstOrDefaultAsync(p => p.StoreId == store.Id && p.PlatformProductId == platformProductId);

            if (product == null)
            {
                product = new ProductEntity
                {
                    Id = Guid.NewGuid(),
                    StoreId = store.Id,
                    PlatformProductId = platformProductId,
                    Name = !string.IsNullOrWhiteSpace(item.ProductTitle) ? item.ProductTitle : $"Lazada Item #{platformProductId}",
                    CreatedAt = DateTime.UtcNow
                };
                db.Products.Add(product);
                await db.SaveChangesAsync();
            }

            // 2. Customer mapping/upsert
            string buyerId = !string.IsNullOrWhiteSpace(item.BuyerId) ? item.BuyerId : "LAZADA-BUYER-ANON";
            var customer = await db.Customers
                .FirstOrDefaultAsync(c => c.StoreId == store.Id && c.PlatformUserId == buyerId);

            if (customer == null)
            {
                customer = new CustomerEntity
                {
                    Id = Guid.NewGuid(),
                    StoreId = store.Id,
                    PlatformUserId = buyerId,
                    DisplayName = !string.IsNullOrWhiteSpace(item.BuyerName) ? item.BuyerName : "Lazada Customer",
                    TotalReviewsCount = 1,
                    RiskLevel = "NORMAL",
                    CreatedAt = DateTime.UtcNow
                };
                db.Customers.Add(customer);
                await db.SaveChangesAsync();
            }
            else
            {
                customer.TotalReviewsCount++;
            }

            // 3. Create Review Entity
            string commentText = item.ReviewContent ?? "No review text provided.";
            DateTime createdAt = item.CreatedAt ?? DateTime.UtcNow;
            if (!string.IsNullOrWhiteSpace(item.CreateTime) && DateTime.TryParse(item.CreateTime, out var parsedDate))
            {
                createdAt = parsedDate;
            }

            var review = new ReviewEntity
            {
                Id = Guid.NewGuid(),
                StoreId = store.Id,
                ProductId = product.Id,
                CustomerId = customer.Id,
                PlatformReviewId = platformReviewId,
                OrderIdOnPlatform = item.OrderId,
                Rating = item.Rating > 0 ? item.Rating : (byte)5,
                CommentText = commentText,
                MediaUrlsJson = item.ImageList != null && item.ImageList.Count > 0
                    ? JsonSerializer.Serialize(item.ImageList)
                    : null,
                ReviewCreatedAt = createdAt,
                SyncedAt = DateTime.UtcNow,
                Status = "PENDING"
            };

            db.Reviews.Add(review);

            // 4. Run AI Sentiment & Aspect Prediction via InferenceService
            if (!string.IsNullOrWhiteSpace(commentText))
            {
                try
                {
                    var prediction = await inferenceService.PredictOneAsync(commentText);

                    var aiAnalysis = new ReviewAIAnalysis
                    {
                        Id = Guid.NewGuid(),
                        ReviewId = review.Id,
                        OverallSentiment = prediction.OverallSentiment.Label.ToUpper(),
                        SentimentScore = prediction.OverallSentiment.Score,
                        IsSpam = false,
                        IsIntentQa = false,
                        ModelVersion = inferenceService.ModelNameStr,
                        ProcessedAt = DateTime.UtcNow
                    };
                    db.ReviewAIAnalyses.Add(aiAnalysis);

                    foreach (var aspect in prediction.AspectSentiments)
                    {
                        var aspectEntity = new ReviewAspect
                        {
                            ReviewId = review.Id,
                            MacroCategory = aspect.Macro ?? "OTHER",
                            MicroAspect = aspect.Micro,
                            Sentiment = aspect.Sentiment.ToUpper(),
                            AspectScore = aspect.AspectScore,
                            SentimentScore = aspect.SentimentScore,
                            EvidenceText = commentText
                        };
                        db.ReviewAspects.Add(aspectEntity);
                    }
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Failed to run AI prediction for review {ReviewId}", platformReviewId);
                }
            }

            await db.SaveChangesAsync();
            syncResult.SyncedCount++;

            syncResult.SyncedReviews.Add(new ReviewListDto
            {
                Id = review.Id,
                PlatformReviewId = review.PlatformReviewId,
                Rating = review.Rating,
                CommentText = review.CommentText,
                Status = review.Status,
                ReviewCreatedAt = review.ReviewCreatedAt,
                StoreName = store.StoreName,
                ProductName = product.Name,
                CustomerName = customer.DisplayName
            });
        }

        store.LastSyncedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return syncResult;
    }
}
