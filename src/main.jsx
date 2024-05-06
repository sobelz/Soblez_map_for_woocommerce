import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

window.addEventListener("load", function () {
  ReactDOM.createRoot(document.getElementById('MapWrapper')).render(
    <App />,
  )
})
