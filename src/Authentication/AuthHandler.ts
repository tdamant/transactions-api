import {HttpsClient} from "http4js/client/HttpsClient";
import {Req, ReqOf} from "http4js/core/Req";
import {Res, ResOf} from "http4js/core/Res";
import {Method} from "http4js/core/Methods";
import {Store} from "../Store/Store";
import {User} from "../Store/UserStore";
import {Handler, HttpClient} from "../Server";

export class AuthHandler implements Handler {
  constructor(private userStore: Store<User>, private httpsClient: HttpClient = HttpsClient) {
  };

  async handle(req: Req): Promise<Res> {
    const codeFromTrueLayer = req.queries.code;
    const body = JSON.stringify({
      grant_type: 'authorization_code',
      client_id: '1234',
      client_secret: 'abcd',
      redirect_uri: 'https://localhost:8000/test',
      code: codeFromTrueLayer,
    });
    const responseFromTrueLayer = await this.httpsClient(ReqOf(Method.GET, 'auth.truelayer-sandbox.com/connect/token', body));
    const text = responseFromTrueLayer.bodyString();
    const responseBody = JSON.parse(text);
    if (responseFromTrueLayer.status === 200 && responseBody.access_token) {
      await this.userStore.store({accessToken: responseBody.access_token, refreshToken: responseBody.refresh_token});
      return ResOf(200)
    }
    return ResOf(500)
  }
}