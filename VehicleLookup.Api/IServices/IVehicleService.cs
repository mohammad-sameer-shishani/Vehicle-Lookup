using VehicleLookup.Api.Models;

namespace VehicleLookup.Api.Services
{
    public interface IVehicleService
    {
        Task<IReadOnlyList<MakeDto>> GetAllMakesAsync(CancellationToken ct);
        Task<IReadOnlyList<VehicleTypeDto>> GetVehicleTypesForMakeIdAsync(int makeId, CancellationToken ct);
        Task<IReadOnlyList<ModelDto>> GetModelsForMakeIdYearAsync(int makeId, int modelYear, CancellationToken ct);

    }
}
