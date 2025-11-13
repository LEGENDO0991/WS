"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
class AuthRoutes {
    static instance;
    router;
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    static getInstance() {
        if (!AuthRoutes.instance) {
            AuthRoutes.instance = new AuthRoutes();
        }
        return AuthRoutes.instance;
    }
    initializeRoutes() {
        // No routes yet
    }
    getRouter() {
        return this.router;
    }
}
exports.default = AuthRoutes;
