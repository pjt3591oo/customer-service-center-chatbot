import db from "./utils/db";

import { PGliteProvider } from "@electric-sql/pglite-react"
import { BrowserRouter, Route, Routes } from "react-router-dom"

import ChatPage from "./pages/chat"
import HistoryPage from "./pages/history"

import './index.css';



const App = () => {
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