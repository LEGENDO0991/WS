import express, { Router } from "express";

class AuthRoutes {
    private static instance: AuthRoutes | null;
    private router: Router;
    private constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    public static getInstance(): AuthRoutes {
        if (!AuthRoutes.instance) {
            AuthRoutes.instance = new AuthRoutes();
        }
        return AuthRoutes.instance;
    }

    private initializeRoutes(): void {
        // No routes yet
    }
    public getRouter() {
        return this.router;
    }
}

export default AuthRoutes;