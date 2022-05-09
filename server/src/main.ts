import "./lib/startup"
import Fastify from "fastify";
import { AddressInfo } from "net";
const fileUpload = require('fastify-file-upload')
import moment from "moment";
import { connect, createGuid, createRandomGuid, fixCaseAll, insert, query, queryOne } from "./lib/db";
import migrate from "./migrations";
import fs from "fs/promises";
import path from "path";
import { ServerOptions } from "https";
import * as os from "os";
import { IncomingMessage } from "http";
import { FastifyRequest } from "fastify";
import { inspect } from "util";
import * as jwt from "jsonwebtoken";
import { createLoginRoutes, createUserRoutes } from "./features/user/user.controller";


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

type Methods = "GET" | "POST" | "PUT" | "DELETE";
const unauthenticatedRoutes = {
    "/api/user": { "POST": true },
} as { [key: string]: { [key: string]: boolean } };

const unauthenticatedRoutesRegex = [
    // { regex: /^\/api\/file/ }
]


async function main() {

    var db = await connect();
    await migrate();

    var httpsOptions: ServerOptions = null;
    const MAX_REQUEST_SIZE_UNAUTHENTICATED = 1*1024*1024;
    var app = Fastify({
        https: httpsOptions,
        bodyLimit: MAX_REQUEST_SIZE_UNAUTHENTICATED
    });
    app.register(require('fastify-formbody'))
    app.register(require('fastify-cors'), { 
        origin: ["https://www.buylandforever.com", "https://staging.buylandforever.com", "http://localhost:3070"]
    });
    app.setErrorHandler(async function(err, request, reply) {
        console.error("error", new Date().toISOString(), err);
        return reply.status(500).send({ error: "An unexpected error occurred.  Please contact support and we will help you as quick as we can.  We appreciate your business and hope that you will return after we get it fixed. Sincerely, management." });
    });
    app.addHook("onRequest", async function(req, reply) {
        if(!req.url.match(/^\/api/))
            return;
        console.log("request: ", req.url)
        if(req.headers.authorization == process.env.SERVER_KEY || (req.query as any).serverKey == process.env.SERVER_KEY) {

        } else {
            try {
                let authorization = req.headers.authorization || (req.query as any).authorization;
                var valid = jwt.verify(authorization, process.env.JWT_SECRET) as any;
                req.user = valid.data.user;
            } catch (err) {
                console.log("error accessing", req.url)
                if(err.message.indexOf("jwt must be provided") == -1)
                    console.log("jwt error is ", err)
                let url = req.url ? req.url.split("?")[0] : req.url;
                if(unauthenticatedRoutes[url]) {
                    return;
                }
                for(let routeRegex of unauthenticatedRoutesRegex) {
                    if(url.match(routeRegex.regex))
                        return;
                }
                if(err.message.indexOf("jwt must be provided") == -1)
                    console.log("jwt error is ", err)
                else
                    console.error(url, err);
                return reply.status(401).send({ error: "You are not logged in." })
            }
        }
    });

    var fileSizeLimit = 1_000_000;
    app.register(fileUpload, {
        limits: { fileSize: fileSizeLimit },
        responseOnLimit: `{"error": "That file is too big.  The limit is ${(fileSizeLimit/1000/1000)} MB"}`,
        useTempFiles: true,
        abortOnLimit: true,
        uploadTimeout: 5*60*1000 // upload for up to 20 minutes
    });
    
    app.register((instance, opts, next) => {
        createUserRoutes(instance);
        createLoginRoutes(instance);
        next();
    }, { prefix: "/api" });

    if(process.env.ENVIRONMENT === 'DEVELOPMENT') {
        app.listen(5070, "0.0.0.0", (err) => {
            if (err) 
                throw err;
            console.log(`server listening on ${(app.server.address() as AddressInfo).port}`)
        });
    } else {
        let port = 10000;
        app.listen(port, "0.0.0.0", (err) => {
            if (err) 
                throw err;
            console.log(`server listening on ${(app.server.address() as AddressInfo).port}`);
        });
    }
}

main();