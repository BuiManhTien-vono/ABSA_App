// Infrastructure/Repositories/TicketRepository.cs - Specialized Ticket Repository
using Microsoft.EntityFrameworkCore;
using HigenAbsa.Domain.Entities;
using HigenAbsa.Domain.Interfaces;
using HigenAbsa.Infrastructure.Data;

namespace HigenAbsa.Infrastructure.Repositories;

public class TicketRepository : Repository<Ticket>, ITicketRepository
{
    public TicketRepository(AppDbContext context) : base(context) { }

    public IQueryable<Ticket> QueryWithIncludes()
    {
        return _dbSet
            .Include(t => t.Review).ThenInclude(r => r!.AIAnalysis)
            .Include(t => t.Review).ThenInclude(r => r!.Product)
            .Include(t => t.Review).ThenInclude(r => r!.Store)
            .Include(t => t.Customer)
            .Include(t => t.AssignedToUser);
    }
}
