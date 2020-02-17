import {Transaction} from "../../Transactions/TransactionManager";
import {expect} from "chai";
import {SqlTransactionStore} from "./TransactionStore";
import {buildUser, SqlUserStore, User} from "../User/UserStore";
import {getExampleTransactions} from "../../Utils/trueLayerUtils";
import {randomString} from "../../Utils/random";
import {Store} from "../Store";
import {PostgresTestServer} from "../../database/postgres/PostgresTestServer";
import {PostgresDatabase} from "../../database/postgres/PostgresDatabase";


describe('SqlTransactionStore', function () {
  this.timeout(30000);
  let userStore: Store<User>;
  let transactionStore: Store<Transaction>;
  const testPostgresServer = new PostgresTestServer();
  let database: PostgresDatabase;

  before(async () => {
    database = await testPostgresServer.startAndGetDB();
    userStore = new SqlUserStore(database);
    transactionStore = new SqlTransactionStore(database);
  });

  after(async () => {
    await testPostgresServer.stop();
  });
  it('should store multiple transactions', async () => {
    const user = buildUser({});
    const transactions = getExampleTransactions(user.id, randomString());
    await userStore.store(user);
    const response = await transactionStore.storeAll(transactions);
    const transactionsInDb = (await database.query('select * from transactions;')).rows;
    expect(transactionsInDb.length).to.eql(2);
    expect(transactionsInDb).to.eql([
      {
        "account_id": transactions[0].accountId,
        "amount": "-2.99",
        "bank_transaction_id": "9882ks-00js",
        "currency": "GBP",
        "description": "GOOGLE PLAY STORE",
        "merchant_name": "Google play",
        "provider_transaction_category": "DEB",
        "running_balance_amount": "1238.6",
        "running_balance_currency": "GBP",
        "timestamp": "2018-03-06T00:00:00",
        "transaction_category": "PURCHASE",
        "transaction_classification": [
          "Entertainment",
          "Games"
        ],
        "transaction_id": "03c333979b729315545816aaa365c33f",
        "transaction_type": "DEBIT",
        "user_id": user.id
      },
      {
        "account_id": transactions[0].accountId,
        "amount": "-25.25",
        "bank_transaction_id": "33b5555724",
        "currency": "GBP",
        "description": "PAYPAL EBAY",
        "merchant_name": "Ebay",
        "provider_transaction_category": "DEB",
        "running_balance_amount": null,
        "running_balance_currency": null,
        "timestamp": "2018-02-18T00:00:00",
        "transaction_category": "PURCHASE",
        "transaction_classification": [
          "Shopping",
          "General"
        ],
        "transaction_id": "3484333edb2078e77cf2ed58f1dec11e",
        "transaction_type": "DEBIT",
        "user_id": user.id
      }
    ]);
    expect(response).to.eql(transactions)
  });

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
        "$$testUserId$$",
        "$$testAccountId$$",
        "$$03c333979b729315545816aaa365c33f$$",
        "$$2018-03-06T00:00:00$$",
        "$$GOOGLE PLAY STORE$$",
        "$$-2.99$$",
        "$$GBP$$",
        "$$DEBIT$$",
        "$$PURCHASE$$",
        "'{Entertainment,Games}'",
        "$$Google play$$",
        "$$9882ks-00js$$",
        "$$DEB$$",
        "$$1238.6$$",
        "$$GBP$$",
      ])
    });
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
        "$$testUserId$$",
        "$$anotherAccountId$$",
        "$$3484333edb2078e77cf2ed58f1dec11e$$",
        "$$2018-02-18T00:00:00$$",
        "$$PAYPAL EBAY$$",
        "$$-25.25$$",
        "$$GBP$$",
        "$$DEBIT$$",
        "$$PURCHASE$$",
        "'{Shopping,General}'",
        'NULL',
        "$$33b5555724$$",
        "$$DEB$$",
        'NULL',
        'NULL',
      ])
    })
  })
});