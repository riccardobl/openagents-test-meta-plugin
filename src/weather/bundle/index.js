var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../lib/Job.cjs
var require_Job = __commonJS({
  "../lib/Job.cjs"(exports2, module2) {
    var {
      Job_log,
      Job_get,
      Job_isDone,
      Job_newInputEventRef,
      Job_newInputJobRef,
      Job_newInputData,
      Job_newParam,
      Job_request,
      Job_waitFor
    } = Host.getFunctions();
    var Job2 = class _Job {
      /**
       * Log a message for the current job
       * @param {string} message 
       */
      static async log(tx) {
        console.log(tx);
        const mem = Memory.fromString(tx);
        await Job_log(mem.offset);
      }
      /**
       * Get a job by its id
       * @param {string} jobId the job id, if not provided, returns the current job
       * @returns {object}
       */
      static async get(jobId) {
        const mem = Memory.fromString(jobId || "");
        const respOffset = await Job_get(mem.offset);
        return Memory.find(respOffset).readJsonObject();
      }
      /**
       * Check if a job is done
       * @param {string} jobId 
       * @returns {boolean}
       */
      static async isDone(jobId) {
        const mem = Memory.fromString(jobId);
        const resp = await Job_isDone(mem.offset);
        return resp == 1;
      }
      /**
       * Create a new input that references to an event
       * @param {string} eventId  The event id
       * @param {string} marker  Optional marker for the input
       * @param {string} sourceRelay  Optional relay where the event is found
       * @returns {object} The input
       */
      static async newInputEventRef(eventId, marker, sourceRelay) {
        if (!sourceRelay)
          sourceRelay = "";
        if (!marker)
          marker = "";
        const memEventId = Memory.fromString(eventId);
        const memMarker = Memory.fromString(marker);
        const memSourceRelay = Memory.fromString(sourceRelay);
        const respOffset = await Job_newInputEventRef(memEventId.offset, memMarker.offset, memSourceRelay.offset);
        return Memory.find(respOffset).readJsonObject();
      }
      /**
       * Create a new input that references to a job
       * @param {string} jobId  The job id
       * @param {string} marker Optional marker for the input
       * @param {string} sourceRelay Optional relay where the job is found
       * @returns {object} The input
       */
      static async newInputJobRef(jobId, marker, sourceRelay) {
        if (!sourceRelay)
          sourceRelay = "";
        if (!marker)
          marker = "";
        const memJobId = Memory.fromString(jobId);
        const memMarker = Memory.fromString(marker);
        const memSourceRelay = Memory.fromString(sourceRelay);
        const respOffset = await Job_newInputJobRef(memJobId.offset, memMarker.offset, memSourceRelay.offset);
        return Memory.find(respOffset).readJsonObject();
      }
      /**
       * Create a new input that contains data
       * @param {string} data  The data
       * @param {string} marker Optional marker for the input
       * @returns {object} The input
       */
      static async newInputData(data, marker) {
        if (!marker)
          marker = "";
        const memData = Memory.fromString(data);
        const memMarker = Memory.fromString(marker);
        const respOffset = await Job_newInputData(memData.offset, memMarker.offset);
        return Memory.find(respOffset).readJsonObject();
      }
      /**
       * Create a new param
       * @param {string} name  The name of the param
       * @param  {...any} values  The values of the param
       * @returns {object} The param
       */
      static async newParam(name, ...values) {
        const valuesJson = JSON.stringify(values);
        const memName = Memory.fromString(name);
        const memValues = Memory.fromString(valuesJson);
        const respOffset = await Job_newParam(memName.offset, memValues.offset);
        return Memory.find(respOffset).readJsonObject();
      }
      /**
       * Request a new job
      {
              runOn:"openagents/extism-runtime",
              expireAfter:  Date.now()+1000*60*60,
              description: "Get zip code info",
              inputs: [
                  Job.newInputData(JSON.stringify(subReqInputData))
              ],
              params: [
                  Job.newParam("main","https://github.com/OpenAgentsInc/plugin-world-zipcode-finder/raw/main/plugin.wasm")
              ],
              kind: undefined,
              outputFormat: undefined
          }
       * @returns {object} The job
       */
      static async request(req) {
        const memReq = Memory.fromString(JSON.stringify(req));
        const respOffset = await Job_request(memReq.offset);
        return Memory.find(respOffset).readJsonObject();
      }
      static async waitFor(jobId) {
        jobId = await jobId;
        const mem = Memory.fromString(jobId);
        await Job_waitFor(mem.offset);
        return _Job.get(jobId);
      }
      static async pluginRequest(plugin, inputData, description, expireAfter) {
        const req = {
          runOn: "openagents/extism-runtime",
          expireAfter: expireAfter || Date.now() + 1e3 * 60 * 60,
          description: description || "",
          inputs: [
            await _Job.newInputData(JSON.stringify(inputData))
          ],
          params: [
            await _Job.newParam("main", plugin)
          ],
          kind: void 0,
          outputFormat: void 0
        };
        const subReqId = (await _Job.request(req)).id;
        return subReqId;
      }
    };
    if (typeof module2 !== "undefined")
      module2.exports = Job2;
  }
});

