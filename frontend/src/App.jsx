import { useState } from 'react'
import Routes from './routes/Routes'
import { AuthProvider } from './contexts/AuthContext'


function App() {
  const [ count, setCount ] = useState(0)

  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  )
}

export default App