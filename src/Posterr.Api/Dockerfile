FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

COPY ["src/Posterr.Api/Posterr.Api.csproj", "src/Posterr.Api/"]
COPY ["src/Posterr.Core/Posterr.Core.csproj", "src/Posterr.Core/"]
COPY ["src/Posterr.Infrastructure/Posterr.Infrastructure.csproj", "src/Posterr.Infrastructure/"]

RUN dotnet restore "src/Posterr.Api/Posterr.Api.csproj"

COPY src/ src/

WORKDIR "/src/src/Posterr.Api"
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Posterr.Api.dll"]
