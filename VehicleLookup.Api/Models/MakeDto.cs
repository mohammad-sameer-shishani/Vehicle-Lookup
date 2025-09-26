namespace VehicleLookup.Api.Models
{
    public class MakeDto
    {
        public MakeDto(int makeId, string makeName)
        {
            MakeId = makeId;
            MakeName = makeName;
        }

        public int MakeId { get; set; }
        public string MakeName { get; set; } = null!;
    }
}
