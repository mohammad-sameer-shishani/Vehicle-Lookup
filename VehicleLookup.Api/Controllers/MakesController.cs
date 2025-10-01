using Microsoft.AspNetCore.Mvc;
using VehicleLookup.Api.Helpers;
using VehicleLookup.Api.Infrastructure.Http;
using VehicleLookup.Api.Models;
using VehicleLookup.Api.Services;

namespace VehicleLookup.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class MakesController : ControllerBase
{
    private readonly IVehicleService _vehicleService;
    public MakesController(IVehicleService vehicleService) => _vehicleService = vehicleService;

    /// Returns all car makes.
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MakeDto>>> GetAllMakes([FromQuery]PagingParams pagingParams)
    {
        var data = await _vehicleService.GetAllMakesAsync(pagingParams);
        return Ok(data);
    }
    /// Returns all car makes for search.
    [HttpGet("/getAllMakesForSearch")]
    public async Task<IActionResult> GetAllMakesForSearch()
    {
        var data = await _vehicleService.GetAllMakesForSearchAsync();
        return Ok(data);
    }

    /// Returns vehicle types for a specific make.
    [HttpGet("{makeId:int}/types")]
    public async Task<IActionResult> GetTypes([FromRoute] int makeId)
    {
        var data = await _vehicleService.GetVehicleTypesForMakeIdAsync(makeId);
        return Ok(data);
    }

    /// Returns models for a specific make and year.
    [HttpGet("{makeId:int}/models")]

    public async Task<IActionResult> GetModels([FromRoute] int makeId, [FromQuery] int year)
    {
        if (year < 1950 || year > DateTime.UtcNow.Year + 1)
            return BadRequest(new { error = "Invalid 'year' parameter." });

        var data = await _vehicleService.GetModelsForMakeIdYearAsync(makeId, year);
        return Ok(data);
    }
}
