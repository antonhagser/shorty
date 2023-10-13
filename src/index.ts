import { migrate } from "./db/connect";
import { dbCreateAccount, dbGetAccountById } from "./db/models/accounts";
import { NewAccount } from "./db/schema/accounts";
import { initHTTPServer } from "./http";
import { createCustomLogger } from "./logger";

// Winston logger
export const logger = createCustomLogger();

export const accountsEnabled = false;

async function main() {
    logger.log("info", "Starting HTTP server on port 3000");

    try {
        // Migrate the database
        await migrate();
    } catch (e) {
        logger.log("error", "Failed to initialize database", e);
        process.exit(1);
    }

    logger.log(
        "info",
        "Accounts are ",
        accountsEnabled ? "enabled" : "disabled"
    );

    // If accounts are not enabled, check if default account exists
    if (!accountsEnabled) {
        // Check if default account exists, if not create one
        let account = await dbGetAccountById("default");
        if (!account) {
            logger.log("info", "Default account does not exist, creating one");

            let newAccount: NewAccount = {
                id: "default",
                apiKey: process.env.DEFAULT_ADMIN_API_KEY || "1234",
            };

            let createdAccount = await dbCreateAccount(newAccount);
            if (!createdAccount) {
                logger.log("error", "Failed to create default account");
                process.exit(1);
            }
        }
    }

    // Start the HTTP server
    initHTTPServer({ port: 3000 });
}

main().finally(() => logger.log("trace", "Done"));
