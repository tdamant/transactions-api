import {PostgresTestServer} from "../database/postgres/PostgresTestServer";
import {PostgresDatabase} from "../database/postgres/PostgresDatabase";
import {expect} from "chai";
import {buildUser, randomString, SqlUserStore, User} from "./UserStore";
import {Store} from "./Store";
import {Transaction} from "../Transactions/Transaction";
import {SqlTransactionStore} from "./TransactionStore";

describe('SqlStores', function () {
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

  afterEach(async () => {
    await database.query('TRUNCATE TABLE users CASCADE;');
    await database.query('TRUNCATE TABLE transactions CASCADE;')
  });
  describe('SqlUserStore', () => {
    it('should store a user', async () => {
      const expectedUser = {
        id: randomString(),
        accessToken: randomString(),
        refreshToken: randomString()
      };
      const user = buildUser(expectedUser);
      await userStore.store(user);
      const usersInTable = (await database.query('select * from users;')).rows;
      expect(usersInTable.length).to.eql(1);
      expect(usersInTable[0]).to.eql({
        "access_token": expectedUser.accessToken,
        "id": expectedUser.id,
        "refresh_token": expectedUser.refreshToken
      })
    })
  });

  describe('SqlTransactionStore', () => {
    const transactions: Transaction[] = [
      {
        userId: 'testUserId',
        accountId: 'testAccountId',
        "transaction_id": "03c333979b729315545816aaa365c33f",
        "timestamp": "2018-03-06T00:00:00",
        "description": "GOOGLE PLAY STORE",
        "amount": -2.99,
        "currency": "GBP",
        "transaction_type": "DEBIT",
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
      },
      {
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
        "merchant_name": "Ebay",
        "meta": {
          "bank_transaction_id": "33b5555724",
          "provider_transaction_category": "DEB"
        }
      }
    ];
    it('should store multiple transactions', async () => {
      await userStore.store({id: 'testUserId'});
      const response = await transactionStore.storeAll(transactions);
      const transactionsInDb = (await database.query('select * from transactions;')).rows;
      expect(transactionsInDb.length).to.eql(2);
      expect(transactionsInDb).to.eql([
        {
          "account_id": "testAccountId",
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
          "user_id": "testUserId"
        },
        {
          "account_id": "anotherAccountId",
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
          "user_id": "testUserId"
        }
      ]);
      expect(response).to.eql(transactions)
    })
  })
});
