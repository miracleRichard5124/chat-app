import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext.jsx'
import { chatProvider } from '../context/chatContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <AuthProvider>
    <chatProvider>
      <App/>
    </chatProvider>
  </AuthProvider>
  </BrowserRouter>,
)
