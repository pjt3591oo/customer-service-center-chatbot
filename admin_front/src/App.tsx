
import { BrowserRouter, Route, Routes } from 'react-router';
import './index.css';
import ChatPage from './pages/chat';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ChatPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