// ../lib/Nostr.cjs
var require_Nostr = __commonJS({
  "../lib/Nostr.cjs"(exports2, module2) {
    var {
      Nostr_sendSignedEvent,
      Nostr_subscribeToEvents,
      Nostr_unsubscribeFromEvents,
      Nostr_getEvents
    } = Host.getFunctions();
    var Nostr2 = class {
      /**
       * Send a pre-signed event to Nostr
       * @param {object} event 
       * @returns {boolean} true if the event was sent
       */
      static async sendSignedEvent(event) {
        const eventJson = JSON.stringify(event);
        const memEvent = Memory.fromString(eventJson);
        const res = await Nostr_sendSignedEvent(memEvent.offset);
        return res == 1;
      }
      /**
       * Subscribe to events
       * @param {[object]} filters
       * @returns {string} The subscription id
       */
      static async subscribeToEvents(filters) {
        const filterJson = JSON.stringify(filters);
        const memFilter = Memory.fromString(filterJson);
        const subIdOffset = await Nostr_subscribeToEvents(memFilter.offset);
        return Memory.find(subIdOffset).readString();
      }
      /** 
       * Unsubscribe from events
       * @param {string} subId
       * @returns {boolean} true if the subscription was removed 
      */
      static async unsubscribeFromEvents(subId) {
        const memSubId = Memory.fromString(subId);
        return await Nostr_unsubscribeFromEvents(memSubId.offset) == 1;
      }
      /**
       * Get events from a subscription
       * @param {string} subId 
       * @param {number} limit 
       * @returns {[object]} The events
       */
      static async getEvents(subId, limit) {
        if (!limit)
          limit = 0;
        limit = BigInt(limit);
        const memSubId = Memory.fromString(subId);
        const resOffset = await Nostr_getEvents(memSubId.offset, limit);
        return Memory.find(resOffset).readJsonObject();
      }
    };
    if (typeof module2 !== "undefined")
      module2.exports = Nostr2;
  }
});

// index.js
var Job = require_Job();
var Nostr = require_Nostr();
async function run() {
  const inputData = JSON.parse(Host.inputString());
  const { latitude, longitude } = inputData;
  Job.log("Get weather for " + latitude + " " + longitude);
  const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m`;
  Job.log("Fetching weather data from " + meteoUrl);
  const request = {
    method: "GET",
    url: meteoUrl,
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
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
  const resp = JSON.parse(response.body);
  const temperature = resp.current.temperature_2m;
  const windspeed = resp.current.wind_speed_10m;
  Host.outputString(JSON.stringify({
    temperature,
    windspeed
  }));
}
module.exports = { run };
//# sourceMappingURL=index.js.map
