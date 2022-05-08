import fastify from "fastify";
import { IncomingMessage } from "http";
declare module "http" {
    export interface IncomingMessage {
        files: {
            [name: string] :{
                name: string,
                data: Buffer,
                size: number,
                encoding: string,
                tempFilePath: string,
                truncated: boolean,
                mimetype: string,
                md5: string,
                mv: Function
            }
        }
    }
}
declare module 'fastify' {
    export interface FastifyRequest {
        user: { guid: string }
    }
}
declare namespace NodeJS.Process.env {
    ENVIRONMENT: "DEVELOPMENT" | "STAGING" | "PRODUCTION"
}
declare namespace process {
    let env: {
        [key: string]: string
        commit_hash: string
        build_time: string
        stage: string
        version: string
        ENVIRONMENT: "DEVELOPMENT" | "STAGING" | "PRODUCTION"
    }
}
