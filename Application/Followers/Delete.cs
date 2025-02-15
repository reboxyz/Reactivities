using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Application.Errors;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Followers
{
    public class Delete
    {
        public class Command: IRequest {   
            public string Username { get; set; }  // The 'Username' of User that we are unfollowing
        }

        public class Handler : IRequestHandler<Command>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                _userAccessor = userAccessor;
                _context = context;
            }

            public async Task<Unit> Handle(Command request, CancellationToken cancellationToken)
            {
                // Note! Observer is the current logged-in User
                var observer = await _context.Users.SingleOrDefaultAsync(x => x.UserName == _userAccessor.GetCurrentUsername());
                var target = await _context.Users.SingleOrDefaultAsync(x => x.UserName == request.Username);

                if (target == null)
                    throw new RestException(HttpStatusCode.NotFound, new {User = "Not found"});

                // Check if Following pair already exists which is an error if true
                var following = await _context.Followings.SingleOrDefaultAsync(x => 
                    x.ObserverId == observer.Id && x.TargetId == target.Id);

                if (following == null)    
                    throw new RestException(HttpStatusCode.BadRequest, new {User = "You are not following this user"});

                if (following != null) 
                {
                    _context.Followings.Remove(following);
                }
                
                var success = await _context.SaveChangesAsync() > 0;

                if (success) return Unit.Value;  // 200 OK response
                throw new Exception("Problem saving changes");
            }
        }
    }
}