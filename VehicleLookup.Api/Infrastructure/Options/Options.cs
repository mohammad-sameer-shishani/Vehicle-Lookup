namespace VehicleLookup.Api.Infrastructure.Options;

public class Options
{
    public const string SectionName = "Nhtsa";
    public string BaseUrl { get; set; } = "https://vpic.nhtsa.dot.gov/api/vehicles/";
}
