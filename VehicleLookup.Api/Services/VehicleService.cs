using VehicleLookup.Api.Helpers;
using VehicleLookup.Api.Infrastructure.Http;
using VehicleLookup.Api.Models;

namespace VehicleLookup.Api.Services;

public sealed class VehicleService : IVehicleService
{
    private readonly HttpClient _http;

    public VehicleService(HttpClient http)
    {
        _http = http;
        _http.BaseAddress = new Uri("https://vpic.nhtsa.dot.gov/api/vehicles/");
    }

    public async Task<PaginatedResult<MakeDto>> GetAllMakesAsync(PagingParams pagingParams)
    {
        var env = await GetEnvelopeAsync<Make>("getallmakes?format=json");

        var ordered = env.Results
            .OrderBy(x => x.MakeName)
            .Select(m => new MakeDto(m.MakeId, m.MakeName))
            .AsQueryable();

        // Run synchronous pagination in a background thread
        return await Task.Run(() =>
            PaginationHelper.CreateAsync(ordered, pagingParams.PageNumber, pagingParams.PageSize, pagingParams.Search)
        );
    }
    public async Task<IEnumerable<MakeDto>> GetAllMakesForSearchAsync()
    {
        var env = await GetEnvelopeAsync<Make>("getallmakes?format=json");

        var ordered = env.Results
            .OrderBy(x => x.MakeName)
            .Select(m => new MakeDto(m.MakeId, m.MakeName))
            .AsEnumerable();

        return ordered;
    }

    public async Task<IReadOnlyList<VehicleTypeDto>> GetVehicleTypesForMakeIdAsync(int makeId)
    {
        var env = await GetEnvelopeAsync<VehicleType>($"GetVehicleTypesForMakeId/{makeId}?format=json");

        return env.Results
                  .OrderBy(t => t.VehicleTypeName)
                  .Select(t => new VehicleTypeDto(t.VehicleTypeId, t.VehicleTypeName))
                  .ToList();
    }

    public async Task<IReadOnlyList<ModelDto>> GetModelsForMakeIdYearAsync(int makeId, int modelYear)
    {
        var env = await GetEnvelopeAsync<Model>($"GetModelsForMakeIdYear/makeId/{makeId}/modelyear/{modelYear}?format=json");

        return env.Results
                  .OrderBy(m => m.ModelName)
                  .Select(m => new ModelDto(m.MakeId, m.MakeName, m.ModelId, m.ModelName, modelYear))
                  .ToList();
    }

    private async Task<Envelope<T>> GetEnvelopeAsync<T>(string relativeUrl)
    {
        using var resp = await _http.GetAsync(relativeUrl);
        if (!resp.IsSuccessStatusCode)
        {
            var body = await SafeReadContentAsync(resp);
            throw new HttpRequestException($"request failed {(int)resp.StatusCode} {resp.ReasonPhrase} for '{relativeUrl}'. Body: {body}");
        }

        var envelope = await resp.Content.ReadFromJsonAsync<Envelope<T>>();
        if (envelope is null || envelope.Results is null)
            throw new HttpRequestException($"returned an empty/invalid JSON envelope for '{relativeUrl}'.");

        return envelope;
    }

    private static async Task<string> SafeReadContentAsync(HttpResponseMessage resp)
    {
        try { return (await resp.Content.ReadAsStringAsync())?.Trim() ?? ""; }
        catch { return ""; }
    }
}
