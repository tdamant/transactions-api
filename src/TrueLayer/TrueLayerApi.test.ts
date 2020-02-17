import {Req} from "http4js/core/Req";
import {ResOf} from "http4js/core/Res";
import {RealTrueLayerApi} from "./TrueLayerApi";
import {HttpClient} from "../Server";
import {expect} from "chai";
import {
  getExampleAccountResponse,
  getExampleTransactionResponse,
  getExampleTransactions
} from "../Utils/trueLayerUtils";
import {buildUser} from "../Store/User/UserStore";

describe('RealTrueLayerApi', () => {
  const user = buildUser({});
  const accountId = "f1234560abf9f57287637624def390871";
  const accountType = "TRANSACTION";
  const displayName = "Club Lloyds";
  const exampleAccountResponse = getExampleAccountResponse(accountId, accountType, displayName);
  const exampleTransactionResponse = getExampleTransactionResponse();
  const correctAccessCode = user.accessToken;
  const fakeTrueLayerHttpClient: HttpClient = async (req: Req) => {
    const authToken = req.headers.Authorization;
    if (authToken !== `Bearer ${correctAccessCode}`) {
      return ResOf(401)
    }
    const path = req.uri.path();
    if (path === '/data/v1/accounts') {
      return ResOf(200, JSON.stringify(exampleAccountResponse))
    }
    if (path === `/data/v1/accounts/${accountId}/transactions`) {
      return ResOf(200, JSON.stringify(exampleTransactionResponse))
    }
    return ResOf(404)
  };
  const trueLayerApi = new RealTrueLayerApi(fakeTrueLayerHttpClient);
  it('can get accounts', async () => {
    const accounts = await trueLayerApi.getAccounts(correctAccessCode);
    expect(accounts).to.eql([{
      id: accountId,
      accountType,
      displayName
    }])
  });
  it('can get transactions from accounts', async () => {
    const transactions = await trueLayerApi.getTransactions(user, accountId);
    expect(transactions).to.eql(getExampleTransactions(user.id, accountId))
  })
});