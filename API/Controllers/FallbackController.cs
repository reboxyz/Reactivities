using System.IO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [AllowAnonymous]
    public class FallbackController: Controller
    {
        private string _contentRoot;
        public FallbackController(IHostingEnvironment env)
        {
            _contentRoot = env.ContentRootPath;
        }

        public IActionResult Index() {
            //return PhysicalFile(Path.Combine(Directory.GetCurrentDirectory(), "wwwwroot", "index.html"), "text/HTML");
            return PhysicalFile(Path.Combine(_contentRoot, "wwwroot", "index.html"), "text/HTML");
        }
    }
} 