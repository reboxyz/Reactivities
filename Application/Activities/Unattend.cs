using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Application.Errors;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities
{
    public class Unattend
    {
        public class Command: IRequest {   
            public Guid Id { get; set; }  // ActivityId
        }

        public class Handler : IRequestHandler<Command>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;
            private readonly UserManager<AppUser> _userManager;

            public Handler(DataContext context, IUserAccessor userAccessor, UserManager<AppUser> userManager)
            {
                _context = context;
                _userAccessor = userAccessor;
                _userManager = userManager;
            }

            public async Task<Unit> Handle(Command request, CancellationToken cancellationToken)
            {
                var activity = await _context.Activities.FindAsync(request.Id);

                if (activity == null) {
                    throw new RestException(HttpStatusCode.NotFound, new { Activity = "Could not find activity"});
                }

                var user =  await _userManager.Users.SingleOrDefaultAsync(x => x.UserName == _userAccessor.GetCurrentUsername());

                // Check if User is already in the attendance
                var attendance = await _context.UserActivities
                    .SingleOrDefaultAsync(x => x.ActivityId == activity.Id && x.AppUserId == user.Id);

                if (attendance == null) {
                    return Unit.Value;      // Note! Bad request is unnecessary
                }

                // Host cannot unattend check
                if (attendance.IsHost) {
                    throw new RestException(HttpStatusCode.BadRequest, new { Attendance = "You cannot remove yourself as host"});
                }

                _context.UserActivities.Remove(attendance);

                var success = await _context.SaveChangesAsync() > 0;

                if (success) return Unit.Value;  // 200 OK response
                throw new Exception("Problem saving changes");
            }
        }
    }
}