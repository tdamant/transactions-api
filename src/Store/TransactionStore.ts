import {Store} from "./Store";
import {Transaction} from "../Transactions/Transaction";

export class InMemoryTransactionStore implements Store<Transaction> {
  private transactions: Transaction[] = [];

  async storeAll(tArray: Transaction[]): Promise<Transaction[] | undefined> {
    tArray.forEach((transaction) => this.transactions.push(transaction));
    return tArray
  }

  store(t: any): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async findAll(): Promise<Transaction[] | undefined> {
    return this.transactions
  }
}