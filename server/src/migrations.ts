import { RowDataPacket } from "mysql2";
import { createGuid, db } from "./db"

var migrations = [
    "CREATE TABLE user (guid BINARY(22) PRIMARY KEY, created_at DATETIME, INDEX (created_at), updated_at DATETIME, INDEX (updated_at), email VARCHAR(150), INDEX (email), password_hash VARCHAR(300), activated TINYINT DEFAULT 0)",
    "CREATE TABLE file (guid BINARY(22) PRIMARY KEY, created_at DATETIME, INDEX (created_at), updated_at DATETIME, INDEX (updated_at), user BINARY(22), FOREIGN KEY (user) REFERENCES user (guid), anonymous_user_token BINARY(22), INDEX (anonymous_user_token), file_name VARCHAR(150), mime_type VARCHAR(35), status VARCHAR(35), INDEX (status), size BIGINT)",
    
];

const storedProcedures = {
    
}

export default async function migrate() {
    var results = await db.query("SHOW TABLES LIKE 'migrations'") as RowDataPacket[][];

    if(results[0].length === 0) {
        await db.execute("CREATE TABLE migrations (id INT not null auto_increment primary key, name VARCHAR(100), created_at DATETIME)");
    }

    results = await db.query("SELECT * FROM migrations order by CAST(name as UNSIGNED) desc") as RowDataPacket[][];
        
    for(let migrationRecord of results[0]) {
        delete migrations[migrationRecord.name];
    }
    for(var i = 0; i < migrations.length; ++i) {
        if(!migrations[i])
            continue;
        let name = i.toString();
        console.log("running migration", name, migrations[i]);
        await db.execute(migrations[i]);
        await db.execute("INSERT INTO migrations (name, created_at) VALUES (?,NOW())",[i])
        console.log("done with migration", name);
    }

    for(let procedureName in storedProcedures) {
        let procedure = storedProcedures[procedureName];
        await db.query(procedure);
    }
    console.log("done with stored procedures")
}
