import {Server} from "./src/Server";
import {AuthHandler} from "./src/Authentication/AuthHandler";
import {SqlUserStore} from "./src/Store/UserStore";
import {PostgresMigrator} from "./src/database/postgres/PostgresMigrator";
import {PostgresDatabase} from "./src/database/postgres/PostgresDatabase";
import {Pool} from "pg";
import {getConnectionDetails} from "./src/database/postgres/PostgresTestServer";

const start = async () => {
  await new PostgresMigrator(getConnectionDetails(), './src/database/migrations').migrate();

  const database = new PostgresDatabase(new Pool(getConnectionDetails()));
  const sqlUserStore = new SqlUserStore(database);
  const authHandler = new AuthHandler(sqlUserStore);
  const server = new Server(authHandler);
  server.start();
};

start();


