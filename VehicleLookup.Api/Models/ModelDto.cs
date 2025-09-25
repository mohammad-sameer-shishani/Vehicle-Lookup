namespace VehicleLookup.Api.Models
{
    public class ModelDto
    {
        public int MakeId { get; set; }
        public string MakeName { get; set; } = null!;
        public int ModelId { get; set; }
        public string ModelName { get; set; }= null!;
        public int ModelYear { get; set; }
    }
}
