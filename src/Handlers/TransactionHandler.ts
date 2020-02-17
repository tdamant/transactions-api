import {Handler} from "../Server";
import {TransactionsManager} from "../Transactions/TransactionManager";
import {Store} from "../Store/Store";
import {User} from "../Store/User/UserStore";
import {Req} from "http4js/core/Req";
import {Res, ResOf} from "http4js/core/Res";

export class TransactionHandler implements Handler {
  constructor(private transactionManager: TransactionsManager, private userStore: Store<User>) {
  }

  async handle(req: Req): Promise<Res> {
    const userId = req.queries.user_id as string;
    const user = await this.userStore.findById(userId);
    if (!user) {
      return ResOf(404, 'user not found')
    }
    const transactions = await this.transactionManager.getByUser(user);
    return ResOf(200, JSON.stringify({
      response: transactions
    }))
  };
}