import { PGlite } from "@electric-sql/pglite"
import { live } from "@electric-sql/pglite/live"
// import { pg_uuidv7 } from '@electric-sql/pglite-pg_uuidv7';

const db = await PGlite.create('idb://customer-service-center', {
  extensions: { live }
})

// await db.exec('CREATE EXTENSION IF NOT EXISTS pg_uuidv7;')

// pglite에서 camecase로 적용안됨
// chatSessionId => chatsessionid으로 조회됨
await db.exec(`
  CREATE TABLE IF NOT EXISTS chat (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatSessionId TEXT NOT NULL,
    "from"       TEXT NOT NULL,
    content      TEXT NOT NULL,
    mode         TEXT NOT NULL,
    createdAt    TIMESTAMP DEFAULT NOW()
  );
`);

await db.exec(`
  CREATE TABLE IF NOT EXISTS chatSession (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatSessionId TEXT,
    status TEXT,
    mode TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`)

export default db;