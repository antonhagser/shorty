import { eq } from "drizzle-orm";
import { getConnection } from "../connect";
import { Account, NewAccount, accounts } from "../schema/accounts";

/**
 * Create a new account.
 * @param account
 * @returns The created account or null if failed.
 */
export async function dbCreateAccount(
    account: NewAccount
): Promise<Account | null> {
    try {
        let result = await getConnection()
            .insert(accounts)
            .values(account)
            .returning();

        for (const account of result) {
            return account;
        }

        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

/**
 * Get an account by api key.
 * @param apiKey
 * @returns The account or null if not found.
 */
export async function dbGetAccountByApiKey(
    apiKey: string
): Promise<Account | null> {
    try {
        let result = await getConnection()
            .selectDistinct()
            .from(accounts)
            .where(eq(accounts.apiKey, apiKey));

        for (const account of result) {
            return account;
        }

        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

/**
 * Get an account by id.
 * @param id
 * @returns The account or null if not found.
 */
export async function dbGetAccountById(id: string): Promise<Account | null> {
    try {
        let result = await getConnection()
            .selectDistinct()
            .from(accounts)
            .where(eq(accounts.id, id));

        for (const account of result) {
            return account;
        }

        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
}
