import {ReqOf} from "http4js/core/Req";
import {Method} from "http4js/core/Methods";
import {expect} from "chai";
import {HttpClient} from "http4js/client/HttpClient";
import {Server} from "./Server";
import {InMemoryHandler} from "./Utils/InMemoryHandler";


describe('Routing', () => {
  const inMemoryAuthHandler = new InMemoryHandler();
  const inMemoryTransactionHandler = new InMemoryHandler();
  let server = new Server(inMemoryAuthHandler, inMemoryTransactionHandler);

  before(() => {
    server.start()
  });

  after(async () => {
    await server.stop()
  });

  it('uses AuthHandler for auth requests', async () => {
    const uri = 'http://localhost:8000/auth?code=0fhNz_-p1Tp4MrnKBTAjcX0Af78lYRW8HGGhLDHLwkI&scope=info%20accounts%20balance%20cards%20transactions%20direct_debits%20standing_orders%20offline_access';
    const trueLayerReq = ReqOf(Method.GET, uri);
    const response = await HttpClient(trueLayerReq);
    expect(response.status).to.eql(200);
    expect(inMemoryAuthHandler.requests.length).to.eql(1);
  });

  it('uses TransactionsHandler for transaction requests', async () => {
    const uri = "http://localhost:8000/transactions?user_id='test_user_id'";
    const response = await HttpClient(ReqOf(Method.GET, uri));
    expect(response.status).to.eql(200);
    expect(inMemoryTransactionHandler.requests.length).to.eql(1);
  })
});