import {routes, Routing} from "http4js/core/Routing";
import {Method} from "http4js/core/Methods";
import {ResOf} from "http4js/core/Res";
import {NativeHttpServer} from "http4js/servers/NativeHttpServer";

export class Server {
  private server: Routing;

  constructor(private port: number = 8000) {
    this.server = routes(Method.GET, '/auth', async () => ResOf(200))
      .asServer(new NativeHttpServer(parseInt(process.env.PORT!) || this.port))
  }

  start() {
    this.server.start();
    console.log(`server running on ${this.port}`)
  }

  async stop() {
    await this.server.stop()
  }
}