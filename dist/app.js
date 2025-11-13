"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/App.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// import AuthRoutes from "./routes/auth";
const morgan_1 = __importDefault(require("morgan"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const SocketController_1 = __importDefault(require("./socket/SocketController"));
class App {
    static instance;
    app;
    // private authRoutes: AuthRoutes;
    server;
    io;
    constructor() {
        this.app = (0, express_1.default)();
        // this.authRoutes = AuthRoutes.getInstance();
        this.initializeMiddleware();
        this.initializeRoutes();
    }
    static getInstance() {
        if (!App.instance) {
            App.instance = new App();
        }
        return App.instance;
    }
    initializeMiddleware() {
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use((0, morgan_1.default)("tiny"));
    }
    initializeRoutes() {
        // this.app.use("/api/auth", this.authRoutes.getRouter());
        this.app.use("/", (_, res) => {
            res.send("Hello world!");
        });
    }
    listen() {
        const PORT = process.env.PORT || 9000;
        // create http server for socket.io
        this.server = http_1.default.createServer(this.app);
        this.io = new socket_io_1.Server(this.server, {
            cors: {
                origin: "*", // restrict in production
                methods: ["GET", "POST"]
            }
        });
        // initialize socket controller
        new SocketController_1.default(this.io);
        this.server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
}
exports.default = App;
