using HigenAbsa.Modules.Inference.Application.DTOs;

namespace HigenAbsa.Modules.Inference.Application.Services;

public interface IExcelAnalysisService
{
    Task<ExcelAnalysisResultDto> ProcessExcelStreamAsync(
        Stream stream,
        string fileName,
        bool saveToDb = true);

    byte[] GenerateSampleTemplateBytes();
}
