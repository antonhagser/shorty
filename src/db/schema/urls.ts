import {
    pgTable,
    serial,
    timestamp,
    varchar,
    integer,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { accounts } from "./accounts";

export const urls = pgTable(
    "urls",
    {
        id: serial("id").primaryKey(),

        shortId: varchar("short_id").notNull(),

        views: integer("views").notNull(),

        redirectURL: varchar("redirect_url").notNull(),

        accountId: varchar("account_id")
            .notNull()
            .references(() => accounts.id),

        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow(),
    },
    (table) => {
        return {
            shortIdx: uniqueIndex("short_id_idx").on(table.shortId),
            AccountIdx: index("account_id_idx").on(table.accountId),
        };
    }
);

export const urlsRelations = relations(urls, ({ one }) => ({
    accounts: one(accounts, {
        fields: [urls.accountId],
        references: [accounts.id],
    }),
}));

export type URL = InferSelectModel<typeof urls>;
export type NewURL = InferInsertModel<typeof urls>;
