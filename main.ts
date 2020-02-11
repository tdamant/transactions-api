import {Server} from "./src/Server";
import {AuthHandler} from "./src/Authentication/AuthHandler";
import {InMemoryUserStore} from "./src/Store/UserStore";


const userStore = new InMemoryUserStore();
const authHandler = new AuthHandler(userStore);
const server = new Server(authHandler);
server.start();

