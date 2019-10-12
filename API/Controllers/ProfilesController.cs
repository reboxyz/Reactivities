using System.Threading.Tasks;
using Application.Profiles;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Application.Photos;
using System.Collections.Generic;
using Application.Followers;

namespace API.Controllers
{
    public class ProfilesController: BaseController
    {
        [HttpGet("{username}")]
        public async Task<ActionResult<Profile>> Get(string username) {
            return await Mediator.Send(new Details.Query{Username = username});
        }

        [HttpPut]
        public async Task<ActionResult<Unit>> Edit(Edit.Command command) {
            return await Mediator.Send(command);
        }
       
        [HttpGet("{username}/follow")]
        public async Task<ActionResult<List<Profile>>> GetFollowings(string username, string predicate) {
            return await Mediator.Send(new List.Query{ Username = username, Predicate = predicate });
        }

        [HttpGet("{username}/activities")]
        public async Task<ActionResult<List<UserActivityDto>>>  GetUserActivities(string username, string predicate) {
            return await Mediator.Send(new ListActivities.Query{Username = username, Predicate = predicate});
        }
    }
}