import {Handler} from "../Server";
import {Req} from "http4js/core/Req";
import {Res, ResOf} from "http4js/core/Res";

export class InMemoryHandler implements Handler {
  public requests: any[] = [];

  constructor() {
  };

  async handle(req: Req): Promise<Res> {
    this.requests.push(req);
    return ResOf(200)
  };
}