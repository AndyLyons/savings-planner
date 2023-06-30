import React from 'react'
import ReactDOM from 'react-dom/client'
import Div100vh from 'react-div-100vh'
import { App } from './components/App'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Div100vh>
      <App />
    </Div100vh>
  </React.StrictMode>
)
