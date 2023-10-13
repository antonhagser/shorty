import { eq, sql } from "drizzle-orm";
import { getConnection } from "../connect";
import { NewURL, URL, urls } from "../schema/urls";
import { Account } from "../schema/accounts";

/**
 * Get all urls.
 */
export async function dbGetUrls(accountId: string): Promise<URL[]> {
    try {
        let result = await getConnection()
            .select()
            .from(urls)
            .where(eq(urls.accountId, accountId));

        return result;
    } catch (error) {
        // Throwing errors is such a stupid thing to do
        // TODO: Implement proper error handling (Stack trace)
        console.error(error);
        return [];
    }
}

/**
 * Get all urls owned by an account.
 * @param accountId
 */
export async function dbGetUrlsByAccountId(
    accountId: string
): Promise<URL[] | null> {
    try {
        let result = await getConnection()
            .select()
            .from(urls)
            .where(eq(urls.accountId, accountId));

        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
}

/**
 * Get a url by id.
 */
export async function dbGetUrlById(id: number): Promise<URL | null> {
    try {
        let result = await getConnection()
            .selectDistinct()
            .from(urls)
            .where(eq(urls.id, id));

        for (const url of result) {
            return url;
        }

        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

/**
 * Get a url by short id.
 */
export async function dbGetUrlByShortId(shortId: string): Promise<URL | null> {
    try {
        let result = await getConnection()
            .selectDistinct()
            .from(urls)
            .where(eq(urls.shortId, shortId));

        for (const url of result) {
            return url;
        }

        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

/**
 * Get a url by short it and account id.
 * @param shortId
 * @param accountId
 * @returns The url or null if not found.
 */
export async function dbGetUrlByShortIdAndAccountId(
    shortId: string,
    accountId: string
): Promise<URL | null> {
    try {
        let result = await getConnection()
            .selectDistinct()
            .from(urls)
            .where(eq(urls.shortId, shortId))
            .where(eq(urls.accountId, accountId));

        for (const url of result) {
            return url;
        }

        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

/**
 * Create a new url.
 * @param url
 * @returns The created url or null if failed.
 */
export async function dbCreateUrl(url: NewURL): Promise<URL | null> {
    try {
        let result = await getConnection().insert(urls).values(url).returning();

        for (const url of result) {
            return url;
        }

        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

/**
 * Delete a url by id.
 * @param id The id of the url to delete.
 * @returns True if deleted, false if not found.
 */
export async function dbDeleteUrlById(id: number): Promise<boolean> {
    try {
        let result = await getConnection().delete(urls).where(eq(urls.id, id));

        if (result.rowCount > 0) {
            return true;
        }

        return false;
    } catch (error) {
        console.error(error);
        return false;
    }
}

/**
 * Update a url view count by id.
 * @param id The id of the url to update.
 * @param views The new view count.
 * @returns True if updated, false if not found.
 */
export async function dbUpdateUrlViewCountById(
    id: number,
    views: number
): Promise<boolean> {
    try {
        let result = await getConnection()
            .update(urls)
            .set({ views })
            .where(eq(urls.id, id));

        if (result.rowCount > 0) {
            return true;
        }

        return false;
    } catch (error) {
        console.error(error);
        return false;
    }
}
