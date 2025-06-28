import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'
import { UserProvider } from './components/UserProvider.jsx'
import { Toaster } from './components/ui/toaster.jsx'
import { NotificationProvider } from './components/NotificationProvider.jsx'
import { ThemeProvider } from './components/ThemeProvider.jsx'

// Get your Clerk publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ThemeProvider defaultTheme="light" storageKey="payPrompt-theme">
        <UserProvider>
          <NotificationProvider>
            <App />
            <Toaster />
          </NotificationProvider>
        </UserProvider>
      </ThemeProvider>
    </ClerkProvider>
  </React.StrictMode>,
)