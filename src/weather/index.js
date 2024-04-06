const Job = require("../lib/Job.cjs");
const Nostr = require("../lib/Nostr.cjs");

async function run() {
    const inputData = JSON.parse(Host.inputString());
    const { latitude, longitude } = inputData;

    Job.log("Get weather for " + latitude+" "+longitude);
 
    // get weather data
    const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m`;
    Job.log("Fetching weather data from " + meteoUrl);

    const request = {
        method: "GET",
        url: meteoUrl,
        headers: {
            "Content-Type": "application/json",
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
        }
    };
    const response = Http.request(request);
    if (response.status !== 200) {
        const errorMessage = `Error ${response.status}: ${response.statusText}`;
        Job.log("Failed " + errorMessage);
        Host.outputString(JSON.stringify({ error: errorMessage }));
        return;
    }
    Job.log("Completed " + response.status + " " + response.body);
    const resp=JSON.parse(response.body);
    const temperature=resp.current.temperature_2m;
    const windspeed=resp.current.wind_speed_10m;

    Host.outputString(JSON.stringify({
        temperature: temperature,
        windspeed: windspeed
    }));
}

module.exports = { run };