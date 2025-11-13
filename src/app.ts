// src/App.ts
import express, { Application } from "express";
import cors from "cors";
// import AuthRoutes from "./routes/auth";
import morgan from "morgan"
import http from "http";
import { Server as IOServer } from "socket.io";
import SocketController from "./socket/SocketController";

class App {
  private static instance: App | null;
  private app: Application;
  // private authRoutes: AuthRoutes;
  private server?: http.Server;
  private io?: IOServer;

  private constructor() {
    this.app = express();
    // this.authRoutes = AuthRoutes.getInstance();
    this.initializeMiddleware();
    this.initializeRoutes();
  }

  public static getInstance() {
    if (!App.instance) {
      App.instance = new App();
    }
    return App.instance;
  }

  private initializeMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(morgan("tiny"));
  }

  private initializeRoutes(): void {
    // this.app.use("/api/auth", this.authRoutes.getRouter());
    this.app.use("/", (_, res: express.Response) => {
      res.send("Hello world!");
    });
  }

  public listen(): void {
    const PORT = process.env.PORT || 9000;
    // create http server for socket.io
    this.server = http.createServer(this.app);
    this.io = new IOServer(this.server, {
      cors: {
        origin: "*", // restrict in production
        methods: ["GET", "POST"]
      }
    });

    // initialize socket controller
    new SocketController(this.io);

    this.server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }
}

export default App;
