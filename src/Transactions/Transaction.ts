import {Store} from "../Store/Store";
import {User} from "../Store/UserStore";
import {MinimalAccountDetails, TrueLayerApi} from "../TrueLayer/TrueLayerApi";

export type Transaction = {
  "userId": string,
  "accountId": string,
  "transaction_id": string,
  "timestamp": string,
  "description": string,
  "amount": number,
  "currency": string,
  "transaction_type": string,
  "transaction_category": string,
  "transaction_classification": string[],
  "merchant_name"?: string,
  "meta": {
    "bank_transaction_id": string,
    "provider_transaction_category": string
  },
  "running_balance"?: {
    "amount": number,
    "currency": string
  },
}

export class Transactions {
  constructor(private transactionStore: Store<Transaction>, private trueLayerApi: TrueLayerApi) {
  }

  async findAndStore(user: User): Promise<void> {
    const accounts = await this.trueLayerApi.getAccounts(user.accessToken);
    if (!accounts) return;
    await Promise.all(accounts.map(async (account: MinimalAccountDetails) => {
      const transactions = await this.trueLayerApi.getTransactions(user.accessToken, account.id);
      if (transactions) {
        await this.transactionStore.storeAll(transactions);
      }
    }));
  }

}