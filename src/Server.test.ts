import {ReqOf} from "http4js/core/Req";
import {Method} from "http4js/core/Methods";
import {expect} from "chai";
import {HttpClient} from "http4js/client/HttpClient";
import {Server} from "./Server";

describe('Server', () => {
  let server = new Server();

  before(async () => {
    server.start();
  });

  after(async () => {
    await server.stop();
  });

  it('serves', async () => {
    const response = await HttpClient(ReqOf(Method.GET, 'http://localhost:8000/auth'));
    expect(response.status).to.eql(200)
  })
});