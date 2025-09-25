using System.Text.Json.Serialization;

namespace VehicleLookup.Api.Infrastructure.Http;

// Common envelope: { "Count":..., "Message":..., "Results":[ ... ] }
public record Envelope<T>(
    [property: JsonPropertyName("Count")] int Count,
    [property: JsonPropertyName("Message")] string Message,
    [property: JsonPropertyName("SearchCriteria")] string? SearchCriteria,
    [property: JsonPropertyName("Results")] IReadOnlyList<T> Results
);

// GET getallmakes
public sealed class Make
{
    [JsonPropertyName("Make_ID")] 
    public int MakeId { get; set; }
    [JsonPropertyName("Make_Name")] 
    public string MakeName { get; set; } = "";
}

// GET GetVehicleTypesForMakeId/{makeId}
public sealed class VehicleType
{
    [JsonPropertyName("VehicleTypeId")] 
    public int VehicleTypeId { get; set; }
    [JsonPropertyName("VehicleTypeName")] 
    public string VehicleTypeName { get; set; } = "";
}

// GET GetModelsForMakeIdYear/makeId/{id}/modelyear/{year}
public sealed class Model
{
    [JsonPropertyName("Make_ID")] 
    public int MakeId { get; set; }
    [JsonPropertyName("Make_Name")] 
    public string MakeName { get; set; } = "";
    [JsonPropertyName("Model_ID")] 
    public int ModelId { get; set; }
    [JsonPropertyName("Model_Name")] 
    public string ModelName { get; set; } = "";
}
