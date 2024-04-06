const { generateSecretKey, finalizeEvent, SimplePool, useWebSocketImplementation } = require("nostr-tools");
const ws=require("ws");
useWebSocketImplementation(ws);

const userPrivateKey = generateSecretKey();
const zipCodeStackApiKey = "01HTSCQSD5VKRN5N78XD0VAQ98";
const zipCode = "33162";
const jobEvent = finalizeEvent(
    {
        "kind": 5003,
        "created_at": Math.floor(Date.now() / 1000),
        "tags": [
            ["param", "run-on", "openagents/extism-runtime"],
            ["expiration", "" + Math.floor((Date.now() + 1000 * 60 * 2) / 1000)],
            ["param", "main", "https://github.com/riccardobl/openagents-test-meta-plugin/raw/master/meta.wasm"],
            ["param", "description", "Get weather data from zip code"],
            ["i", `{"apikey":"${zipCodeStackApiKey}","zipcode":"${zipCode}"}`]
        ],
        content: "",
    },
    userPrivateKey
);
const pool = new SimplePool();
let relays = ["wss://nostr.rblb.it:7777"];
pool.publish(relays, jobEvent);

pool.subscribeMany(relays,[
    {
        kinds:[7000],
        "#e":[jobEvent.id]
    }
],{
    onevent:async (event)=>{
        if(event.kind==7000){
            const status=event.tags.find(t=>t[0]=="status");
            if(status&&status[1]=="log"){
                console.log("Remote log: "+status[2]);
            }else if(status&&status[1]=="error"){
                console.error("Remote error: "+status[2]);
            }else if(status&&status[1]=="success"){
                const filter = {
                    kinds: [6003],
                    "#e": [jobEvent.id],
                    limit: 1
                };
                console.log("\n\nRemote done. Find results using filter: "+JSON.stringify(filter,null,2));
                const result=await pool.querySync(relays,filter);
                console.log("\n\nResult: "+result[0].content);
                process.exit(0);
            }

        }
    }
});