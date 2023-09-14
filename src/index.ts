import { Account } from "./database/models/account";
import { db } from "./database/source";
import { initHTTPServer } from "./httpserver";
import { createCustomLogger } from "./logger";

// Winston logger
export const logger = createCustomLogger();

export const accountsEnabled = false;

async function main() {
    logger.log("info", "Starting HTTP server on port 3000");

    try {
        await db.initialize();
    } catch (e) {
        logger.log("error", "Failed to initialize database", e);
        process.exit(1);
    }

    if (accountsEnabled) {
        logger.log("info", "Accounts are enabled");
    } else {
        logger.log("info", "Accounts are disabled");

        // Check if default account exists
        let accountRepo = db.getRepository(Account);

        let account = await accountRepo.findOneBy({
            id: "default",
        });

        if (!account) {
            logger.log("info", "Default account does not exist, creating one");

            account = new Account(
                "default",
                process.env.DEFAULT_ADMIN_API_KEY || "1234"
            );
            await accountRepo.save(account);
        }
    }

    initHTTPServer({ port: 3000 });
}

main().finally(() => logger.log("trace", "Done"));
