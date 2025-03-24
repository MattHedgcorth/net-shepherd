using System.Diagnostics;
using System.Net;
using Microsoft.AspNetCore.Mvc;

namespace WebsiteStatusApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WebsiteStatusController : ControllerBase
{
    private readonly ILogger<WebsiteStatusController> _logger;
    private readonly HttpClient _httpClient;

    public WebsiteStatusController(ILogger<WebsiteStatusController> logger, IHttpClientFactory httpClientFactory)
    {
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient("WebsiteStatus");
        _httpClient.Timeout = TimeSpan.FromSeconds(5);
        
        // Configure HttpClient to handle redirects
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "NetShepherd-WebsiteStatusChecker");
    }

    [HttpGet("check")]
    public async Task<IActionResult> CheckWebsite([FromQuery] string url)
    {
        if (string.IsNullOrEmpty(url))
        {
            return BadRequest("URL is required");
        }

        try
        {
            _logger.LogInformation("Checking website status for {Url}", url);
            
            // Create a request message to have more control
            var request = new HttpRequestMessage(HttpMethod.Head, url);
            
            var stopwatch = Stopwatch.StartNew();
            
            // First try a HEAD request which is faster
            var response = await _httpClient.SendAsync(request);
            
            // If HEAD is not supported, try GET
            if (response.StatusCode == HttpStatusCode.MethodNotAllowed)
            {
                _logger.LogInformation("HEAD not supported for {Url}, trying GET", url);
                request = new HttpRequestMessage(HttpMethod.Get, url);
                response = await _httpClient.SendAsync(request);
            }
            
            stopwatch.Stop();
            var responseTime = stopwatch.ElapsedMilliseconds;

            _logger.LogInformation("Website {Url} returned status code {StatusCode} in {ResponseTime}ms",
                url, (int)response.StatusCode, responseTime);

            return Ok(new
            {
                Url = url,
                StatusCode = (int)response.StatusCode,
                ResponseTime = responseTime,
                IsRunning = response.StatusCode == HttpStatusCode.OK
            });
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Error checking website {Url}", url);
            
            int statusCode = 503; // Default to Service Unavailable
            
            // Try to extract status code from exception if available
            if (ex.StatusCode.HasValue)
            {
                statusCode = (int)ex.StatusCode.Value;
            }
            
            return Ok(new
            {
                Url = url,
                StatusCode = statusCode,
                ResponseTime = 0,
                IsRunning = false,
                Error = ex.Message
            });
        }
        catch (TaskCanceledException ex)
        {
            _logger.LogError(ex, "Timeout checking website {Url}", url);
            
            return Ok(new
            {
                Url = url,
                StatusCode = 408, // Request Timeout
                ResponseTime = 0,
                IsRunning = false,
                Error = "Request timed out"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error checking website {Url}", url);
            
            return Ok(new
            {
                Url = url,
                StatusCode = 500, // Internal Server Error
                ResponseTime = 0,
                IsRunning = false,
                Error = ex.Message
            });
        }
    }
}