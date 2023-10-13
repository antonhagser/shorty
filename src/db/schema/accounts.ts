import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { urls } from "./urls";

export const accounts = pgTable("accounts", {
    id: varchar("id").primaryKey(),

    apiKey: varchar("api_key").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
});

export const accountsRelations = relations(accounts, ({ many }) => ({
    urls: many(urls),
}));

export type Account = InferSelectModel<typeof accounts>;
export type NewAccount = InferInsertModel<typeof accounts>;
