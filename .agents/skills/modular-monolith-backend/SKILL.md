---
name: modular-monolith-backend
description: >-
  Standard guide and best practices for developing, refactoring, and maintaining
  C# .NET 10 Modular Monolith backends with clean schema isolation, In-Memory Event Bus,
  and cross-module contracts.
---

# Modular Monolith Backend Architecture Guide (.NET 10)

This skill provides architectural guidelines, conventions, and implementation standards for developing high-performance, maintainable **Modular Monolith** backends with C# .NET 10, inspired by enterprise server design patterns.

---

## 1. Core Principles of Modular Monolith

1. **Independent Vertical Modules**:
   - Each business capability resides within its own self-contained module under `src/Modules/<ModuleName>/`.
   - A module encapsulates its own **Domain**, **Application**, **Endpoints** (Controllers), and **Infrastructure** (DbContext).

2. **Strict Architectural Isolation**:
   - Modules **MUST NEVER** reference each other directly (`Modules_Should_Not_Reference_Each_Other_Directly`).
   - Compilation dependencies are strictly one-way towards `SharedKernel`.

3. **Isolated Database Schemas**:
   - Each module owns a dedicated database schema (e.g. `security`, `coresync`, `inference`, `engagement`, `reporting`).
   - Physical Foreign Keys are **only** permitted within the same schema.
   - Across schemas, entities reference each other logically via primary identifiers (`Guid` / `int`).

4. **Loose-Coupling Inter-Module Communication**:
   - **Asynchronous / Reactive**: Handled via `IInMemoryEventBus` and `IIntegrationEvent` / `IIntegrationEventHandler<T>`.
   - **Synchronous / Query**: Handled via Contract interfaces defined in `SharedKernel/Contracts/` and implemented by the source module.

---

## 2. Solution & Project Structure

```text
backend/
├── database/
│   └── 01_init_schemas_and_tables.sql       # DDL schema initialization script
├── src/
│   ├── Host/
│   │   └── <Project>.WebApi/                # ASP.NET Core Host, Program.cs, Middleware
│   ├── Infrastructure/
│   │   └── <Project>.Infrastructure/        # Shared In-Memory Event Bus & DI
│   ├── Modules/
│   │   ├── <ModuleA>/
│   │   │   └── <Project>.Modules.<ModuleA>/
│   │   │       ├── Application/             # DTOs, Services, Handlers, Contracts
│   │   │       ├── Domain/                  # Entities & Business Enums
│   │   │       ├── Endpoints/               # Controllers / Minimal APIs
│   │   │       ├── Infrastructure/          # Module DbContext (Schema-isolated)
│   │   │       └── <ModuleA>ModuleExtensions.cs # DI Extension Method
│   │   ├── <ModuleB>/...
│   └── Shared/
│       └── <Project>.SharedKernel/          # Result, BaseEntity, Events, Contracts
├── tests/
│   └── <Project>.UnitTests/                 # Architecture & Event Bus tests
├── Dockerfile                               # Multi-stage production container build
└── <Project>.slnx                           # Solution manifest
```

---

## 3. Communication Patterns

### Pattern A: Asynchronous Events (InMemoryEventBus)
Used for notifying actions, updating read models/summaries, and triggering automation.

1. **Define Event** in `SharedKernel/Events/`:
   ```csharp
   public sealed record ReviewCreatedIntegrationEvent(
       Guid ReviewId,
       Guid StoreId,
       int Rating,
       string Comment,
       DateTimeOffset OccurredOnUtc) : IIntegrationEvent
   {
       public Guid EventId { get; } = Guid.NewGuid();
   }
   ```
2. **Publish Event** in originating Module:
   ```csharp
   await eventBus.PublishAsync(new ReviewCreatedIntegrationEvent(review.Id, review.StoreId, review.Rating, review.Comment, DateTimeOffset.UtcNow));
   ```
3. **Handle Event** in consuming Module (`Application/Handlers/`):
   ```csharp
   public sealed class NegativeReviewDetectedEventHandler(EngagementDbContext dbContext)
       : IIntegrationEventHandler<NegativeReviewDetectedIntegrationEvent>
   {
       public async Task HandleAsync(NegativeReviewDetectedIntegrationEvent evt, CancellationToken ct = default)
       {
           // Automatically create CSKH ticket
       }
   }
   ```

### Pattern B: Synchronous Contracts (SharedKernel/Contracts)
Used when a module needs immediate query data from another module without direct dependency.

1. **Define Contract Interface & DTO** in `SharedKernel/Contracts/`:
   ```csharp
   public sealed record UserContractDto(Guid UserId, string FullName, string Email, string Role);

   public interface IUserLookupContract
   {
       Task<UserContractDto?> GetByIdAsync(Guid userId, CancellationToken ct = default);
   }
   ```
2. **Implement Contract** in owning Module (`Security`):
   ```csharp
   public class SecurityUserLookupService(SecurityDbContext db) : IUserLookupContract { ... }
   ```
3. **Register Contract in Module DI**:
   ```csharp
   services.AddScoped<IUserLookupContract, SecurityUserLookupService>();
   ```
4. **Inject Contract** in requesting Module (`Reporting`, `Engagement`, etc.):
   ```csharp
   public class AuditLogService(IUserLookupContract userLookup) { ... }
   ```

---

## 4. Verification & Testing Standards

Always maintain two architectural tests in `<Project>.UnitTests`:
1. `Modules_Should_Not_Reference_Each_Other_Directly`: Reflects on loaded module assemblies to ensure cross-module references are zero.
2. `Each_Module_DbContext_Should_Have_Unique_Isolated_Database_Schema`: Ensures all module DbContexts declare unique, isolated schema names.

