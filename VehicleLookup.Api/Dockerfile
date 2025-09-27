FROM mcr.microsoft.com/dotnet/aspnet:9.0-nanoserver-ltsc2022 AS base
WORKDIR /app
EXPOSE 8081
ENV ASPNETCORE_URLS=http://+:8081

FROM mcr.microsoft.com/dotnet/sdk:9.0-nanoserver-ltsc2022 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["VehicleLookup.Api/VehicleLookup.Api.csproj", "VehicleLookup.Api/"]
RUN dotnet restore "VehicleLookup.Api/VehicleLookup.Api.csproj"
COPY . .
WORKDIR "/src/VehicleLookup.Api"
RUN dotnet publish -c %BUILD_CONFIGURATION% -o /out /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /out .
ENTRYPOINT ["dotnet", "VehicleLookup.Api.dll"]
