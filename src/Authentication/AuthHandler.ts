import {HttpsClient} from "http4js/client/HttpsClient";
import {Req, ReqOf} from "http4js/core/Req";
import {Res, ResOf} from "http4js/core/Res";
import {Method} from "http4js/core/Methods";
import {Store} from "../Store/Store";
import {User} from "../Store/UserStore";
import {Handler, HttpClient} from "../Server";
import {HttpHandler} from "http4js/core/HttpMessage";

require('dotenv').config();

export class AuthHandler implements Handler {
  constructor(private userStore: Store<User>, private httpsClient: HttpClient = HttpsClient) {
  };

  handle: HttpHandler = async (req: Req): Promise<Res> => {
    const codeFromTrueLayer = req.queries.code;
    const body = {
      grant_type: 'authorization_code',
      client_id: process.env.CLIENT_ID!,
      client_secret: process.env.CLIENT_SECRET!,
      redirect_uri: process.env.REDIRECT_URL!,
      code: codeFromTrueLayer,
    };
    const request = ReqOf(Method.POST,
      'https://auth.truelayer-sandbox.com/connect/token')
      .withForm(body);
    const responseFromTrueLayer = await this.httpsClient(request);
    const text = responseFromTrueLayer.bodyString();
    const responseBody = JSON.parse(text);

    if (responseFromTrueLayer.status === 200 && responseBody.access_token) {
      await this.userStore.store({accessToken: responseBody.access_token, refreshToken: responseBody.refresh_token});
      return ResOf(200, responseBody.access_token )
    }
    return ResOf(400)
  }
}