import {StartedTestContainer} from 'testcontainers/dist/test-container';
import {GenericContainer} from 'testcontainers';
import * as path from "path";
import {Pool} from 'pg';
import {ConnectionDetails, PostgresMigrator} from "./PostgresMigrator";
import {PostgresDatabase} from "./PostgresDatabase";

export const getConnectionDetails = (port: number = 5432): ConnectionDetails => {
  if(process.env.NODE_ENV === 'production') {
    return {
      host: `/cloudsql/transactions-api-267820:europe-west1:transactions-api`,
      user: 'postgres',
      password: process.env.POSTGRES_PASSWORD || '',
      database: 'transactions_api'
    }
  }

  return {
    host: 'localhost',
    port: port,
    user: 'postgres',
    password: '',
    database: 'transactions_api'
  }
};

export class PostgresTestServer {
  private postgres?: StartedTestContainer;

  public async start() {
    this.postgres = await new GenericContainer('postgres', '9.6-alpine')
      .withExposedPorts(5432)
      .start();
    const mappedPort = this.postgres.getMappedPort(5432);
    return {
      host: 'localhost',
      port: mappedPort,
      user: 'postgres',
      password: '',
      database: 'postgres'
    };
  }

  public async startAndGetDB(): Promise<PostgresDatabase> {
    const adminConnectionDetails = await this.start();
    await new PostgresMigrator(adminConnectionDetails, path.resolve('./src/database/bootstrap')).migrate();
    const connectionDetails = getConnectionDetails(adminConnectionDetails.port);
    await new PostgresMigrator(connectionDetails, path.resolve('./src/database/migrations')).migrate();
    return new PostgresDatabase(new Pool(connectionDetails));
  }

  public async stop() {
    await this.postgres!.stop();
  }

}