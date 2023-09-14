import { customAlphabet } from "nanoid";
import { Request, Response, RouteController } from "../httpserver";
import { URL } from "../database/models/url";
import { Account } from "../database/models/account";
import { db } from "../database/source";
import { logger } from "..";

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

            // Check if the URL is valid
            const urlRepository = db.getRepository(URL);

            let id;
            if (parsedBody.id) {
                // Check with database if the id is already taken
                // If it is, return an error

                const url = await urlRepository.findOneBy({
                    // @ts-ignore
                    shortId: parsedBody.id,
                });

                if (url) {
                    logger.error("ID already taken");
                    res.status(409).send("Conflict");
                    return;
                }

                id = parsedBody.id;
            } else {
                id = nanoid();
            }

            if (!id) {
                logger.error("Internal Server Error");
                res.status(500).send("Internal Server Error");
                return;
            }

            // Check if the user has an account
            const accountRepository = db.getRepository(Account);

            let account = await accountRepository.findOneBy({
                apiKey: token,
            });

            if (!account) {
                logger.error("Unauthorized");
                res.status(401).send("Unauthorized");
                return;
            }

            // Create the URL
            const url = new URL(parsedBody.url, id, 0, account);
            const result = await urlRepository.save(url);
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
            const accountRepository = db.getRepository(Account);

            let account = await accountRepository.findOneBy({
                apiKey: token,
            });

            if (!account) {
                logger.error("Unauthorized");
                res.status(401).send("Unauthorized");
                return;
            }

            const urlRepository = db.getRepository(URL);

            const url = await urlRepository.findOneBy({
                shortId: id,
                account: { id: account.id },
                deletedAt: undefined,
            });

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
            const accountRepository = db.getRepository(Account);

            let account = await accountRepository.findOneBy({
                apiKey: token,
            });

            if (!account) {
                logger.error("Unauthorized");
                res.status(401).send("Unauthorized");
                return;
            }

            logger.info(`Looking for url with ${id} to delete...`);

            const urlRepository = db.getRepository(URL);

            const url = await urlRepository.findOneBy({
                shortId: id,
                account: { id: account.id },
                deletedAt: undefined,
            });

            if (!url) {
                logger.error("URL to delete was not Found");
                res.status(404).send("Not Found");
                return;
            }

            let result = await urlRepository.delete(url);
            if (result.affected && result.affected > 0) {
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

            const urlRepository = db.getRepository(URL);

            const url = await urlRepository.findOneBy({
                // @ts-ignore
                shortId: id,
                deletedAt: undefined,
            });

            if (!url) {
                logger.error("Not Found");
                res.status(404).send("Not Found");
                return;
            }

            logger.info(`Found url with ${id}, redirecting user...`);

            url.views++;

            await urlRepository.save(url);

            res.redirect(url.redirectURL);
        });
    },
};

export default routesController;
