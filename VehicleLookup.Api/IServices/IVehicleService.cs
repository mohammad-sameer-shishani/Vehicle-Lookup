using VehicleLookup.Api.Models;

namespace VehicleLookup.Api.Services
{
    public interface IVehicleService
    {
        Task<IReadOnlyList<MakeDto>> GetAllMakesAsync();
        Task<IReadOnlyList<VehicleTypeDto>> GetVehicleTypesForMakeIdAsync(int makeId);
        Task<IReadOnlyList<ModelDto>> GetModelsForMakeIdYearAsync(int makeId, int modelYear);

    }
}
