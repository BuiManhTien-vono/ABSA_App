using System.Data;
using System.Text;
using ExcelDataReader;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using HigenAbsa.Modules.Inference.Application.Core;
using HigenAbsa.Modules.Inference.Application.DTOs;
using HigenAbsa.Modules.Inference.Domain;
using HigenAbsa.Modules.Inference.Infrastructure;
using HigenAbsa.SharedKernel.Events;

namespace HigenAbsa.Modules.Inference.Application.Services;

public class ExcelAnalysisService(
    IInferenceService inferenceService,
    InferenceDbContext db,
    IInMemoryEventBus eventBus,
    ILogger<ExcelAnalysisService> logger) : IExcelAnalysisService
{
    public async Task<ExcelAnalysisResultDto> ProcessExcelStreamAsync(
        Stream stream,
        string fileName,
        bool saveToDb = true)
    {
        ArgumentNullException.ThrowIfNull(stream);
        ArgumentException.ThrowIfNullOrWhiteSpace(fileName);

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

        for (int i = 0; i < table.Columns.Count; i++)
        {
            string colName = table.Columns[i].ColumnName.Trim().ToLowerInvariant();

            if (commentCol == -1 && (colName == "content" || colName.Contains("comment") || colName.Contains("review") ||
                                     colName.Contains("bình luận") || colName.Contains("đánh giá") ||
                                     colName.Contains("phản hồi") || colName.Contains("nội dung") ||
                                     colName.Contains("text")))
            {
                commentCol = i;
            }
            else if (productCol == -1 && (colName == "title" || colName.Contains("sản phẩm") ||
                                         colName.Contains("tên sp") ||
                                         (colName.Contains("product") && !colName.Contains("_id")) ||
                                         (colName.Contains("name") && !colName.Contains("user"))))
            {
                productCol = i;
            }
            else if (customerCol == -1 && (colName.Contains("customer") || colName.Contains("khách hàng") ||
                                          colName.Contains("buyer") || colName.Contains("người mua") ||
                                          colName.Contains("user_name") || colName.Contains("username")))
            {
                customerCol = i;
            }
            else if (ratingCol == -1 && (colName.Contains("rating") || colName.Contains("điểm") ||
                                        colName.Contains("sao") || colName.Contains("score") || colName.Contains("star")))
            {
                ratingCol = i;
            }
        }

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
        }

        if (commentCol == -1)
        {
            throw new InvalidOperationException("Could not detect review comment column in file.");
        }

        var extractedRows = new List<(string CommentText, string? ProductName, string? CustomerName, byte Rating)>();

        foreach (DataRow row in table.Rows)
        {
            string comment = row[commentCol]?.ToString()?.Trim() ?? "";
            if (string.IsNullOrWhiteSpace(comment) || comment.Length < 3) continue;

            string? prod = productCol >= 0 ? row[productCol]?.ToString()?.Trim() : null;
            string? cust = customerCol >= 0 ? row[customerCol]?.ToString()?.Trim() : null;

            byte rating = 5;
            if (ratingCol >= 0 && byte.TryParse(row[ratingCol]?.ToString()?.Trim(), out var parsedRate) && parsedRate >= 1 && parsedRate <= 5)
            {
                rating = parsedRate;
            }

            extractedRows.Add((comment, prod, cust, rating));
        }

        if (extractedRows.Count == 0)
        {
            throw new InvalidOperationException("No valid reviews found in the uploaded file.");
        }

        // Run batch AI prediction
        var texts = extractedRows.Select(r => r.CommentText).ToList();
        var predictions = await inferenceService.PredictManyAsync(texts);

        var analyzedRows = new List<AnalyzedReviewRowDto>();
        var aspectMap = new Dictionary<string, (int Total, int Pos, int Neu, int Neg)>();
        int posCount = 0, neuCount = 0, negCount = 0;
        var virtualStoreId = Guid.NewGuid();

        for (int i = 0; i < extractedRows.Count; i++)
        {
            var item = extractedRows[i];
            var pred = predictions[i];
            var reviewId = Guid.NewGuid();

            switch (pred.OverallSentiment.Label.ToUpper())
            {
                case "POS": posCount++; break;
                case "NEU": neuCount++; break;
                case "NEG": negCount++; break;
                default: posCount++; break;
            }

            foreach (var aspect in pred.AspectSentiments)
            {
                string key = $"{aspect.Macro ?? "OTHER"}___{aspect.Micro}";
                if (!aspectMap.ContainsKey(key))
                    aspectMap[key] = (0, 0, 0, 0);

                var cur = aspectMap[key];
                int p = cur.Pos + (aspect.Sentiment.Equals("POS", StringComparison.OrdinalIgnoreCase) ? 1 : 0);
                int nu = cur.Neu + (aspect.Sentiment.Equals("NEU", StringComparison.OrdinalIgnoreCase) ? 1 : 0);
                int ng = cur.Neg + (aspect.Sentiment.Equals("NEG", StringComparison.OrdinalIgnoreCase) ? 1 : 0);
                aspectMap[key] = (cur.Total + 1, p, nu, ng);
            }

            analyzedRows.Add(new AnalyzedReviewRowDto
            {
                RowIndex = i + 1,
                ProductName = item.ProductName,
                CustomerName = item.CustomerName,
                Rating = item.Rating,
                CommentText = item.CommentText,
                OverallSentiment = pred.OverallSentiment.Label,
                SentimentScore = pred.OverallSentiment.Score,
                AspectSentiments = pred.AspectSentiments
            });

            if (saveToDb)
            {
                db.ReviewAIAnalyses.Add(new ReviewAIAnalysis
                {
                    ReviewId = reviewId,
                    OverallSentiment = pred.OverallSentiment.Label,
                    SentimentScore = pred.OverallSentiment.Score,
                    IsSpam = pred.Spam,
                    IsIntentQa = pred.IntentQa,
                    CustomerInsight = pred.Insight?.CustomerInsight,
                    RootCause = pred.Insight?.RootCause,
                    BusinessRecommendation = pred.Insight?.BusinessRecommendation,
                    SuggestedSellerResponse = pred.Insight?.SuggestedSellerResponse,
                    ModelVersion = "ViSoBERT-ABSA-v8",
                    ProcessedAt = DateTimeOffset.UtcNow
                });

                foreach (var aspect in pred.AspectSentiments)
                {
                    db.ReviewAspects.Add(new ReviewAspect
                    {
                        ReviewId = reviewId,
                        MacroCategory = aspect.Macro ?? Taxonomy.MicroToMacro.GetValueOrDefault(aspect.Micro, "OTHERS"),
                        MicroAspect = aspect.Micro,
                        Sentiment = aspect.Sentiment,
                        AspectScore = aspect.AspectScore,
                        SentimentScore = aspect.SentimentScore,
                        EvidenceText = aspect.Evidence
                    });
                }

                // Notify other modules to create Review and Ticket
                await eventBus.PublishAsync(new ReviewCreatedIntegrationEvent(
                    reviewId, virtualStoreId, item.Rating, item.CommentText, DateTimeOffset.UtcNow));

                if (pred.OverallSentiment.Label == "NEG")
                {
                    await eventBus.PublishAsync(new NegativeReviewDetectedIntegrationEvent(
                        reviewId, virtualStoreId, item.CustomerName ?? "Khách hàng", "",
                        $"Khiếu nại Excel: {item.ProductName ?? "Sản phẩm"}", item.CommentText, "MEDIUM"));
                }
            }
        }

        if (saveToDb)
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
                    MicroAspect = parts[1],
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
            PositivePercentage = total > 0 ? (float)Math.Round(100.0 * posCount / total, 1) : 0,
            NeutralPercentage = total > 0 ? (float)Math.Round(100.0 * neuCount / total, 1) : 0,
            NegativePercentage = total > 0 ? (float)Math.Round(100.0 * negCount / total, 1) : 0,
            StoreId = virtualStoreId,
            StoreName = $"Excel Import - {Path.GetFileNameWithoutExtension(fileName)}",
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
