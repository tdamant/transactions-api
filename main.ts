import {Server} from "./src/Server";
import {SqlUserStore} from "./src/Store/UserStore";
import {PostgresMigrator} from "./src/database/postgres/PostgresMigrator";
import {PostgresDatabase} from "./src/database/postgres/PostgresDatabase";
import {Pool} from "pg";
import {getConnectionDetails, PostgresTestServer} from "./src/database/postgres/PostgresTestServer";
import {RealTransactionsManager} from "./src/Transactions/TransactionManager";
import {SqlTransactionStore} from "./src/Store/TransactionStore";
import {RealTrueLayerApi} from "./src/TrueLayer/TrueLayerApi";
import {InMemoryHandler} from "./src/Utils/InMemoryHandler";
import {AuthHandler} from "./src/Handlers/AuthHandler";


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
  const sqlTransactionStore = new SqlTransactionStore(database);
  const transactions = new RealTransactionsManager(sqlTransactionStore, new RealTrueLayerApi());
  const authHandler = new AuthHandler(sqlUserStore, transactions);
  const transactionHandler = new InMemoryHandler();
  const server = new Server(authHandler, transactionHandler);
  server.start();
};

start();


