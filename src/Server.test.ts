import {Req, ReqOf} from "http4js/core/Req";
import {Method} from "http4js/core/Methods";
import {expect} from "chai";
import {HttpClient} from "http4js/client/HttpClient";
import {Handler, Server} from "./Server";
import {Res, ResOf} from "http4js/core/Res";


class InMemoryAuthHandler implements Handler {

  constructor() {};

  async handle (req: Req): Promise<Res> {
    return ResOf(200)
  };
}

describe('Server', () => {
  const inMemoryAuthHandler = new InMemoryAuthHandler();
  let server = new Server(inMemoryAuthHandler);

  before(() => {
    server.start()
  });

  after(async () => {
    await server.stop()
  });

  it('uses AuthHandler for auth requests', async () => {
    const trueLayerReq = ReqOf(Method.GET, 'http://localhost:8000/auth?code=0fhNz_-p1Tp4MrnKBTAjcX0Af78lYRW8HGGhLDHLwkI&scope=info%20accounts%20balance%20cards%20transactions%20direct_debits%20standing_orders%20offline_access');
    const response = await HttpClient(trueLayerReq);
    expect(response.status).to.eql(200);
  })
});