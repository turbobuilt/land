import * as mysql from "mysql2/promise"
import * as crypto from "crypto";
import { promisify } from "util";
import moment from "moment"
import { RowDataPacket } from "mysql2/promise";
import * as fs from "fs/promises"

const NUM_BYTES = 128;
const RANDOM_BYTES_SIZE = (NUM_BYTES - 64)/8
var BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
var bs58 = require('base-x')(BASE58)
var maxChars = Math.ceil(NUM_BYTES/Math.log2(BASE58.length));
const randomFill = promisify(crypto.randomFill);

const randomBytes = promisify(crypto.randomBytes);
const randomInt = promisify(crypto.randomInt);

export var db: mysql.Pool;

export async function connect() {
    const dbConnectionSettings: mysql.PoolOptions = {
        host: process.env.MYSQL_HOST ?? '127.0.0.1',
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,  
        port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306,
        ssl: !process.env.MYSQL_HOST || process.env.MYSQL_HOST == '127.0.0.1' ? undefined : {
            // ca: await fs.readFile(process.env.CA_FILE, 'utf-8'),
            rejectUnauthorized: true,
            ca: await fs.readFile(process.env.MYSQL_CERT_FILE || "do-mysql-certificate.crt", 'utf-8'),
        },
        multipleStatements: true
    };
    db = await mysql.createPool(dbConnectionSettings);
    return db;
}

const characterArray = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const characters = {} as any;
for(var i = 0; i < characterArray.length; ++i) {
    characters[i.toString()] = characterArray[i];
}

export async function createRandomGuid(){
    var guidArray = [];
    for(var i = 0; i < 20; ++i) {
        var number = await randomInt(35) as number;
        guidArray.push(characters[number]);
    }
    var guid = guidArray.join("");
    return guid;
}

export async function createPasswordResetToken(){
    var chars = [];
    for(var i = 0; i < 35; ++i) {
        var number = await randomInt(35) as number;
        chars.push(characters[number]);
    }
    return chars.join("");
}

export async function createGuid() {
    var timestampBuffer = Buffer.alloc(8);
    timestampBuffer.writeBigUInt64BE(process.hrtime.bigint());
    var randomBytes = Buffer.alloc(RANDOM_BYTES_SIZE);
    await randomFill(randomBytes);
    var all = Buffer.concat([timestampBuffer,randomBytes])
    var allString = bs58.encode(all);
    var lengthDifference = maxChars - allString.length;
    var padding = "";
    for(var i = 0; i < lengthDifference; ++i) {
        padding += "0";
    }
    var final = padding + allString;
    return final;
}

export async function getItemByGuid(table: string, guid: any) {
    var results = await db.query("SELECT * FROM " + table + " WHERE guid=?",[guid]);
    return fixCase((results as RowDataPacket[][])[0][0]) as any;
}

