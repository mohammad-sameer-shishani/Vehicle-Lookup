using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;

namespace VehicleLookup.Api.Helpers;


public class PaginatedResult<T>
{
    public PaginationMetadata Metadata { get; set; } = default!;
    public List<T> Items { get; set; }=[];
};

public class PaginationMetadata
{
    public int CurrentPage { get; set; }
    public int TotalPages { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
};

public class PaginationHelper
{
    public static async Task<PaginatedResult<T>> CreateAsync<T>(IQueryable<T> query, int pageNumber, int pageSize, string search)
    {
        if (pageNumber < 1) pageNumber = 1;
        if (pageSize <= 0) pageSize = 10;

        // --- server-side, case-insensitive search on all string props ---
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLowerInvariant();
            query = ApplySearch(query, term);
        }

        var skip = (pageNumber - 1) * pageSize;

        int totalCount;
        List<T> items;

        if (query.Provider is IAsyncQueryProvider)
        {
            totalCount = await query.CountAsync();
            items = await query.Skip(skip).Take(pageSize).ToListAsync();
        }
        else
        {
            totalCount = query.Count();
            items = query.Skip(skip).Take(pageSize).ToList();
        }


        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        return new PaginatedResult<T>
        {
            Metadata = new PaginationMetadata
            {
                CurrentPage = pageNumber,
                TotalPages = totalPages,
                PageSize = pageSize,
                TotalCount = totalCount
            },
            Items = items
        };
    }
     private static IQueryable<T> ApplySearch<T>(IQueryable<T> source, string termLower)
    {
        var stringProps = typeof(T).GetProperties()
            .Where(p => p.PropertyType == typeof(string))
            .ToArray();

        if (stringProps.Length == 0) return source; // nothing to search

        var param = Expression.Parameter(typeof(T), "x");
        var termConst = Expression.Constant(termLower, typeof(string));
        Expression? orExpr = null;

        var toLowerMethod = typeof(string).GetMethod(nameof(string.ToLower), Type.EmptyTypes)!;
        var containsMethod = typeof(string).GetMethod(nameof(string.Contains), new[] { typeof(string) })!;

        foreach (var prop in stringProps)
        {
            var propExpr = Expression.Property(param, prop);

            // prop != null
            var notNull = Expression.NotEqual(
                propExpr,
                Expression.Constant(null, typeof(string))
            );

            // prop.ToLower().Contains(termLower)
            var toLower = Expression.Call(propExpr, toLowerMethod);
            var contains = Expression.Call(toLower, containsMethod, termConst);

            var and = Expression.AndAlso(notNull, contains);
            orExpr = orExpr == null ? and : Expression.OrElse(orExpr, and);
        }

        var lambda = Expression.Lambda<Func<T, bool>>(orExpr!, param);
        return source.Where(lambda);
    }
}


