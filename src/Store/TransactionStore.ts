import {Store} from "./Store";
import {Transaction} from "../Transactions/Transaction";
import {PostgresDatabase} from "../database/postgres/PostgresDatabase";

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

export class SqlTransactionStore implements Store<Transaction> {
  constructor(private database: PostgresDatabase) {}

  async storeAll(tArray: Transaction[]): Promise<Transaction[] | undefined> {
    const values = tArray.map((transaction: Transaction) => {
      return `(${SqlTransactionStore.mapTransactionToValues(transaction).join(', ')})`;
    }).join(', ');
    const sql = `INSERT INTO transactions VALUES ${values} RETURNING *;`;
    const rows = (await this.database.query(sql)).rows;
    //todo rebuild from query result to transaction
    if(rows.length === tArray.length) {
      return tArray
    }
  }

  store(t: Partial<Transaction>): Promise<Transaction | undefined> {
    throw new Error("Method not implemented.");
  }

  findAll(): Promise<Transaction[] | undefined> {
    throw new Error("Method not implemented.");
  }

  static mapTransactionToValues(transaction: Transaction): string[] {
    const mapping = {
      "userId": 'user_id',
      "accountId": 'account_id',
      "transaction_id": 'transaction_id',
      "timestamp": 'timestamp',
      "description": 'description',
      "amount": 'amount',
      "currency": 'currency',
      "transaction_type": 'transaction_type',
      "transaction_category": 'transaction_category',
      "transaction_classification": 'transaction_classification',
      "merchant_name": 'merchant_name',
      "meta": ['bank_transaction_id', 'provider_transaction_category'],
      "running_balance": ['running_balance_amount', 'running_balance_currency'],
    };
    const mapped = Object.entries(mapping).map(([propName, columnName]: [string, string | string[]]) => {
      // @ts-ignore
      const value = transaction[propName] || undefined;
      if (Array.isArray(value)) {
        return `'{${value}}'`
      }
        if(['meta', 'running_balance'].includes(propName)){
          // @ts-ignore
          return !!value ? Object.values(value).map((val: string | number) => `$$${val}$$`) : ['NULL', 'NULL']
        }
      return value ? `$$${value}$$` : 'NULL'
    });
    return Array.prototype.concat.apply([], mapped)
  }
}