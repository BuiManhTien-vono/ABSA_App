# Multi-stage build cho .NET Modular Monolith WebApi
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy toàn bộ solution và các csproj để restore layer cache
COPY ["HigenAbsa.slnx", "./"]
COPY ["src/Host/HigenAbsa.WebApi/HigenAbsa.WebApi.csproj", "src/Host/HigenAbsa.WebApi/"]
COPY ["src/Shared/HigenAbsa.SharedKernel/HigenAbsa.SharedKernel.csproj", "src/Shared/HigenAbsa.SharedKernel/"]
COPY ["src/Infrastructure/HigenAbsa.Infrastructure/HigenAbsa.Infrastructure.csproj", "src/Infrastructure/HigenAbsa.Infrastructure/"]
COPY ["src/Modules/Security/HigenAbsa.Modules.Security/HigenAbsa.Modules.Security.csproj", "src/Modules/Security/HigenAbsa.Modules.Security/"]
COPY ["src/Modules/CoreSync/HigenAbsa.Modules.CoreSync/HigenAbsa.Modules.CoreSync.csproj", "src/Modules/CoreSync/HigenAbsa.Modules.CoreSync/"]
COPY ["src/Modules/Inference/HigenAbsa.Modules.Inference/HigenAbsa.Modules.Inference.csproj", "src/Modules/Inference/HigenAbsa.Modules.Inference/"]
COPY ["src/Modules/Engagement/HigenAbsa.Modules.Engagement/HigenAbsa.Modules.Engagement.csproj", "src/Modules/Engagement/HigenAbsa.Modules.Engagement/"]
COPY ["src/Modules/Reporting/HigenAbsa.Modules.Reporting/HigenAbsa.Modules.Reporting.csproj", "src/Modules/Reporting/HigenAbsa.Modules.Reporting/"]
COPY ["tests/HigenAbsa.UnitTests/HigenAbsa.UnitTests.csproj", "tests/HigenAbsa.UnitTests/"]

RUN dotnet restore "HigenAbsa.slnx"

COPY . .
WORKDIR "/src/src/Host/HigenAbsa.WebApi"
RUN dotnet publish "HigenAbsa.WebApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:5058
EXPOSE 5058
ENTRYPOINT ["dotnet", "HigenAbsa.WebApi.dll"]

