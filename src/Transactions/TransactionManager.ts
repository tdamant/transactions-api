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

export interface TransactionsManager {
  findAndStore(user: User): Promise<void>;
  getByUser(user: User): Promise<{accountId: string, transactions: Transaction[]}[] | undefined>
}

export interface TransactionStore extends Store<Transaction>{
  findByUserId(userId: string): Promise<Transaction[] | undefined>
}

export class RealTransactionsManager implements TransactionsManager{

  constructor(private transactionStore: TransactionStore, private trueLayerApi: TrueLayerApi) {
  }
  //todo make more effecient dont over loop
  async getByUser(user: User): Promise<{accountId: string, transactions: Transaction[]}[] | undefined> {
    const transactions = await this.transactionStore.findByUserId(user.id);
    if (!transactions) {
      return undefined
    }
    const allAccountIds = transactions.map((t) => t.accountId);
    const filteredAccountIds = [...new Set(allAccountIds)];
    return filteredAccountIds.map((accountId) => {
      return {
        accountId,
        transactions: transactions.filter((t) => t.accountId === accountId)
      }
    })
  }

  async findAndStore(user: User): Promise<void> {
    const accounts = await this.trueLayerApi.getAccounts(user.accessToken);
    if (!accounts) return;
    await Promise.all(accounts.map(async (account: MinimalAccountDetails) => {
      const transactions = await this.trueLayerApi.getTransactions(user, account.id);
      if (transactions) {
        await this.transactionStore.storeAll(transactions);
      }
    }));
  }

}

//todo remove use dept. injection
export class FakeTransactionManager implements TransactionsManager {
  constructor(private transactionStore: Store<Transaction>) {
  }

  findAndStore(user: User): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async getByUser(user: User): Promise<{ accountId: string, transactions: Transaction[] }[] | undefined> {
    const transactions = await this.transactionStore.findAll();
    if (!transactions) {
      return undefined
    }
    const userTransactions = transactions.filter((transaction) => transaction.userId === user.id);
    const allAccountIds = userTransactions.map((t) => t.accountId);
    const filteredAccountIds = [...new Set(allAccountIds)];
    return filteredAccountIds.map((accountId) => {
      return {
        accountId,
        transactions: userTransactions.filter((t) => t.accountId === accountId)
      }
    })
  }

}