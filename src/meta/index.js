const Job = require("../lib/Job.cjs");
const Nostr = require("../lib/Nostr.cjs");

async function run() {
    // get inputs for the current job
    const inputData = JSON.parse(Host.inputString());
    const { apikey, zipcode, country } = inputData;

    // prepare a sub request for another node/plugin
    Job.log("Fetch longitude and latitude " + zipcode+" "+(country||""));
    const subReqOutput = await Job.waitFor(Job.pluginRequest(
        "https://github.com/OpenAgentsInc/plugin-world-zipcode-finder/raw/main/plugin.wasm",
        { 
            apikey: apikey,
            zipcode: zipcode,
            country: country
        }
    ));

    Job.log("Result: "+subReqOutput.result.content+"... parsing ...");
    const results=JSON.parse(subReqOutput.result.content);
    const firstResult = results["results"][0];

    Job.log("Fetch weather for lat" + firstResult.latitude + " lon" + firstResult.longitude);
    const latitude = firstResult.latitude;
    const longitude = firstResult.longitude;

    const subReqOutput2 = await Job.waitFor(Job.pluginRequest(
        "https://github.com/riccardobl/openagents-test-meta-plugin/raw/master/weather.wasm",
        {
            latitude: latitude,
            longitude: longitude
        }
    ));
    const results2 = JSON.parse(subReqOutput2.result.content);
    const { temperature, windspeed } = results2;    

    Host.outputString(JSON.stringify({
        temperature: temperature,
        windspeed: windspeed
    }));
}

module.exports = { run };