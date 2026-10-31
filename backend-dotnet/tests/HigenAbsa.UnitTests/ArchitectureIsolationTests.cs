using HigenAbsa.Modules.CoreSync.Infrastructure;
using HigenAbsa.Modules.Engagement.Infrastructure;
using HigenAbsa.Modules.Inference.Infrastructure;
using HigenAbsa.Modules.Reporting.Infrastructure;
using HigenAbsa.Modules.Security.Infrastructure;

namespace HigenAbsa.UnitTests;

public class ArchitectureIsolationTests
{
    [Fact]
    public void Modules_Should_Not_Reference_Each_Other_Directly()
    {
        var moduleAssemblies = new[]
        {
            typeof(SecurityDbContext).Assembly,
            typeof(CoreSyncDbContext).Assembly,
            typeof(InferenceDbContext).Assembly,
            typeof(EngagementDbContext).Assembly,
            typeof(ReportingDbContext).Assembly
        };

        var moduleNames = moduleAssemblies.Select(a => a.GetName().Name!).ToHashSet();

        foreach (var assembly in moduleAssemblies)
        {
            var currentName = assembly.GetName().Name!;
            var otherModules = moduleNames.Where(name => name != currentName).ToHashSet();

            var referencedModules = assembly
                .GetReferencedAssemblies()
                .Select(r => r.Name!)
                .Where(name => otherModules.Contains(name))
                .ToList();

            Assert.Empty(referencedModules);
        }
    }

    [Fact]
    public void Each_Module_DbContext_Should_Have_Unique_Isolated_Database_Schema()
    {
        var schemas = new[]
        {
            SecurityDbContext.SchemaName,
            CoreSyncDbContext.SchemaName,
            InferenceDbContext.SchemaName,
            EngagementDbContext.SchemaName,
            ReportingDbContext.SchemaName
        };

        Assert.Equal(5, schemas.Distinct().Count());
        Assert.Contains("security", schemas);
        Assert.Contains("coresync", schemas);
        Assert.Contains("inference", schemas);
        Assert.Contains("engagement", schemas);
        Assert.Contains("reporting", schemas);
    }
}

