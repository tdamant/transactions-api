import {Transaction} from "../Transactions/Transaction";
import {User} from "../Store/UserStore";

export interface MinimalAccountDetails {
  "id": string,
  "accountType": string,
  "displayName": string,
}

export interface TrueLayerApi {
  getAccounts(accessToken: string): Promise<MinimalAccountDetails[] | undefined>
  getTransactions(accessToken: string, id: string): Promise<Transaction[] | undefined>
}

export class FakeTrueLayerApi implements TrueLayerApi {

  constructor(private allowedUser: User, private existingAcounts: MinimalAccountDetails[], private existingTransactions: Transaction[]) {}
  async getAccounts(accessToken: string): Promise<MinimalAccountDetails[] | undefined> {
    const validToken = accessToken === this.allowedUser.accessToken;
    return validToken ? this.existingAcounts : undefined
  }

  async getTransactions(accessToken: string, id: string): Promise<Transaction[] | undefined> {
    const validToken = accessToken === this.allowedUser.accessToken;
    if (validToken) {
      return this.existingTransactions.filter((transaction: Partial<Transaction>) => {
        return transaction.accountId === id
      })
    }
  }
}