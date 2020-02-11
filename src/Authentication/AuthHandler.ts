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
    try {
      const codeFromTrueLayer = req.queries.code as string;
      const result = await this.exchangeCodeForToken(codeFromTrueLayer);
      if (result) {
        await this.userStore.store({accessToken: result.accessToken, refreshToken: result.refreshToken});
        return ResOf(200, "Auth succeeded" )
      }
      return ResOf(400)
    } catch(e) {
      console.log(e);
      return ResOf(500)
    }
  };

  private async exchangeCodeForToken(code: string): Promise<{accessToken: string, refreshToken: string} | undefined> {
    const body = {
      grant_type: 'authorization_code',
      client_id: process.env.CLIENT_ID!,
      client_secret: process.env.CLIENT_SECRET!,
      redirect_uri: process.env.REDIRECT_URL!,
      code: code,
    };
    const request = ReqOf(Method.POST,
      'https://auth.truelayer-sandbox.com/connect/token')
      .withForm(body);
    const responseFromTrueLayer = await this.httpsClient(request);
    const text = responseFromTrueLayer.bodyString();
    const {access_token: accessToken, refresh_token: refreshToken} = JSON.parse(text);
    return {accessToken, refreshToken}
  }
}