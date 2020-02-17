import {Req, ReqOf} from "http4js/core/Req";
import {Method} from "http4js/core/Methods";
import {expect} from "chai";
import {Res, ResOf} from "http4js/core/Res";
import {AuthHandler} from "./AuthHandler";
import {buildUser, InMemoryUserStore} from "../Store/UserStore";
import {HttpClient} from "../Server";
import * as queryString from "querystring";
import {RealTransactionsManager} from "../Transactions/TransactionManager";
import {InMemoryTransactionStore} from "../Store/TransactionStore";
import {FakeTrueLayerApi} from "../TrueLayer/TrueLayerApi";

describe('AuthHandler', () => {
  const codeFromTrueLayer = 'huMT6qKeLCzIcFSLDtCWWS51q_U6NqYj-SXhIDyCYTw';
  const accessToken = "accessRandomString";
  const refreshToken = "refreshRandomString";
  const trueLayerResponseBody = {
    "access_token": accessToken,
    "expires_in": 3600,
    "token_type": "Bearer",
    "refresh_token": refreshToken,
    "scope": "info accounts balance cards transactions direct_debits standing_orders offline_access"
  };

  //used to fake the TrueLayer api
  const FakeHttpClient: HttpClient = async (request: Req, successResponseBody: {} = trueLayerResponseBody,): Promise<Res> => {
    const correctMethod = request.method === Method.POST;
    const correctUri = request.uri.asUriString() === 'https://auth.truelayer-sandbox.com/connect/token';
    const correctContentHeaders = (request.headers)['content-type'] === 'application/x-www-form-urlencoded';

    if (!correctContentHeaders || !correctUri || !correctMethod) {
      return ResOf(401)
    }
    const text = request.bodyString();
    const body = queryString.parse(text);
    const code = body.code;

    if (code === codeFromTrueLayer) {
      return ResOf(200, JSON.stringify(successResponseBody))
    }
    return ResOf(401, JSON.stringify({response: 'unsuccessfull'}));
  };

  const inMemoryUserStore = new InMemoryUserStore();
  const transactions = new RealTransactionsManager(new InMemoryTransactionStore(), new FakeTrueLayerApi(buildUser({}), [], []));
  const authHandler = new AuthHandler(inMemoryUserStore, transactions,FakeHttpClient);

  beforeEach(() => {
    inMemoryUserStore.users = [];
  });

  const trueLayerReq = (code: string): Req => {
    const trueLayerQueryParams = `code=${code}&scope=info%20accounts%20balance%20cards%20transactions%20direct_debits%20standing_orders%20offline_access`;
    return ReqOf(Method.GET, `https://localhost:8000/auth?${trueLayerQueryParams}`);
  };

  it('return 200 and the stored userId if successfull', async () => {
    const requestFromTrueLayer = trueLayerReq(codeFromTrueLayer);
    const response = await authHandler.handle(requestFromTrueLayer);
    const user = (await inMemoryUserStore.findAll())![0];
    expect(response.status).to.eql(200);
    expect(JSON.parse(response.bodyString())).to.eql({userId: user.id})
  });

  it('stores users if code exchange successfull', async() => {
    const requestFromTrueLayer = trueLayerReq(codeFromTrueLayer);
    await authHandler.handle(requestFromTrueLayer);
    const {accessToken: storedAccessToken, refreshToken: storedRefreshToken} = (await inMemoryUserStore.findAll())![0];
    expect(storedAccessToken).to.eql(accessToken);
    expect(storedRefreshToken).to.eql(storedRefreshToken)
  });

  it('doesnt store users unless it receives an access token from Truelayer', async () => {
    const wrongCode = 'wrongCode';
    const requestWithWrongCode = trueLayerReq(wrongCode);
    await authHandler.handle(requestWithWrongCode);
    expect(inMemoryUserStore.users.length).to.eql(0)
  });
});

