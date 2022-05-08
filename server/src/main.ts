import "./startup"
import Fastify from "fastify";
import { AddressInfo } from "net";
const fileUpload = require('fastify-file-upload')
import moment from "moment";
import { createSessionRoutes, createUserRoutes, startBillingCron } from "./models/user";
import { createProcessRoutes, startProcessServerCron } from "./controller/process"
import { connect, createGuid, createRandomGuid, fixCaseAll, insert, query, queryOne } from "./db";
import migrate from "./migrations";
import { createFileRoutes, startProcessFilesCron } from "./models/file";
import { createPaymentRoutes, getSquareClient, loadZipCodes } from "./models/payment";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import * as tls from "tls"
import { ServerOptions } from "https";
import * as os from "os";
import { IncomingMessage } from "http";
import { FastifyRequest } from "fastify";
import { createStripeRoutes } from "./controller/stripe";
import { createFeedbackRoutes } from "./controller/feedback";
import { createAppleRoutes } from "./controller/apple";
import { checkForCompletedItems, createConvertRoutes, initConvertCron } from "./controller/convert";
import { getAvailableProcessServer, initServerStatusCrons } from "./lib/serverStatus";
import { createStandupRoutes } from "./controller/standup";
import { inspect } from "util";


let serverGuid = null;
let isMain = false;
if(os.hostname().length == "s0132wPCMPhA9mQa4cHdRXZ".length && (os.hostname()[0] == "s" || os.hostname()[0] == "p")) {
    serverGuid = os.hostname().slice(1).split('.')[0];
} else {
    // serverId is set later with a database query
    isMain = true;
}
export const serverInfo = {
    serverGuid: serverGuid,
    isMain,
    server: null as { type: "satellite" | "convert", guid: string, domainName: string },
    mainServer: null as { type: "satellite" | "convert", guid: string, domainName: string }
}
// export const mainServerHost = process.env.ENVIRONMENT == "DEVELOPMENT" ? "http://127.0.0.1" : process.env.ENVIRONMENT == "STAGING" ? "https://staging.noisedestroyer.com" : "https://www.noisedestroyer.com"


type Methods = "GET" | "POST" | "PUT" | "DELETE";
const unauthenticatedRoutes = {
    "/api/pricing": { "GET": true },
    "/api/payment": { "POST": true },
    "/api/user": { "POST": true },
    "/api/user/save-password": { POST: true },
    "/api/user/reset-password": { "POST": true },
    "/api/user/sendlink": { "POST": true },
    "/api/session": { "POST": true },
    "/api/stripe/payment-intent": { "GET": true },
    "/api/stripe/postal-code-updated": { "POST": true },
    "/api/stripe/verify-payment": { "POST": true },
    "/api/stripe/webhook": { "POST": true },
    "/api/apple/sign-in-with-apple": { "POST": true },
} as { [key: string]: { [key: string]: boolean } };

const unauthenticatedRoutesRegex = [
    // { regex: /^\/api\/file/ }
]

console.log("YOU NEED TO FIX IF THEY CANCEL APPLE SIGN IN")


// var secureContext = null as any;
// async function getContext(){
//     if(!secureContext) {
//         return await reloadCerts();
//     }
//     return secureContext;
// }
// async function reloadCerts(){
//     var certDir = path.join(__dirname, `/../greenlock/live/noisedestroyer.com`);
//     var [key, cert] = await Promise.all([
//         fs.readFile(`${certDir}/privkey.pem`),
//         fs.readFile(`${certDir}/fullchain.pem`),
//     ]);
//     secureContext = tls.createSecureContext({ key, cert }).context
//     return secureContext;
// }
// setInterval(function() {
//     reloadCerts();
// }, 24*60*60*1000);


