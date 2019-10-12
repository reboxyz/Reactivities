using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Interfaces;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities
{
    public class List
    {
        public class ActivitiesEnvelope {
            public List<ActivityDto> Activities { get; set; }
            public int ActivityCount { get; set; }
        }

        public class Query: IRequest<ActivitiesEnvelope>{
            public int? Limit { get; set; }
            public int? Offset { get; set; }
            public readonly bool IsGoing;
            public readonly bool IsHost;
            public readonly DateTime? StartDate;

            public Query(int? limit, int? offset, bool isGoing, bool isHost, DateTime? startDate) 
            {
                StartDate = startDate ?? DateTime.Now;
                IsHost = isHost;
                IsGoing = isGoing;
                Limit = limit;
                Offset = offset;   
            }
        }

        public class Handler : IRequestHandler<Query, ActivitiesEnvelope>
        {
            public DataContext _context;
          
            private readonly IMapper _mapper;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IMapper mapper, IUserAccessor userAccessor)
            {
                _userAccessor = userAccessor;
                _context = context;
                _mapper = mapper;
            }

            public async Task<ActivitiesEnvelope> Handle(Query request, CancellationToken cancellationToken)
            {
                // Eager loading
                /* 
                var activities = await _context.Activities
                    .Include(x => x.UserActivities)
                    .ThenInclude(x => x.AppUser)
                    .ToListAsync();
                */
                // Lazy loading
                /*var activities = await _context.Activities
                    .ToListAsync();    
                */

                var queryable = _context.Activities
                    .Where(x => x.Date >= request.StartDate)
                    .OrderBy(x => x.Date)
                    .AsQueryable();    

                if (request.IsGoing && !request.IsHost) {
                    queryable = queryable.Where(x => x.UserActivities.Any(a => 
                    a.AppUser.UserName == _userAccessor.GetCurrentUsername()));
                }   

                // Note! Host is always 'going'
                if (request.IsHost && !request.IsGoing) {
                    queryable = queryable.Where(x => x.UserActivities.Any(a => 
                    a.AppUser.UserName == _userAccessor.GetCurrentUsername() && a.IsHost));
                }

                var activities = await queryable
                    .Skip(request.Offset ?? 0)
                    .Take(request.Limit ?? 3).ToListAsync();

                return new ActivitiesEnvelope {
                    Activities = _mapper.Map<List<Activity>, List<ActivityDto>>(activities),
                    ActivityCount = queryable.Count()  // Note! Count will the number of total Activities which is not affected by the deffered behaviour of IQueryable
                };    
            }
        }
    }
}