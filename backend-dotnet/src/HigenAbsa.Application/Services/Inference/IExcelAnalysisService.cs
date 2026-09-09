// Services/Inference/IExcelAnalysisService.cs - Interface for Excel review processing
using HigenAbsa.Application.DTOs.Inference;

namespace HigenAbsa.Application.Services.Inference;

public interface IExcelAnalysisService
{
    /// <summary>
    /// Reads Excel (.xlsx, .xls, .csv) stream, extracts review rows, executes batch ABSA predictions, and optionally saves to DB.
    /// </summary>
    Task<ExcelAnalysisResultDto> ProcessExcelStreamAsync(
        Stream stream,
        string fileName,
        bool saveToDb = true);

    /// <summary>
    /// Generates a sample CSV/Excel byte array template for users to fill in.
    /// </summary>
    byte[] GenerateSampleTemplateBytes();
}

