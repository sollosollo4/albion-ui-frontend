import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { HashRouter, Route, Routes } from 'react-router-dom';
import Panel from './Overlay/Overlay';
import App from './App';

import Echo from 'laravel-echo';
window.io = require('socket.io-client');

window.Echo = new Echo({
  broadcaster: 'socket.io',
  appId: "albion_ui",
  key: "9430d58808113719364022fc195654ea",
  host: window.location.hostname + ':6001',
  wsHost: window.location.hostname,
  wsPort: 6001,
  transports: ["websocket"],
  withCredentials: true
});

window.Echo.channel(`laravel_database_translation`)
.listen('.App\\Events\\TranslationEvent', (e) => {
  console.log(e)
})

console.log(window.Echo)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route exact path="/" element={<App />} />
        <Route exact sensitive path="/newWindow" element={<Panel />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
