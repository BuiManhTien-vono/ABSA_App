using HigenAbsa.Infrastructure.Data;
using Microsoft.Extensions.Logging;
using HigenAbsa.Application.Services.Lazada;
using HigenAbsa.Application.Services.Inference;
// Services/Inference/ExcelAnalysisService.cs - Excel Review Upload & AI Analysis Implementation
using System.Data;
using System.Text;
using System.Text.Json;
using ExcelDataReader;
using Microsoft.EntityFrameworkCore;
using HigenAbsa.Domain.Entities;
using HigenAbsa.Application.DTOs.Inference;

using ProductEntity = HigenAbsa.Domain.Entities.Product;
using CustomerEntity = HigenAbsa.Domain.Entities.Customer;
using ReviewEntity = HigenAbsa.Domain.Entities.Review;

namespace HigenAbsa.Infrastructure.Services.Inference;

public class ExcelAnalysisService(
    IInferenceService inferenceService,
    AppDbContext db,
    ILogger<ExcelAnalysisService> logger) : IExcelAnalysisService
{
    public async Task<ExcelAnalysisResultDto> ProcessExcelStreamAsync(
        Stream stream,
        string fileName,
        bool saveToDb = true)
    {
        ArgumentNullException.ThrowIfNull(stream);
        ArgumentException.ThrowIfNullOrWhiteSpace(fileName);

        // Ensure Encoding is registered for ExcelDataReader (CodePages for legacy .xls/.csv)
        Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

        string ext = Path.GetExtension(fileName).ToLowerInvariant();
        using var reader = ext == ".csv"
            ? ExcelReaderFactory.CreateCsvReader(stream)
            : ExcelReaderFactory.CreateReader(stream);

        var dataSet = reader.AsDataSet(new ExcelDataSetConfiguration
        {
            ConfigureDataTable = _ => new ExcelDataTableConfiguration
            {
                UseHeaderRow = true
            }
        });

        if (dataSet.Tables.Count == 0 || dataSet.Tables[0].Rows.Count == 0)
        {
            throw new InvalidOperationException("Uploaded Excel file contains no worksheets or data rows.");
        }

        var table = dataSet.Tables[0];
        int commentCol = -1;
        int productCol = -1;
        int customerCol = -1;
        int ratingCol = -1;

        // Auto-detect columns based on header names
        // Priority: content/comment column first, then product title, then rating
        for (int i = 0; i < table.Columns.Count; i++)
        {
            string colName = table.Columns[i].ColumnName.Trim().ToLowerInvariant();

            // Comment / review content column
            if (commentCol == -1 && (colName == "content" || colName.Contains("comment") || colName.Contains("review") ||
                                     colName.Contains("bình luận") || colName.Contains("đánh giá") ||
                                     colName.Contains("phản hồi") || colName.Contains("nội dung") ||
                                     colName.Contains("text")))
            {
                commentCol = i;
            }
            // Product name / title column (skip "product_id" — that's just an ID)
            else if (productCol == -1 && (colName == "title" || colName.Contains("sản phẩm") ||
                                         colName.Contains("tên sp") ||
                                         (colName.Contains("product") && !colName.Contains("_id")) ||
                                         (colName.Contains("name") && !colName.Contains("user"))))
            {
                productCol = i;
            }
            // Customer / buyer column
            else if (customerCol == -1 && (colName.Contains("customer") || colName.Contains("khách hàng") ||
                                          colName.Contains("buyer") || colName.Contains("người mua") ||
                                          colName.Contains("user_name") || colName.Contains("username")))
            {
                customerCol = i;
            }
            // Rating / star column
            else if (ratingCol == -1 && (colName.Contains("rating") || colName.Contains("điểm") ||
                                        colName.Contains("sao") || colName.Contains("score") || colName.Contains("star")))
            {
                ratingCol = i;
            }
        }

        // Fallback: If no explicit comment column found, pick first string column
        if (commentCol == -1)
        {
            for (int i = 0; i < table.Columns.Count; i++)
            {
                if (table.Columns[i].DataType == typeof(string))
                {
                    commentCol = i;
                    break;
                }
            }
            if (commentCol == -1) commentCol = 0;
        }

        var extractedRows = new List<(int Index, string CommentText, string ProductName, string CustomerName, byte Rating)>();

        for (int rowIndex = 0; rowIndex < table.Rows.Count; rowIndex++)
        {
            var row = table.Rows[rowIndex];
            string comment = commentCol >= 0 && commentCol < row.ItemArray.Length
                ? row[commentCol]?.ToString()?.Trim() ?? ""
                : "";

            if (string.IsNullOrWhiteSpace(comment)) continue;

            string prodName = productCol >= 0 && productCol < row.ItemArray.Length
                ? row[productCol]?.ToString()?.Trim() ?? ""
                : "";
            if (string.IsNullOrWhiteSpace(prodName)) prodName = "Sản phẩm mẫu (Excel)";

            string custName = customerCol >= 0 && customerCol < row.ItemArray.Length
                ? row[customerCol]?.ToString()?.Trim() ?? ""
                : "";
            if (string.IsNullOrWhiteSpace(custName)) custName = "Khách hàng (Excel)";

            byte rating = 5;
            if (ratingCol >= 0 && ratingCol < row.ItemArray.Length)
            {
                string rStr = row[ratingCol]?.ToString() ?? "";
                if (byte.TryParse(rStr, out var rVal) && rVal >= 1 && rVal <= 5)
                {
                    rating = rVal;
                }
            }

            extractedRows.Add((rowIndex + 1, comment, prodName, custName, rating));
        }

        if (extractedRows.Count == 0)
        {
            throw new InvalidOperationException("No valid review comments could be extracted from the Excel file.");
        }

        // Limit to max 50 rows to prevent long processing times (ONNX batch=1, ~1s/review)
        const int maxRows = 50;
        if (extractedRows.Count > maxRows)
        {
            extractedRows = extractedRows.Take(maxRows).ToList();
        }

        // Predict with ONNX ViSoBERT ABSA model (BatchSize=1 in InferenceService handles sequential processing)
        var commentsOnly = extractedRows.Select(r => r.CommentText).ToList();
        var predictions = await inferenceService.PredictManyAsync(commentsOnly);

        StoreConnection? virtualStore = null;
        if (saveToDb)
        {
            var platform = await db.Platforms.FirstOrDefaultAsync(p => p.Code == "LAZADA")
                           ?? await db.Platforms.FirstOrDefaultAsync();

            int platformId = platform?.Id ?? 1;
            string storeCode = $"EXCEL_{Guid.NewGuid():N}"[..18];

            virtualStore = new StoreConnection
            {
                Id = Guid.NewGuid(),
                PlatformId = platformId,
                StoreName = $"Excel Import - {Path.GetFileNameWithoutExtension(fileName)}",
                StoreCodeOnPlatform = storeCode,
                Status = "CONNECTED",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                LastSyncedAt = DateTime.UtcNow
            };
            db.StoreConnections.Add(virtualStore);
            await db.SaveChangesAsync();
        }

        var analyzedRows = new List<AnalyzedReviewRowDto>();
        var aspectMap = new Dictionary<string, (int Total, int Pos, int Neu, int Neg)>();

        int posCount = 0, neuCount = 0, negCount = 0;

        for (int i = 0; i < extractedRows.Count; i++)
        {
            var item = extractedRows[i];
            var pred = predictions[i];

            string sentimentLabel = pred.OverallSentiment.Label.ToUpper();
            if (sentimentLabel == "POS") posCount++;
            else if (sentimentLabel == "NEU") neuCount++;
            else if (sentimentLabel == "NEG") negCount++;

            analyzedRows.Add(new AnalyzedReviewRowDto
            {
                RowIndex = item.Index,
                ProductName = item.ProductName,
                CustomerName = item.CustomerName,
                Rating = item.Rating,
                CommentText = item.CommentText,
                OverallSentiment = sentimentLabel,
                SentimentScore = pred.OverallSentiment.Score,
                AspectSentiments = pred.AspectSentiments
            });

            foreach (var asp in pred.AspectSentiments)
            {
                string key = $"{asp.Macro ?? "OTHER"}___{asp.Micro}";
                if (!aspectMap.TryGetValue(key, out var counts))
                {
                    counts = (0, 0, 0, 0);
                }

                counts.Total++;
                string sUpper = asp.Sentiment.ToUpper();
                if (sUpper == "POS") counts.Pos++;
                else if (sUpper == "NEU") counts.Neu++;
                else if (sUpper == "NEG") counts.Neg++;

                aspectMap[key] = counts;
            }

            if (saveToDb && virtualStore != null)
            {
                string platformProdId = $"EXCEL_PROD_{i + 1}";
                var product = await db.Products
                    .FirstOrDefaultAsync(p => p.StoreId == virtualStore.Id && p.Name == item.ProductName);

                if (product == null)
                {
                    product = new ProductEntity
                    {
                        Id = Guid.NewGuid(),
                        StoreId = virtualStore.Id,
                        PlatformProductId = platformProdId,
                        Name = item.ProductName,
                        CreatedAt = DateTime.UtcNow
                    };
                    db.Products.Add(product);
                    await db.SaveChangesAsync();
                }

                var customer = new CustomerEntity
                {
                    Id = Guid.NewGuid(),
                    StoreId = virtualStore.Id,
                    PlatformUserId = $"EXCEL_BUYER_{i + 1}",
                    DisplayName = item.CustomerName,
                    TotalReviewsCount = 1,
                    RiskLevel = "NORMAL",
                    CreatedAt = DateTime.UtcNow
                };
                db.Customers.Add(customer);
                await db.SaveChangesAsync();

                var review = new ReviewEntity
                {
                    Id = Guid.NewGuid(),
                    StoreId = virtualStore.Id,
                    ProductId = product.Id,
                    CustomerId = customer.Id,
                    PlatformReviewId = $"EXCEL_REV_{Guid.NewGuid():N}",
                    Rating = item.Rating,
                    CommentText = item.CommentText,
                    ReviewCreatedAt = DateTime.UtcNow,
                    SyncedAt = DateTime.UtcNow,
                    Status = "PENDING"
                };
                db.Reviews.Add(review);

                var aiAnalysis = new ReviewAIAnalysis
                {
                    Id = Guid.NewGuid(),
                    ReviewId = review.Id,
                    OverallSentiment = sentimentLabel,
                    SentimentScore = pred.OverallSentiment.Score,
                    IsSpam = false,
                    IsIntentQa = false,
                    ModelVersion = inferenceService.ModelNameStr,
                    ProcessedAt = DateTime.UtcNow
                };
                db.ReviewAIAnalyses.Add(aiAnalysis);

                foreach (var aspect in pred.AspectSentiments)
                {
                    db.ReviewAspects.Add(new ReviewAspect
                    {
                        ReviewId = review.Id,
                        MacroCategory = aspect.Macro ?? "OTHER",
                        MicroAspect = aspect.Micro,
                        Sentiment = aspect.Sentiment.ToUpper(),
                        AspectScore = aspect.AspectScore,
                        SentimentScore = aspect.SentimentScore,
                        EvidenceText = item.CommentText
                    });
                }
            }
        }

        if (saveToDb && virtualStore != null)
        {
            await db.SaveChangesAsync();
        }

        int total = extractedRows.Count;
        var topAspects = aspectMap
            .Select(kvp =>
            {
                var parts = kvp.Key.Split("___");
                return new AspectSummaryDto
                {
                    MacroCategory = parts[0],
                    MicroAspect = parts.Length > 1 ? parts[1] : "",
                    TotalMentions = kvp.Value.Total,
                    PositiveMentions = kvp.Value.Pos,
                    NeutralMentions = kvp.Value.Neu,
                    NegativeMentions = kvp.Value.Neg
                };
            })
            .OrderByDescending(a => a.TotalMentions)
            .Take(10)
            .ToList();

        return new ExcelAnalysisResultDto
        {
            FileName = fileName,
            TotalRows = table.Rows.Count,
            ProcessedRows = total,
            PositiveCount = posCount,
            NeutralCount = neuCount,
            NegativeCount = negCount,
            PositivePercentage = total > 0 ? (float)Math.Round((double)posCount / total * 100, 1) : 0,
            NeutralPercentage = total > 0 ? (float)Math.Round((double)neuCount / total * 100, 1) : 0,
            NegativePercentage = total > 0 ? (float)Math.Round((double)negCount / total * 100, 1) : 0,
            StoreId = virtualStore?.Id,
            StoreName = virtualStore?.StoreName,
            TopAspects = topAspects,
            Reviews = analyzedRows
        };
    }

    public byte[] GenerateSampleTemplateBytes()
    {
        var csvContent = new StringBuilder();
        csvContent.AppendLine("product_id,title,content,rating");
        csvContent.AppendLine("89135102,Cực kì hài lòng,Túi như mẫu chất vải rất đẹp nhiều ngăn rất ưng ý mình cảm ơn shop,5");
        csvContent.AppendLine("89135102,Cực kì hài lòng,Kiểu dáng đẹp hợp ý mình đựng được nhiều đồ mình rất hài lòng.,5");
        csvContent.AppendLine("89135102,Cực kì hài lòng,Chất lượng tốt nên mua nhé,5");
        csvContent.AppendLine("89135102,Cực kì hài lòng,Túi đẹp. Shop rất chịu chơi.....,5");
        csvContent.AppendLine("89135102,Cực kì hài lòng,\"rất ưng, đường may chắc chắn, khóa kéo nhìn cứng cáp, đã đặt thêm 2 cái.\",5");
        csvContent.AppendLine("89135102,Cực kì hài lòng,Mua dc gần 1 năm mà bền quá để nhiều đồ mà dây quai da nó ko hề đứt,5");
        csvContent.AppendLine("252296384,Không hài lòng,Nần hàng giao nhầm tiền k trả lại,2");
        csvContent.AppendLine("252296384,Không hài lòng,Quá nhỏ với dự tính và không có ngăn kéo bên trong,2");
        csvContent.AppendLine("177238136,Hài lòng,sp ổn,4");
        csvContent.AppendLine("103660156,Cực kì hài lòng,Nhìn đẹp... sang trọng!!!,5");

        return Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(csvContent.ToString())).ToArray();
    }
}



