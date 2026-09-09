// Domain/Interfaces/IUserRepository.cs - Specialized User Repository
using HigenAbsa.Domain.Entities;

namespace HigenAbsa.Domain.Interfaces;

/// <summary>
/// Specialized repository for SystemUser entity.
/// </summary>
public interface IUserRepository : IRepository<SystemUser>
{
    /// <summary>Find user by email (case-insensitive).</summary>
    Task<SystemUser?> GetByEmailAsync(string email);
}
