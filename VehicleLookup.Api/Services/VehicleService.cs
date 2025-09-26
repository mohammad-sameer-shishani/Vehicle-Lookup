
using VehicleLookup.Api.Infrastructure.Http;
using VehicleLookup.Api.Models;

namespace VehicleLookup.Api.Services
{
    public class VehicleService : IVehicleService
    {
        private readonly HttpClient _http;

        public VehicleService(HttpClient http)
        {
            _http = http;
        }

        public async Task<IReadOnlyList<MakeDto>> GetAllMakesAsync(CancellationToken ct)
        {
            var url = "getallmakes?format=json";
            var env = await GetEnvelopeAsync<Make>(url, ct);

            return env.Results
                      .OrderBy(m => m.MakeName)
                      .Select(m => new MakeDto(m.MakeId, m.MakeName))
                      .ToList();
        }

        public async Task<IReadOnlyList<VehicleTypeDto>> GetVehicleTypesForMakeIdAsync(int makeId, CancellationToken ct)
        {
            var url = $"GetVehicleTypesForMakeId/{makeId}?format=json";
            var env = await GetEnvelopeAsync<VehicleType>(url, ct);

            return env.Results
                      .OrderBy(t => t.VehicleTypeName)
                      .Select(t => new VehicleTypeDto(t.VehicleTypeId, t.VehicleTypeName))
                      .ToList();
        }

        public async Task<IReadOnlyList<ModelDto>> GetModelsForMakeIdYearAsync(int makeId, int modelYear, CancellationToken ct)
        {
            var url = $"GetModelsForMakeIdYear/makeId/{makeId}/modelyear/{modelYear}?format=json";
            var env = await GetEnvelopeAsync<Model>(url, ct);

            return env.Results
                      .OrderBy(m => m.ModelName)
                      .Select(m => new ModelDto(m.MakeId, m.MakeName, m.ModelId, m.ModelName, modelYear))
                      .ToList();
        }

        /// <summary>
        /// Performs GET, ensures success, deserializes to the common NHTSA envelope.
        /// Throws HttpRequestException with context on failure or null body.
        /// </summary>
        private async Task<Envelope<T>> GetEnvelopeAsync<T>(string relativeUrl, CancellationToken ct)
        {
            using var resp = await _http.GetAsync(relativeUrl, ct);
            if (!resp.IsSuccessStatusCode)
            {
                var body = await SafeReadContentAsync(resp, ct);
                throw new HttpRequestException($"request failed {(int)resp.StatusCode} {resp.ReasonPhrase} for '{relativeUrl}'. Body: {body}");
            }

            var envelope = await resp.Content.ReadFromJsonAsync<Envelope<T>>(cancellationToken: ct);
            if (envelope is null)
                throw new HttpRequestException($"returned an empty or invalid JSON envelope for '{relativeUrl}'.");

            // Optional: basic sanity check
            if (envelope.Results is null)
                throw new HttpRequestException($"envelope had null Results for '{relativeUrl}'.");

            return envelope;
        }

        private static async Task<string> SafeReadContentAsync(HttpResponseMessage resp, CancellationToken ct)
        {
            try { return (await resp.Content.ReadAsStringAsync(ct))?.Trim() ?? ""; }
            catch { return ""; }
        }
    }
}
