using Microsoft.AspNetCore.Mvc;
using VehicleLookup.Api.Services;

namespace VehicleLookup.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class MakesController : ControllerBase
{
    private readonly IVehicleService _vehicleService;
    public MakesController(IVehicleService vehicleService) => _vehicleService = vehicleService;

    /// <summary>Returns all car makes.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAllMakes()
    {
        var data = await _vehicleService.GetAllMakesAsync();
        return Ok(data);
    }

    /// <summary>Returns vehicle types for a specific make.</summary>
    [HttpGet("{makeId:int}/types")]
    public async Task<IActionResult> GetTypes([FromRoute] int makeId)
    {
        var data = await _vehicleService.GetVehicleTypesForMakeIdAsync(makeId);
        return Ok(data);
    }

    /// <summary>Returns models for a specific make and year.</summary>
    [HttpGet("{makeId:int}/models")]

    public async Task<IActionResult> GetModels([FromRoute] int makeId, [FromQuery] int year)
    {
        if (year < 1950 || year > DateTime.UtcNow.Year + 1)
            return BadRequest(new { error = "Invalid 'year' parameter." });

        var data = await _vehicleService.GetModelsForMakeIdYearAsync(makeId, year);
        return Ok(data);
    }
}
