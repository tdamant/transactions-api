import {Req, ReqOf} from "http4js/core/Req";
import {Method} from "http4js/core/Methods";
import {expect} from "chai";
import {Res, ResOf} from "http4js/core/Res";
import {AuthHandler} from "./AuthHandler";
import {InMemoryUserStore} from "../Store/UserStore";
import {HttpClient} from "../Server";
import * as queryString from "querystring";

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

  const FakeHttpClient: HttpClient = async (request: Req, successResponseBody: {} = trueLayerResponseBody,): Promise<Res> => {
    const correctMethod = request.method === Method.POST;
    const correctUri = request.uri.asUriString() === 'https://auth.truelayer-sandbox.com/connect/token';
    const correctContentHeaders = (request.headers)['content-type'] === 'application/x-www-form-urlencoded';

    if (!correctContentHeaders || !correctUri || !correctMethod) {
      return ResOf(500)
    }
    const text = request.bodyString();
    const body = queryString.parse(text);
    const code = body.code;

    if (code === codeFromTrueLayer) {
      return ResOf(200, JSON.stringify(successResponseBody))
    }
    return ResOf(401);

  };
  const inMemoryUserStore = new InMemoryUserStore();
  const authHandler = new AuthHandler(inMemoryUserStore, FakeHttpClient);

  it('responds to truelayer with the code in exchange for the access token', async () => {
    const trueLayerQueryParams = `code=${codeFromTrueLayer}&scope=info%20accounts%20balance%20cards%20transactions%20direct_debits%20standing_orders%20offline_access`;
    const trueLayerReq = ReqOf(Method.GET, `https://localhost:8000/auth?${trueLayerQueryParams}`);
    const response = await authHandler.handle(trueLayerReq);
    expect(response.status).to.eql(200);
    const users = await inMemoryUserStore.findAll();
    expect(users).to.eql([{accessToken, refreshToken}])
  })
});
