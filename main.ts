import {Server} from "./src/Server";
import {AuthHandler} from "./src/Authentication/AuthHandler";
import {SqlUserStore} from "./src/Store/UserStore";
import {PostgresMigrator} from "./src/database/postgres/PostgresMigrator";
import {PostgresDatabase} from "./src/database/postgres/PostgresDatabase";
import {Pool} from "pg";
import {getConnectionDetails, PostgresTestServer} from "./src/database/postgres/PostgresTestServer";


const getDB = async () => {
  if (process.env.NODE_ENV === 'production') {
    await new PostgresMigrator(getConnectionDetails(), './src/database/migrations').migrate();
    return new PostgresDatabase(new Pool(getConnectionDetails()));
  }
  else {
    return await new PostgresTestServer().startAndGetDB();
  }
};

const start = async () => {
  const database = await getDB();
  const sqlUserStore = new SqlUserStore(database);
  const authHandler = new AuthHandler(sqlUserStore);
  const server = new Server(authHandler);
  server.start();
};

start();


