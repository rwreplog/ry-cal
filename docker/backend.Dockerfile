FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY src/backend/FamilyDashboard.slnx .
COPY src/backend/src/FamilyDashboard.Api/FamilyDashboard.Api.csproj src/FamilyDashboard.Api/
COPY src/backend/src/FamilyDashboard.Application/FamilyDashboard.Application.csproj src/FamilyDashboard.Application/
COPY src/backend/src/FamilyDashboard.Domain/FamilyDashboard.Domain.csproj src/FamilyDashboard.Domain/
COPY src/backend/src/FamilyDashboard.Infrastructure/FamilyDashboard.Infrastructure.csproj src/FamilyDashboard.Infrastructure/
COPY src/backend/tests/FamilyDashboard.Tests/FamilyDashboard.Tests.csproj tests/FamilyDashboard.Tests/
RUN dotnet restore FamilyDashboard.slnx

COPY src/backend/ .
RUN dotnet publish src/FamilyDashboard.Api -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "FamilyDashboard.Api.dll"]
