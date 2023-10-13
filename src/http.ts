import express from "express";

import URLRouteController from "./routes/url";

export function initHTTPServer({ port }: { port: number }) {
    const app = express();

    app.use(express.json());

    // Get routes in ./routes and bind them to the app
    const routeControllers = [URLRouteController];

    routeControllers.forEach((controller) => {
        controller.setupRoutes(app);
    });

    // Start the server
    app.listen(port);

    return app;
}

export type App = express.Express;

export interface RouteController {
    setupRoutes(app: App): void;
}
