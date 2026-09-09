// Domain/Interfaces/ITicketRepository.cs - Specialized Ticket Repository
using HigenAbsa.Domain.Entities;

namespace HigenAbsa.Domain.Interfaces;

/// <summary>
/// Specialized repository for Ticket entity with eager-loaded navigation properties.
/// </summary>
public interface ITicketRepository : IRepository<Ticket>
{
    /// <summary>IQueryable with Review, Customer, AssignedUser included.</summary>
    IQueryable<Ticket> QueryWithIncludes();
}
