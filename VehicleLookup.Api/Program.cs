using VehicleLookup.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// Typed HttpClient for your VehicleService
builder.Services.AddHttpClient<IVehicleService, VehicleService>(http =>
{
    http.Timeout = TimeSpan.FromSeconds(15);
});

// Swagger (Swashbuckle)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new()
    {
        Title = "Vehicle Lookup API",
        Version = "v1",
        Description = "Angular + .NET API for makes, types, and models (NHTSA vPIC)."
    });

});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        policy
            .AllowAnyOrigin()   // tighten in prod if needed
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

// ---- Swagger toggle via config ----
var swaggerEnabled = app.Configuration.GetValue<bool>("Swagger:Enabled"); // e.g., true in appsettings.json

if (app.Environment.IsDevelopment() || swaggerEnabled)
{
    app.UseSwagger();
    app.UseSwaggerUI(ui =>
    {
        ui.SwaggerEndpoint("/swagger/v1/swagger.json", "Vehicle Lookup API v1");
        ui.RoutePrefix = "swagger"; // UI at /swagger
    });
}
// -----------------------------------

// CORS first (before controllers)
app.UseCors("frontend");

// Pipeline

app.MapControllers();

app.Run();
