# .NET/C# Stack Playbook

Stack-specific patterns for .NET and C# projects.

---

## Naming Conventions

| Element | Convention | Example |
| ------- | ---------- | ------- |
| Classes, Methods, Properties | PascalCase | `UserService`, `GetUserById` |
| Variables, Parameters | camelCase | `userId`, `userService` |
| Private fields | _camelCase | `_userRepository`, `_logger` |
| Constants | PascalCase | `MaxRetryCount`, `DefaultTimeout` |
| Interfaces | IPascalCase | `IUserService`, `IRepository<T>` |
| Async methods | Suffix `Async` | `GetUserAsync`, `SaveChangesAsync` |

---

## Project Structure

```text
src/
├── {Solution}.Api/              # Controllers, DTOs, Middleware
├── {Solution}.Core/             # Domain models, Interfaces, Business logic
├── {Solution}.Infrastructure/   # EF Core, External services, Implementations
└── {Solution}.Tests/            # xUnit/NUnit tests
```

---

## Common Patterns

### Dependency Injection

```csharp
// Program.cs / Startup.cs
services.AddScoped<IUserService, UserService>();
services.AddDbContext<AppDbContext>(options => 
    options.UseSqlServer(connectionString));
```

### Async/Await

- Always use `async/await` for I/O operations
- Use `ConfigureAwait(false)` in library code
- Never use `.Result` or `.Wait()` — deadlock risk
- Return `Task` not `void` for async methods

### Controller Pattern

```csharp
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetById(int id)
    {
        var user = await _userService.GetByIdAsync(id);
        return user is null ? NotFound() : Ok(user);
    }
}
```

---

## Testing (xUnit)

```csharp
public class UserServiceTests
{
    private readonly Mock<IUserRepository> _mockRepo;
    private readonly UserService _sut;

    public UserServiceTests()
    {
        _mockRepo = new Mock<IUserRepository>();
        _sut = new UserService(_mockRepo.Object);
    }

    [Fact]
    public async Task GetByIdAsync_WhenUserExists_ReturnsUser()
    {
        // Arrange
        _mockRepo.Setup(x => x.GetByIdAsync(1))
            .ReturnsAsync(new User { Id = 1, Name = "Test" });

        // Act
        var result = await _sut.GetByIdAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.Id);
    }

    [Fact]
    public async Task GetByIdAsync_WhenUserNotExists_ReturnsNull()
    {
        // Arrange
        _mockRepo.Setup(x => x.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _sut.GetByIdAsync(999);

        // Assert
        Assert.Null(result);
    }
}
```

---

## Build & Test Commands

```bash
# Build
dotnet build

# Run tests
dotnet test

# Run tests with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run specific project
dotnet test ./tests/MyProject.Tests/

# Format changed files when possible
dotnet format ./MySolution.sln --include src/MyProject/ChangedFile.cs

# EF Core migrations
dotnet ef migrations add {MigrationName}
dotnet ef database update
```

---

## Formatting Step

Before completing implementation, run `dotnet format` for the touched solution or project. Scope it to changed files with `--include` when possible, fix issues introduced by your new changes, and do not broaden cleanup for untouched files. If formatting debt appears in older code, call it out and ask whether that legacy code should be fixed as part of the task.

Example commands:

```bash
# Format only the files changed for this task
dotnet format ./MySolution.sln --include src/MyProject/ChangedFile.cs tests/MyProject.Tests/ChangedFileTests.cs

# Format a specific project when file-level targeting is not practical
dotnet format ./src/MyProject/MyProject.csproj
```

---

## Common Pitfalls

| Pitfall | Solution |
| ------- | -------- |
| Mixing sync/async | Use async all the way down |
| Not disposing DbContext | Use `using` or DI scoped lifetime |
| Circular DI dependencies | Refactor to interfaces, use `Lazy<T>` |
| Missing null checks | Enable nullable reference types (`<Nullable>enable</Nullable>`) |
| Hardcoded connection strings | Use `IConfiguration` and secrets |
