import {buildUser} from "../Store/UserStore";
import {expect} from "chai";
import {RealTransactionsManager} from "./TransactionManager";
import {FakeTrueLayerApi} from "../TrueLayer/TrueLayerApi";
import {InMemoryTransactionStore} from "../Store/TransactionStore";
import {buildTransaction} from "../Utils/transactionUtils";

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
    buildTransaction({userId: user.id, accountId: exampleAccounts[0].id}),
    buildTransaction({userId: user.id, accountId: exampleAccounts[1].id})
  ];
  it('given a user fetches and stores all transactions from TrueLayer', async () => {
    const fakeTrueLayerApi = new FakeTrueLayerApi(user, exampleAccounts,exampleTransactions);
    const transactionsManager = new RealTransactionsManager(inMemoryTransactionStore, fakeTrueLayerApi);
    await transactionsManager.findAndStore(user);
    const storedTransactions = await inMemoryTransactionStore.findAll();
    expect(storedTransactions).to.eql(exampleTransactions)
  });

  it('gets transactions by a user and returns grouped by account id', async () => {
    const fakeTrueLayerApi = new FakeTrueLayerApi(user,
      exampleAccounts,
      [...exampleTransactions, buildTransaction({})] );
    const transactionsManager = new RealTransactionsManager(inMemoryTransactionStore, fakeTrueLayerApi);
    const groupedUserTransactions = await transactionsManager.getByUser(user);
    expect(groupedUserTransactions).to.eql([{
      accountId: exampleTransactions[0].accountId,
      transactions: [exampleTransactions[0]]
    },
      {accountId: exampleTransactions[1].accountId,
      transactions: [exampleTransactions[1]]}])
  })
});