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
  host: "albion-overlay.ru:6001",
  wsHost: "albion-overlay.ru",
  // wsHost: window.location.hostname,
  wsPort: 6001,
  transports: ["websocket"],
  withCredentials: true,
  auth: {
    headers: {
      Authorization: 'Bearer ' + "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FsYmlvbi1vdmVybGF5LnJ1L2FwaS9sb2dpbiIsImlhdCI6MTcwNDY3NTEwOSwiZXhwIjoxNzA0Njc4NzA5LCJuYmYiOjE3MDQ2NzUxMDksImp0aSI6IkpnelQxTDdGMW9teFpJc1oiLCJzdWIiOiIxIiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.lvqSZRf8jnpXNmr0K6RV_puCyoPKzRSLDwJxEf2ByU0",
    },
  },
});

window.Echo.channel(`laravel_database_translation`)
.listen('.App\\Events\\TranslationEvent', (e) => {
  console.log(e)
})


window.Echo.join('laravel_database_test.1')
    .here((users) => {
        console.log('Users currently in the channel:', users);
    })
    .joining((user) => {
        console.log('User joining the channel:', user);
    })
    .leaving((user) => {
        console.log('User leaving the channel:', user);
    });

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
