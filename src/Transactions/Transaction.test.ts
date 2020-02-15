import {buildUser} from "../Store/UserStore";
import {expect} from "chai";
import {Transactions} from "./Transaction";
import {FakeTrueLayerApi} from "../TrueLayer/TrueLayerApi";
import {InMemoryTransactionStore} from "../Store/TransactionStore";


describe('TransactionFetcher', () => {
  const user = buildUser({});
  const inMemoryTransactionStore = new InMemoryTransactionStore();
  const exampleAccounts = [{
    "id": "f1234560abf9f57287637624def390871",
    "accountType": "TRANSACTION",
    "displayName": "Club Lloyds",
  },
    {
      "id": "f1234560abf9f57287637624def390872",
      "accountType": "SAVINGS",
      "displayName": "Club Lloyds",
    }];
  const exampleTransactions = [
    {
      userId: user.id,
      accountId: exampleAccounts[0].id,
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
      accountId: exampleAccounts[1].id,
      userId: user.id,
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
  it('given a user fetches and stores all transactions from TrueLayer', async () => {
    const fakeTrueLayerApi = new FakeTrueLayerApi(user, exampleAccounts,exampleTransactions);
    const transactions = new Transactions(inMemoryTransactionStore, fakeTrueLayerApi);
    await transactions.findAndStore(user);
    const storedTransactions = await inMemoryTransactionStore.findAll();
    expect(storedTransactions).to.eql(exampleTransactions)
  })
});