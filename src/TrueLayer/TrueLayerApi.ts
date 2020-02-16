import {Transaction} from "../Transactions/Transaction";
import {User} from "../Store/UserStore";
import {HttpClient} from "../Server";
import {HttpsClient} from "http4js/client/HttpsClient";
import {ReqOf} from "http4js/core/Req";
import {Method} from "http4js/core/Methods";
import {Res} from "http4js/core/Res";

export interface MinimalAccountDetails {
  "id": string,
  "accountType": string,
  "displayName": string,
}

export interface TrueLayerApi {
  getAccounts(accessToken: string): Promise<MinimalAccountDetails[] | undefined>

  getTransactions(user: User, accountId: string): Promise<Transaction[] | undefined>
}

export class RealTrueLayerApi implements TrueLayerApi {
  private trueLayerBaseUrl = 'https://api.truelayer-sandbox.com';

  constructor(private httpsClient: HttpClient = HttpsClient) {
  }

  async getAccounts(accessToken: string): Promise<MinimalAccountDetails[] | undefined> {
    const path = '/data/v1/accounts';
    const response = await this.sendRequestToTrueLayer(accessToken, path);
    const accounts = JSON.parse(response.bodyString()).results;
    return accounts.map((account: any) => {
      return {id: account.account_id, accountType: account.account_type, displayName: account.display_name}
    })
  }

  async getTransactions(user: User, accountId: string): Promise<Transaction[] | undefined> {
    const path = `/data/v1/accounts/${accountId}/transactions`;
    const response = await this.sendRequestToTrueLayer(user.accessToken, path);
    const transactionsRaw = JSON.parse(response.bodyString()).results;
    return transactionsRaw.map((rawTransaction: any) => {
      return {...rawTransaction, userId: user.id, accountId}
    })
  }

  private async sendRequestToTrueLayer(accessToken: string, path: string): Promise<Res> {
    const req = ReqOf(Method.GET, `${this.trueLayerBaseUrl}${path}`, undefined, {
      'Authorization': `Bearer ${accessToken}`
    });
    return await this.httpsClient(req);
  }
}

export class FakeTrueLayerApi implements TrueLayerApi {

  constructor(private allowedUser: User, private existingAcounts: MinimalAccountDetails[], private existingTransactions: Transaction[]) {
  }

  async getAccounts(accessToken: string): Promise<MinimalAccountDetails[] | undefined> {
    const validToken = accessToken === this.allowedUser.accessToken;
    return validToken ? this.existingAcounts : undefined
  }

  async getTransactions(user: User, id: string): Promise<Transaction[] | undefined> {
    const validToken = user.accessToken === this.allowedUser.accessToken;
    if (validToken) {
      return this.existingTransactions.filter((transaction: Partial<Transaction>) => {
        return transaction.accountId === id
      })
    }
  }
}