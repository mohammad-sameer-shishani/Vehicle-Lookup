using System;

namespace VehicleLookup.Api.Helpers;

public class PagingParams   
{
    private const int MaxPageSize = 50;
    public int PageNumber { get; set; } = 1;
    public string Search { get; set; } = "";

    private int _pageSize = 10;
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = Math.Min(value, MaxPageSize);
    }
}
