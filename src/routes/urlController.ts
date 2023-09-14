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
        app.post("/shorten", async (req: Request, res: Response) => {
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
            await urlRepository.save(url);

            res.status(200).send({
                id: url.shortId,
            });
        });

        app.get("/:id", async (req: Request, res: Response) => {
            let id = req.params.id;
            if (!id) {
                res.status(400).send("Bad Request");
                return;
            }

            const urlRepository = db.getRepository(URL);

            const url = await urlRepository.findOneBy({
                // @ts-ignore
                shortId: id,
            });

            if (!url) {
                res.status(404).send("Not Found");
                return;
            }

            url.views++;

            await urlRepository.save(url);

            res.redirect(url.redirectURL);
        });
    },
};

export default routesController;
