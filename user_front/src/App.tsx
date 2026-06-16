import { useEffect } from "react"

import { PGlite } from "@electric-sql/pglite"
import { live } from "@electric-sql/pglite/live"
import { PGliteProvider } from "@electric-sql/pglite-react"
import { BrowserRouter, Route, Routes } from "react-router-dom"

import ChatPage from "./pages/chat"
import HistoryPage from "./pages/history"

import './index.css';

const db = await PGlite.create('idb://customer-service-center', {
  extensions: { live }
})

const App = () => {

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    initTable();
  }, [])

  const initTable = async () => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS chat (
        id           SERIAL PRIMARY KEY,
        chatSessionId TEXT NOT NULL,
        "from"       TEXT NOT NULL,
        content      TEXT NOT NULL,
        mode         TEXT NOT NULL,
        createdAt    TIMESTAMP DEFAULT NOW()
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS chatSession (
        id SERIAL PRIMARY KEY,
        chatSessionId TEXT,
        status TEXT,
        mode TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
  }
  return (
    <PGliteProvider db={db}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HistoryPage />} />
          <Route path="/chat/:chatSessionId" element={<ChatPage />} />
        </Routes>
      </BrowserRouter>
    </PGliteProvider>
  )
}

export default App;