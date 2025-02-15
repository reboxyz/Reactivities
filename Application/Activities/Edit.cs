using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Application.Errors;
using FluentValidation;
using MediatR;
using Persistence;

namespace Application.Activities
{
    public class Edit
    {
        public class Command: IRequest {   
            public Guid Id { get; set; }
            public String Title { get; set; }
            public String Description { get; set; }
            public String Category { get; set; }
            public DateTime? Date { get; set; }
            public String City { get; set; }
            public String Venue { get; set; }
        }

        public class CommandValidator: AbstractValidator<Command>
        {
            public CommandValidator() 
            {
                RuleFor(x => x.Title).NotEmpty();
                RuleFor(x => x.Description).NotEmpty();
                RuleFor(x => x.Category).NotEmpty();
                RuleFor(x => x.Date).NotEmpty();
                RuleFor(x => x.City).NotEmpty();
                RuleFor(x => x.Venue).NotEmpty();
            }
        }

        public class Handler : IRequestHandler<Command>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Unit> Handle(Command request, CancellationToken cancellationToken)
            {
                var activity = await _context.Activities.FindAsync(request.Id);
                
                if (activity == null)
                {
                    throw new RestException(HttpStatusCode.NotFound, new {activity = "Not found"} );
                }
               
                activity.Title = request.Title ?? activity.Title;
                activity.Description = request.Description ?? activity.Description;
                activity.Category = request.Category ?? activity.Category;
                activity.Date = request.Date ?? activity.Date;
                activity.City = request.City ?? activity.City;
                activity.Venue = request.Venue ?? activity.Venue;

                /* Bug correspondence: If there is no edited property, there is no affected record. Thus, success if false and throws Exception. 
                var success = await _context.SaveChangesAsync() > 0;

                if (success) return Unit.Value;  // 200 OK response
                throw new Exception("Problem saving changes");
                */

                try {
                   await _context.SaveChangesAsync();
                   return Unit.Value;  // 200 OK response 
                }catch(Exception ex)
                {
                    throw new Exception("Problem saving changes", ex);
                }
            }
        }
    }
}