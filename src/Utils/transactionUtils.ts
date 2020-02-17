import {Transaction} from "../Transactions/TransactionManager";
import uuid from "uuid";

export const buildTransaction = (partialTransaction: Partial<Transaction>): Transaction => {
  return {
    ...{
      userId: uuid(),
      accountId: uuid(),
      amount: 100,
      currency: 'USD',
      description: 'coat',
      merchant_name: 'Ebay',
      meta: {
        bank_transaction_id: uuid(),
        provider_transaction_category: uuid()
      },
      running_balance: {
        currency: 'USD',
        amount: 10
      },
      timestamp: new Date().toTimeString(),
      transaction_category: 'shopping',
      transaction_classification: ['ebay', 'online'],
      transaction_id: uuid(),
      transaction_type: 'retail'
    },
    ...partialTransaction
  }
};