import {routes, Routing} from "http4js/core/Routing";
import {Method} from "http4js/core/Methods";
import {Res, ResOf} from "http4js/core/Res";
import {NativeHttpServer} from "http4js/servers/NativeHttpServer";
import {HttpHandler} from "http4js/core/HttpMessage";
import {Req} from "http4js/core/Req";

export interface Handler {
  handle: HttpHandler
}

export interface HttpClient {
  (request: Req): Promise<Res>
}

export class Server {
  private server: Routing;

  constructor(private authHandler: Handler, private port: number = 8000) {
    const portToUse = process.env.PORT ? parseInt(process.env.PORT) : this.port;

    this.server = routes(Method.GET, '/health', async () => ResOf(200))
      .withGet('/auth', this.authHandler.handle)
      .asServer(new NativeHttpServer(portToUse))
  }

  start() {
    this.server.start();
    console.log(`server running on ${this.port}`)
  }

  async stop() {
    await this.server.stop()
  }
}