async function main() {

    var db = await connect();
    if(serverInfo.isMain) {
        console.log("is main - checking migrations")
        await migrate();
        startBillingCron();
    }
    await loadZipCodes();
    

    if(serverInfo.isMain && !serverInfo.serverGuid) {
        let mainServers = await query("SELECT * FROM server WHERE is_main=1",[]);
        if(!mainServers.length) 
            mainServers = [await insert("server", { status: 'ACTIVE', isMain: 1 })];
        serverInfo.serverGuid = mainServers[0].guid;
    }
    let serverResults = await query("SELECT * FROM server WHERE guid=?",[serverInfo.serverGuid]);
    serverInfo.server = serverResults[0];
    serverInfo.mainServer = await queryOne("SELECT * FROM server WHERE is_main=1", []);

    // let con = await getSquareClient();
    // console.log(moment().utc().endOf("month").add(1,"hour").utcOffset(-330).startOf('month').toLocaleString()) ;//.toISOString())

    var httpsOptions: ServerOptions = null;
    if((process.env.ENVIRONMENT === "PRODUCTION" || process.env.ENVIRONMENT === "STAGING") && serverInfo.server.type == 'satellite') {
        // httpsOptions = {
        //     key: await fs.readFile("internal_key.pem"),
        //     cert: await fs.readFile("internal_cert.pem"),
        // }
    }
    var app = Fastify({
        https: httpsOptions
    });
    app.register(require('fastify-formbody'))
    app.register(require('fastify-cors'), { 
        origin: ["https://www.noisedestroyer.com", "https://staging.noisedestroyer.com", "http://localhost:3020"]
    });
    app.setErrorHandler(async function(err, request, reply) {
        console.error("error", new Date().toISOString(), err);
        return reply.status(500).send({ error: "An unexpected error occurred, and the system doesn't know what to do.  Please contact support for help.  Thank you for patience as we work to make a better product that will help people have better lives.  Sincerely, management." });
    });
    const MAX_REQUEST_SIZE_UNAUTHENTICATED = 250*1024*1024;
    app.addHook("onRequest", async function(req, reply) {
        if(!req.url.match(/^\/api/))
            return;
        console.log("request: ", req.url)
        if(req.url == '/api/user/status-change?key=FOFIRFMXSWqoPFHNFICWOIMCEW') {
            if ((req.query as any).key != 'FOFIRFMXSWqoPFHNFICWOIMCEW') {
                return reply.status(401).send({ error: "Invalid key" });
            }
        } else if(req.headers.authorization == process.env.SERVER_KEY || (req.query as any).serverKey == process.env.SERVER_KEY) {

        } else {
            try {
                let authorization = req.headers.authorization || (req.query as any).authorization;
                var valid = jwt.verify(authorization, process.env.JWT_SECRET) as any;
                req.user = valid.data.user;
            } catch (err) {
                console.log("error accessing", req.url)
                if(err.message.indexOf("jwt must be provided") == -1)
                    console.log("jwt error is ", err)
                if(!req.user) {
                    // if(parseInt(req.headers["content-length"]) > MAX_REQUEST_SIZE_UNAUTHENTICATED){
                    //     console.log("TOO BIG")
                    //     return reply.status(400).send({ error:  `That file is too big for your account.  Please upgrade to premium in order to be able to upload bigger files.  The limit is ${(MAX_REQUEST_SIZE_UNAUTHENTICATED/1000/1000)} MB`})
                    // }
                }
                let url = req.url ? req.url.split("?")[0] : req.url;
                if(unauthenticatedRoutes[url]) {
                    return;
                }
                for(let routeRegex of unauthenticatedRoutesRegex) {
                    if(url.match(routeRegex.regex))
                        return;
                }
                console.error(url, err);
                return reply.status(401).send({ error: "You are not logged in." })
            }
        }
    })
    app.addContentTypeParser('application/octet-stream', async function (req: FastifyRequest, payload: IncomingMessage) {
        let q = req.query as any;
        if(q.containsFile) {
            console.log("contains file")
            return new Promise(async (resolve, reject) => {
                let file = os.tmpdir() + "/" + await createRandomGuid();
                let handle = await fs.open(file,"w");
                let size = 0;
                payload.on("data", (chunk) => {
                    handle.write(chunk);
                    size += chunk.length;
                });
                payload.on("end", () => {
                    console.log('ended')
                    handle.close();
                    req.raw.files = {
                        file: {
                            name: q.name,
                            mimetype: q.mimeType,
                            tempFilePath: file,
                            size: size,
                            data: null, 
                            encoding: null, 
                            truncated: null, 
                            md5: null, 
                            mv: null
                        }
                    }
                    resolve(req.raw.files);
                })
                payload.on("error", async (err) => {
                    try { await fs.rm(file) } catch (err) { console.error("error remiving file")}
                    reject(err);
                });
            })
        }
    });

    var fileSizeLimit = 5*1024*1024*1024;
    app.register(fileUpload, {
        limits: { fileSize: fileSizeLimit },
        responseOnLimit: `{"error": "That file is too big.  The limit is ${(fileSizeLimit/1000/1000/1000)} GB"}`,
        useTempFiles: true,
        abortOnLimit: true,
        uploadTimeout: 20*60*1000 // upload for up to 20 minutes
    });
    
    app.register((instance, opts, next) => {
        if(serverInfo.isMain) {
            createUserRoutes(instance);
            createSessionRoutes(instance);
            createPaymentRoutes(instance);
            createStripeRoutes(instance);
            createFeedbackRoutes(instance);
            createAppleRoutes(instance);
            createFileRoutes(instance);
            createStandupRoutes(instance);

            initServerStatusCrons();
            startProcessFilesCron();
        }
        if(serverInfo.server.type == "convert") {
            console.log("Setting up convert server")
            createConvertRoutes(instance);
            checkForCompletedItems();
            initConvertCron();
        }
        if(serverInfo.server.type == "satellite") {
            createProcessRoutes(instance);
            startProcessServerCron();
        }
        next();
    }, { prefix: "/api" });

    let serving = require('fastify-static');
    app.register(serving, {
        root: path.join(__dirname, "../", 'public'),
        decorateReply: false
    })
    app.register(serving, {
        root: path.join(__dirname, "../", 'split_audio'),
        prefix: "/split_audio",
        decorateReply: false
    })
    app.register(serving, {
        root: path.join(__dirname, "../", 'cleaned_audio_parts'),
        prefix: "/cleaned_audio_parts",
        decorateReply: false
    })

    if(process.env.ENVIRONMENT === 'DEVELOPMENT') {
        app.listen(5020, "0.0.0.0", (err) => {
            if (err) 
                throw err;
            console.log(`server listening on ${(app.server.address() as AddressInfo).port}`)
        });
    } else {
        let port = 10000; //serverInfo.server.type === 'satellite' ? 443 : 10000;
        app.listen(port, "0.0.0.0", (err) => {
            if (err) 
                throw err;
            console.log(`server listening on ${(app.server.address() as AddressInfo).port}`);
        });
    }
}

main();

// delete old files
setInterval(async function(){
    await deleteOldFiles("cleaned_audio_parts") 
    await deleteOldFiles("raw_files", 2*60) 
    await deleteOldFiles("resampled_audio_mono") 
    await deleteOldFiles("split_audio")
    await deleteOldFiles("tmp") 
    await deleteOldFiles("cleaned_audio", 2*60)
    await deleteOldFiles("cleaned_audio_parts")
    await deleteOldFiles("cleaned_audio_parts_before_trim")
}, 1000*60*5)

async function deleteOldFiles(dir: string, retainedMinutes: number = 60) {
    try {
        var files = await fs.readdir(`./${dir}`);
    } catch (err) {
        return;
    }
    for(var i = 0; i < files.length; ++i){
        var stats = await fs.stat(`./${dir}/${files[i]}`);
        var minutesSinceCreated = (Date.now() - stats.ctimeMs) / 1000 / 60;
        if(minutesSinceCreated > retainedMinutes) {
            console.log(`deleting old file from ${dir}`, files[i], "minutes since created", minutesSinceCreated)
            await fs.rm(`./${dir}/${files[i]}`, { recursive: true })
        }
    }
}