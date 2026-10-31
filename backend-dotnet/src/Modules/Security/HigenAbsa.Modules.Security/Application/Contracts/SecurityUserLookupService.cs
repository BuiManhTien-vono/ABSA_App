using Microsoft.EntityFrameworkCore;
using HigenAbsa.Modules.Security.Infrastructure;
using HigenAbsa.SharedKernel.Contracts;

namespace HigenAbsa.Modules.Security.Application.Contracts;

public class SecurityUserLookupService(SecurityDbContext dbContext) : IUserLookupContract
{
    public async Task<UserContractDto?> GetByIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await dbContext.SystemUsers
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        return user is null ? null : new UserContractDto(user.Id, user.FullName, user.Email, user.Role, user.IsActive);
    }

    public async Task<UserContractDto?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var user = await dbContext.SystemUsers
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower(), cancellationToken);

        return user is null ? null : new UserContractDto(user.Id, user.FullName, user.Email, user.Role, user.IsActive);
    }
}

