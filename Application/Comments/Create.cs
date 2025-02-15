using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Application.Errors;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Comments
{
    public class Create
    {
        public class Command: IRequest<CommentDto> {   
            public string Body { get; set; }
            public Guid ActivityId { get; set; }
            public string Username { get; set; }  // Note! SignalR does not use HttpContext and we does we should set the logged Username explicityly 
        }

        public class Handler : IRequestHandler<Command, CommentDto>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;

            public Handler(DataContext context, IMapper mapper)
            {
                _mapper = mapper;
                _context = context;
            }

            public async Task<CommentDto> Handle(Command request, CancellationToken cancellationToken)
            {
                var activity = await _context.Activities.FindAsync(request.ActivityId);

                if (activity == null) 
                    throw new RestException(HttpStatusCode.NotFound, new { Activity = "Not found"} );

                // Note! Since SignalR does not use the HttpContext, we cannot use the IUserAccessor
                var user = await _context.Users.SingleOrDefaultAsync(x => x.UserName == request.Username);

                var comment = new Comment {
                    Author = user,
                    Activity = activity,
                    Body = request.Body,
                    CreatedAt = DateTime.Now
                };

                activity.Comments.Add(comment);

                var success = await _context.SaveChangesAsync() > 0;

                if (success) return _mapper.Map<CommentDto>(comment);  // 200 OK response
                throw new Exception("Problem saving changes");
            }
        }
    }
}