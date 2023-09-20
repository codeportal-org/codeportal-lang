import { sql } from "drizzle-orm"
import { index, json, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core"

import { maxIDLength, nanoid } from "@/lib/nanoid"

export type MainModule = {
  code: any
}

export type ThemeColor = "zinc" | "blue" | "green" | "orange"

export type ThemeConfig = {
  color: ThemeColor
  radius: string
}

export const apps = mysqlTable("apps", {
  id: varchar("id", { length: maxIDLength })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: varchar("name", { length: 100 }).notNull(),
  /** This ID comes from Clerk, it is Clerk's user ID */
  creatorId: varchar("creator_id", { length: maxIDLength }).notNull(),
  lastOpenedAt: timestamp("last_opened_at", { fsp: 2 }),
  mainModule: json("main_module").$type<MainModule>(),
  prompt: text("prompt"),
  theme: json("theme").$type<ThemeConfig>(),

  createdAt: timestamp("created_at", { fsp: 2 })
    .notNull()
    .default(sql`now(2)`),
  updatedAt: timestamp("updated_at", { fsp: 2 })
    .notNull()
    .default(sql`now(2)`),
  deletedAt: timestamp("deleted_at", { fsp: 2 }),
})

export type App = typeof apps.$inferSelect

export const appModules = mysqlTable(
  "app_modules",
  {
    id: varchar("id", { length: maxIDLength })
      .primaryKey()
      .$defaultFn(() => nanoid("strong")),
    name: varchar("name", { length: 100 }).notNull(),
    applicationId: varchar("application_id", { length: maxIDLength }).notNull(),
    codeTree: json("code_tree"),

    createdAt: timestamp("created_at", { fsp: 2 })
      .notNull()
      .default(sql`now(2)`),
    updatedAt: timestamp("updated_at", { fsp: 2 })
      .notNull()
      .default(sql`now(2)`),
    deletedAt: timestamp("deleted_at", { fsp: 2 }),
  },
  (table) => {
    return {
      applicationIdIdx: index("application_id_idx").on(table.applicationId),
    }
  },
)

export const appData = mysqlTable(
  "app_data",
  {
    id: varchar("id", { length: maxIDLength })
      .primaryKey()
      .$defaultFn(() => nanoid("stronger")),
    name: varchar("name", { length: 100 }).notNull(),
    applicationId: varchar("application_id", { length: maxIDLength }).notNull(),
    data: json("data"),

    createdAt: timestamp("created_at", { fsp: 2 })
      .notNull()
      .default(sql`now(2)`),
    updatedAt: timestamp("updated_at", { fsp: 2 })
      .notNull()
      .default(sql`now(2)`),
    deletedAt: timestamp("deleted_at", { fsp: 2 }),
  },
  (table) => {
    return {
      applicationIdIdx: index("application_id_idx").on(table.applicationId),
    }
  },
)
