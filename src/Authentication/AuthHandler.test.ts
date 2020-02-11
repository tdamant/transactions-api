import {Req, ReqOf} from "http4js/core/Req";
import {Method} from "http4js/core/Methods";
import {expect} from "chai";
import {Res, ResOf} from "http4js/core/Res";
import {AuthHandler} from "./AuthHandler";
import {InMemoryUserStore} from "../Store/UserStore";
import {HttpClient} from "../Server";

describe('AuthHandler', () => {
  const codeFromTrueLayer = '0fhNz_-p1Tp4MrnKBTAjcX0Af78lYRW8HGGhLDHLwkI';
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
    const text = request.bodyString();
    const body = JSON.parse(text);
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

