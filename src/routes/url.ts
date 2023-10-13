import { customAlphabet } from "nanoid";
import { RouteController } from "../http";
import { NewURL, URL } from "../db/schema/urls";
import { logger } from "..";
import {
    dbCreateUrl,
    dbDeleteUrlById,
    dbGetUrlByShortId,
    dbGetUrlByShortIdAndAccountId,
    dbUpdateUrlViewCountById,
} from "../db/models/urls";
import { dbGetAccountByApiKey } from "../db/models/accounts";
import { Request, Response } from "express";

// Change the alphabet to be more URL friendly, (could be BASE62)
const nanoid = customAlphabet(
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
    12
);

interface ShortenRequest {
    url: string;
    id?: string;
}

const routesController: RouteController = {
    setupRoutes(app) {
        app.post("/api/v1/shorten", async (req: Request, res: Response) => {
            // Check if the request is valid
            if (!req.body) {
                logger.error("No body provided");
                res.status(400).send("Bad Request");
                return;
            }

            // Check if body is ShortenRequest
            if (!req.body.url) {
                logger.error("No URL provided");
                res.status(400).send("Bad Request");
                return;
            }

            let bearer = req.headers["authorization"];
            if (!bearer) {
                res.status(401).send("Unauthorized");
                return;
            }

            // Parse the bearer token
            let token = bearer.split(" ")[1];
            if (!token) {
                res.status(401).send("Unauthorized");
                return;
            }

            // Parse body
            let parsedBody: ShortenRequest = req.body;

            let id;
            if (parsedBody.id) {
                // Check with database if the id is already taken
                // If it is, return an error

                // Fetch the url from the database
                const url = await dbGetUrlByShortId(parsedBody.id);
                if (url) {
                    logger.error("ID already taken");
                    res.status(409).send("Conflict");
                    return;
                }

                // Set the id to the id provided in the request
                id = parsedBody.id;
            } else {
                // Generate a new id
                id = nanoid();
            }

            if (!id) {
                logger.error("Internal Server Error");
                res.status(500).send("Internal Server Error");
                return;
            }

            let account = await dbGetAccountByApiKey(token);
            if (!account) {
                logger.error("Unauthorized");
                res.status(401).send("Unauthorized");
                return;
            }

            // Create the URL
            const url: NewURL = {
                shortId: id,
                views: 0,
                redirectURL: parsedBody.url,
                accountId: account.id,
            };

            // Insert the URL into the database
            const result = await dbCreateUrl(url);
            if (!result) {
                logger.error("Internal Server Error");
                res.status(500).send("Internal Server Error");
                return;
            }

            res.status(200).send({
                id: url.shortId,
            });
        });

        app.get("/api/v1/stats/:id", async (req: Request, res: Response) => {
            let id = req.params.id;
            if (!id) {
                res.status(400).send("Bad Request");
                return;
            }

            let bearer = req.headers["authorization"];
            if (!bearer) {
                res.status(401).send("Unauthorized");
                return;
            }

            // Parse the bearer token
            let token = bearer.split(" ")[1];
            if (!token) {
                res.status(401).send("Unauthorized");
                return;
            }

            // Check if the user has an account
            let account = await dbGetAccountByApiKey(token);
            if (!account) {
                logger.error("Unauthorized");
                res.status(401).send("Unauthorized");
                return;
            }

            // Fetch the url from the database
            const url = await dbGetUrlByShortIdAndAccountId(id, account.id);
            if (!url) {
                logger.error("URL to get stats for was not Found");
                res.status(404).send("Not Found");
                return;
            }

            res.status(200).send({
                views: url.views,
            });
        });

        app.post("/api/v1/delete/:id", async (req: Request, res: Response) => {
            let id = req.params.id;
            if (!id) {
                res.status(400).send("Bad Request");
                return;
            }

            let bearer = req.headers["authorization"];
            if (!bearer) {
                res.status(401).send("Unauthorized");
                return;
            }

            // Parse the bearer token
            let token = bearer.split(" ")[1];
            if (!token) {
                res.status(401).send("Unauthorized");
                return;
            }

            // Check if the user has an account
            let account = await dbGetAccountByApiKey(token);
            if (!account) {
                logger.error("Unauthorized");
                res.status(401).send("Unauthorized");
                return;
            }

            logger.info(`Looking for url with ${id} to delete...`);

            // Fetch the url from the database
            const url = await dbGetUrlByShortIdAndAccountId(id, account.id);
            if (!url) {
                logger.error("URL to delete was not Found");
                res.status(404).send("Not Found");
                return;
            }

            // Delete the url from the database
            let result = await dbDeleteUrlById(url.id);
            if (!result) {
                logger.error("Internal Server Error");
                res.status(500).send("Internal Server Error");
                return;
            }

            res.status(200).send("OK");
        });

        app.get("/:id", async (req: Request, res: Response) => {
            let id = req.params.id;
            if (!id) {
                res.status(400).send("Bad Request");
                return;
            }

            logger.info(`Looking for url with ${id}`);

            // Fetch the url from the database
            const url = await dbGetUrlByShortId(id);
            if (!url) {
                logger.error("Not Found");
                res.status(404).send("Not Found");
                return;
            }

            logger.info(`Found url with ${id}, redirecting user...`);

            // Update the view count
            url.views++;

            const updateResult = await dbUpdateUrlViewCountById(
                url.id,
                url.views
            );
            if (!updateResult) {
                logger.error("Internal Server Error when updating view count");
                res.status(500).send("Internal Server Error");
                return;
            }

            res.redirect(url.redirectURL);
        });
    },
};

export default routesController;
