import { connect } from "@planetscale/database"
import { drizzle } from "drizzle-orm/planetscale-serverless"

import * as _schema from "./schema"

const connection = connect({
  url: process.env.DATABASE_URL,
})

export const db = drizzle(connection, {
  schema: _schema,
})

export const schema = _schema
