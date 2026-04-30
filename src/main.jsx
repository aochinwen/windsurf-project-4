import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuthGate from './components/AuthGate.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthGate>
      {({ user, signOut, cloudEnabled }) => (
        <App user={user} onSignOut={signOut} cloudEnabled={cloudEnabled} />
      )}
    </AuthGate>
  </StrictMode>,
)
