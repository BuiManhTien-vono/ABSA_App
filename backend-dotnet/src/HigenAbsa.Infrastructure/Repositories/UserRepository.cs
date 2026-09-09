// Infrastructure/Repositories/UserRepository.cs - Specialized User Repository
using Microsoft.EntityFrameworkCore;
using HigenAbsa.Domain.Entities;
using HigenAbsa.Domain.Interfaces;
using HigenAbsa.Infrastructure.Data;

namespace HigenAbsa.Infrastructure.Repositories;

public class UserRepository : Repository<SystemUser>, IUserRepository
{
    public UserRepository(AppDbContext context) : base(context) { }

    public async Task<SystemUser?> GetByEmailAsync(string email)
    {
        return await _dbSet
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower().Trim());
    }
}
