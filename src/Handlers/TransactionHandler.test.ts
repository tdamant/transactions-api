import {ReqOf} from "http4js/core/Req";
import {Method} from "http4js/core/Methods";
import {buildUser, InMemoryUserStore} from "../Store/User/UserStore";
import {expect} from "chai";
import {FakeTransactionManager, Transaction} from "../Transactions/TransactionManager";
import {InMemoryTransactionStore} from "../Store/Transaction/TransactionStore";
import {TransactionHandler} from "./TransactionHandler";
import {buildTransaction} from "../Utils/transactionUtils";

describe('TransactionHandler', async () => {
  const user = buildUser({});
  const inMemoryUserStore = new InMemoryUserStore();
  const transactionStore = new InMemoryTransactionStore();
  const fakeTransactionManager = new FakeTransactionManager(transactionStore);
  const transactionHandler = new TransactionHandler(fakeTransactionManager, inMemoryUserStore);
  before(async () => {
    await inMemoryUserStore.store(user);
    const transactions = [(buildTransaction({userId: user.id})), (buildTransaction({userId: user.id}))];
    await transactionStore.storeAll(transactions);
  });
  it('gets transactions given a user_id', async () => {
    const transactions = await transactionStore.findAll() as Transaction[];
    const req = ReqOf(Method.GET, `/transactions?user_id=${user.id}`);
    const response = await transactionHandler.handle(req);
    expect(response.status).to.eql(200);
    expect(JSON.parse(response.bodyString())).to.eql({
      response: [{
        accountId: transactions[0].accountId,
        transactions: [transactions[0]]
      },
        {
          accountId: transactions[1].accountId,
          transactions: [transactions[1]]
        }]
    })
  });
  it('returns 404 if user not found', async() => {
    const req = ReqOf(Method.GET, `/transactions?user_id=wrong_user_id`);
    const response = await transactionHandler.handle(req);
    expect(response.status).to.eql(404);
    expect(response.bodyString()).to.eql('user not found');
  });

  it('handles there being no query string', async () => {
    const req = ReqOf(Method.GET, `/transactions`);
    const response = await transactionHandler.handle(req);
    expect(response.status).to.eql(404);
    expect(response.bodyString()).to.eql('user not found');
  })
});