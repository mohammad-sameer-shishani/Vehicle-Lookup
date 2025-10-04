# VehicleLookup.Api/Dockerfile
# Multi-arch .NET 9 on Debian (bookworm-slim). Use alpine if you prefer musl.
FROM mcr.microsoft.com/dotnet/aspnet:9.0-bookworm-slim AS base
WORKDIR /app
# Kestrel will listen on 8081; ALB will target this port
EXPOSE 8081
ENV ASPNETCORE_URLS=http://+:8081 \
    DOTNET_EnableDiagnostics=0 \
    ASPNETCORE_FORWARDEDHEADERS_ENABLED=true

# Optional: drop root for security
RUN useradd -r -u 64198 dotnetuser
USER dotnetuser

FROM mcr.microsoft.com/dotnet/sdk:9.0-bookworm-slim AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["VehicleLookup.Api/VehicleLookup.Api.csproj", "VehicleLookup.Api/"]
RUN dotnet restore "VehicleLookup.Api/VehicleLookup.Api.csproj"
COPY . .
WORKDIR "/src/VehicleLookup.Api"
RUN dotnet publish -c ${BUILD_CONFIGURATION} -o /out /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /out ./
ENTRYPOINT ["dotnet", "VehicleLookup.Api.dll"]
