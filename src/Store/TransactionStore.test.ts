import {Transaction} from "../Transactions/Transaction";
import {expect} from "chai";
import {SqlTransactionStore} from "./TransactionStore";

export type ValueOf<T> = T[keyof T];

describe('TransactionSqlStore', () => {
  describe('mapTransactionToValues', () => {
    it('generates a values list in the correct column order', () => {
      const unorderedTransaction: (Transaction) = {
        "timestamp": "2018-03-06T00:00:00",
        accountId: 'testAccountId',
        "transaction_id": "03c333979b729315545816aaa365c33f",
        "description": "GOOGLE PLAY STORE",
        "amount": -2.99,
        "currency": "GBP",
        "transaction_type": "DEBIT",
        userId: 'testUserId',
        "transaction_category": "PURCHASE",
        "transaction_classification": [
          "Entertainment",
          "Games"
        ],
        "merchant_name": "Google play",
        "running_balance": {
          "amount": 1238.60,
          "currency": "GBP"
        },
        "meta": {
          "bank_transaction_id": "9882ks-00js",
          "provider_transaction_category": "DEB"
        }
      };

      expect(SqlTransactionStore.mapTransactionToValues(unorderedTransaction)).to.eql([
        "'testUserId'",
        "'testAccountId'",
        "'03c333979b729315545816aaa365c33f'",
        "'2018-03-06T00:00:00'",
        "'GOOGLE PLAY STORE'",
        "'-2.99'",
        "'GBP'",
        "'DEBIT'",
        "'PURCHASE'",
        "'{Entertainment,Games}'",
        "'Google play'",
        "'9882ks-00js'",
        "'DEB'",
        "'1238.6'",
        "'GBP'",
      ])
    })
    it('handles optional fields being undefined', () => {
      const optionalFieldsEmpty: Transaction = {
        accountId: 'anotherAccountId',
        userId: 'testUserId',
        "transaction_id": "3484333edb2078e77cf2ed58f1dec11e",
        "timestamp": "2018-02-18T00:00:00",
        "description": "PAYPAL EBAY",
        "amount": -25.25,
        "currency": "GBP",
        "transaction_type": "DEBIT",
        "transaction_category": "PURCHASE",
        "transaction_classification": [
          "Shopping",
          "General"
        ],
        "meta": {
          "bank_transaction_id": "33b5555724",
          "provider_transaction_category": "DEB"
        }
      };
      const values = SqlTransactionStore.mapTransactionToValues(optionalFieldsEmpty);
      expect(values).to.eql([
        "'testUserId'",
        "'anotherAccountId'",
        "'3484333edb2078e77cf2ed58f1dec11e'",
        "'2018-02-18T00:00:00'",
        "'PAYPAL EBAY'",
        "'-25.25'",
        "'GBP'",
        "'DEBIT'",
        "'PURCHASE'",
        "'{Shopping,General}'",
        'NULL',
        "'33b5555724'",
        "'DEB'",
        'NULL',
        'NULL',
      ])
    })
  })
});