import {ReqOf} from "http4js/core/Req";
import {Method} from "http4js/core/Methods";
import {expect} from "chai";
import {HttpClient} from "http4js/client/HttpClient";
import {routes, Routing} from "http4js/core/Routing";
import {ResOf} from "http4js/core/Res";
import {NativeHttpServer} from "http4js/servers/NativeHttpServer";

class Server {
  private server: Routing;
  constructor(private port: number = 8000) {
    this.server = routes(Method.GET, '/auth', async() => ResOf(200))
      .asServer(new NativeHttpServer(this.port))
  }
  start() {
    this.server.start();
    console.log(`server running on ${this.port}`)
  }
}

describe('Server', () => {
  it('serves', async () => {
    const server = new Server();
    await server.start();
    const response = await HttpClient(ReqOf(Method.GET, 'http://localhost:8000/auth'));
    expect(response.status).to.eql(200)
  })
});