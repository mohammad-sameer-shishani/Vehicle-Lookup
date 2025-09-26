namespace VehicleLookup.Api.Models
{
    public class ModelDto
    {
        public ModelDto(int makeId, string makeName, int modelId, string modelName, int modelYear)
        {
            MakeId = makeId;
            MakeName = makeName;
            ModelId = modelId;
            ModelName = modelName;
            ModelYear = modelYear;
        }

        public int MakeId { get; set; }
        public string MakeName { get; set; } = null!;
        public int ModelId { get; set; }
        public string ModelName { get; set; }= null!;
        public int ModelYear { get; set; }
    }
}