export async function update(table: string, object: any, userGuid?: any) {
    if(!object)
        return null;
    if(!object.guid)
        throw new Error("Error, no object guid was given.");
    for(var key in object)
        if(object[key] === undefined)
            object[key] = null;
    var now = moment().format("YYYY-MM-DD HH:mm:ss");
    var createdAt = object.createdAt;
    delete object.createdAt;
    object.updatedAt = now;

    var guid = object.guid;

    var fields = [];
    var values = [];
    for(var field in object) {
        if(field == "guid")
            continue;
        if(field.indexOf("_") > -1)
            continue;
        let sanitized = field.replace(/[^a-z_0-9]/gi, "")
            .slice(0,50)
            .replace(/[A-Z]/g, char => "_" + char.toLowerCase())

        fields.push(sanitized + "=?");
        let value = object[field];
        if(typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)) [
            value = moment(value).format("YYYY-MM-DD HH:mm:ss")
        ]
        values.push(value)
    }
    values.push(guid);

    let query = `UPDATE ${table} SET ${fields.join(",")} WHERE guid=?`;
    if(userGuid){
        query += " AND created_by=?";
        values.push(userGuid);
    }
    await db.execute(query, values);
    object.createdAt = createdAt;
    object.guid = guid;
    return object;
}
export async function insertMany(table: string, objects: any[]) {
    let query = `INSERT INTO ${table} `
    let fields = {};
    let valuesStrings = [];
    var values = [];
    var now = moment().format("YYYY-MM-DD HH:mm:ss");
    for(let object of objects) {
        var placeholders = [];
        if(!object.guid)
            object.guid = await createGuid();
        for(var key in object)
            if(object[key] === undefined)
                object[key] = null;

        object.createdAt = now;
        object.updatedAt = now;

        for(var field in object) {
            if(field.indexOf("_") > -1)
                continue;
            let sanitized = field.replace(/[^a-z_0-9]/gi, "")
                .slice(0,50)
                .replace(/[A-Z]/g, char => "_" + char.toLowerCase())

            fields[sanitized] = true;
            placeholders.push("?")
            let value = object[field];
            if(typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)) [
                value = moment(value).format("YYYY-MM-DD HH:mm:ss")
            ]
            values.push(value)
        }
        valuesStrings.push(`(${placeholders.join(",")})`);
    }
    query += `(${Object.keys(fields).join(",")}) VALUES ` + valuesStrings.join(",");
    console.log(query);
    await db.execute(query, values);
    return objects;
}
export async function insert(table: string, object: any) {
    if(!object.guid)
        object.guid = await createGuid();
    for(var key in object)
        if(object[key] === undefined)
            object[key] = null;
    var now = moment().format("YYYY-MM-DD HH:mm:ss");

    object.createdAt = now;
    object.updatedAt = now;

    var fields = [];
    var placeholders = [];
    var values = [];
    for(var field in object) {
        if(field.indexOf("_") > -1)
            continue;
        let sanitized = field.replace(/[^a-z_0-9]/gi, "")
            .slice(0,50)
            .replace(/[A-Z]/g, char => "_" + char.toLowerCase())

        fields.push(sanitized);
        placeholders.push("?")
        let value = object[field];
        if(typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)) [
            value = moment(value).format("YYYY-MM-DD HH:mm:ss")
        ]
        values.push(value)
    }
    let query = `INSERT INTO ${table} (${fields.join(",")}) VALUES (${placeholders.join(",")})`;
    await db.execute(query, values);
    return object;
}
export async function query(query: string, values: any){ 
    let results = (await db.query(query, values)) as mysql.RowDataPacket[][];
    return fixCaseAll(results[0])
}
export async function queryOne(query: string, values: any){ 
    let results = (await db.query(query, values)) as mysql.RowDataPacket[][];
    return fixCaseAll(results[0])[0];
}
export function fixCase(object: any) {
    if(!object)
        return object;
    for(var key in object){
        if(key == "guid" || Buffer.isBuffer(object[key]))
            object[key] = object[key].toString("utf-8");
        var fixedKey = key.replace(/_[a-z]/g, str => str.slice(1).toUpperCase());
        if(key !== fixedKey) {
            object[fixedKey] = object[key];
            delete object[key];
        }
    }
    return object;
}
export function fixCaseAll(items: any[]){
    if(!items || !Array.isArray(items))
        return items;
    for(let item of items) {
        if(!item)
            continue;
        for(var key in item){
            if(item[key] && (key == "guid" || Buffer.isBuffer(item[key])))
                item[key] = item[key].toString("utf-8");
            var fixedKey = key.replace(/_[a-z]/g, str => str.slice(1).toUpperCase());
            if(key !== fixedKey) {
                item[fixedKey] = item[key];
                delete item[key];
            }
        }
    }
    return items;
}

process.on('SIGINT', async function() {
    if(db) {
        try {
            await db.end();
            process.exit(0);
        } catch(err) {
            console.error(err);
            process.exit(err ? 1 : 0);
        }
    }
});
