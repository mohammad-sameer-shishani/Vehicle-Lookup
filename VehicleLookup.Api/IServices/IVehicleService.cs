using VehicleLookup.Api.Helpers;
using VehicleLookup.Api.Infrastructure.Http;
using VehicleLookup.Api.Models;

namespace VehicleLookup.Api.Services
{
    public interface IVehicleService
    {
        Task<PaginatedResult<MakeDto>> GetAllMakesAsync(PagingParams pagingParams);
        Task<IEnumerable<MakeDto>> GetAllMakesForSearchAsync();
        Task<IReadOnlyList<VehicleTypeDto>> GetVehicleTypesForMakeIdAsync(int makeId);
        Task<IReadOnlyList<ModelDto>> GetModelsForMakeIdYearAsync(int makeId, int modelYear);

    }
}
