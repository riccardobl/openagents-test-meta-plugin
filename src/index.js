const Job = require("./lib/Job.cjs");
const Nostr = require("./lib/Nostr.cjs");

async function run() {
    // get inputs for the current job
    const inputData = JSON.parse(Host.inputString());
    const { apikey, zipcode, country } = inputData;

    // prepare a sub request for another node/plugin
    Job.log("Preparing to fetch weather data in " + zipcode + ", " + country);
    const req = {
        runOn: "openagents/extism-runtime",
        expireAfter: Date.now() + 1000 * 60 * 60,
        description: "Get zip code info",
        inputs: [
            Job.newInputData(JSON.stringify({
                apikey: apikey,
                zipcode: zipcode,
                country: country
            }))
        ],
        params: [
            Job.newParam("main", "https://github.com/OpenAgentsInc/plugin-world-zipcode-finder/raw/main/plugin.wasm")
        ],
        kind: undefined,
        outputFormat: undefined
    };

    Job.log("Submiting subrequest "+JSON.stringify(req,null,2));
    const subReqId=await Job.request(req);

    Job.log("Waiting for subrequest "+subReqId);

    await Job.waitFor(subReqId);

    const subReqOutput=await Job.get(subReqId);
    Job.log("Subrequest "+subReqId+" is done. Result: "+subReqOutput.result.content+"... parsing ...");
    const results=JSON.parse(subReqOutput.result.content);
    const firstResult = results["results"][0];
    Job.log("Get weather for " + firstResult + " lat" + firstResult.latitude + " lon" + firstResult.longitude);
    const latitude = firstResult.latitude;
    const longitude = firstResult.longitude;

    // get weather data
    const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`;
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
        Host.outputString(errorMessage);
        throw new Error(errorMessage);
    }
    Job.log("Completed " + response.status + " " + response.statusText);

    Host.outputString(response.body);
}

module.exports = { run };