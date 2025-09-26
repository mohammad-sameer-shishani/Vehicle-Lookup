namespace VehicleLookup.Api.Models
{
    public class VehicleTypeDto
    {
        public VehicleTypeDto(int vehicleTypeId, string vehicleTypeName)
        {
            VehicleTypeId = vehicleTypeId;
            VehicleTypeName = vehicleTypeName;
        }

        public int VehicleTypeId { get; set; }
        public string VehicleTypeName { get; set; } = null!;
    }
}
