import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { HashRouter, Route, Routes } from 'react-router-dom';
import Overlay from './Overlay/Overlay';
import App from './App';

import Echo from 'laravel-echo';
window.io = require('socket.io-client');

window.Echo = new Echo({
  broadcaster: 'socket.io',
  appId: "albion_ui",
  key: "9430d58808113719364022fc195654ea",
  host: "albion-overlay.ru:6001",
  wsHost: "albion-overlay.ru",
  wsPort: 6001,
  transports: ["websocket"],
  withCredentials: true,
  auth: {
    headers: {
      Authorization: 'Bearer ' + "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FsYmlvbi1vdmVybGF5LnJ1L2FwaS9sb2dpbiIsImlhdCI6MTcwNDc1MDE3MSwiZXhwIjoxNzA0NzUzNzcxLCJuYmYiOjE3MDQ3NTAxNzEsImp0aSI6Ildmc3g2MEdSQWpkamhBSVkiLCJzdWIiOiIxIiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.UtVbmVWnFrBCto3r7HFymurH3esyUusqvqTnc30L9ZA",
    },
  },
});
// Join public
/*window.Echo.channel(`laravel_database_translation`)
.listen('.App\\Events\\TranslationEvent', (e) => {
  console.log('Public channel event: laravel_database_translation')
  console.log(e)
})
// Join private
window.Echo.join('laravel_database_test')
.here((users) => {
  console.log('Users currently in the channel:', users);
})
.joining((user) => {
  console.log('User joining the channel:', user);
})
.leaving((user) => {
  console.log('User leaving the channel:', user);
})
.listen('.App\\Events\\TranslationEvent', (e) => {
  console.log('Private channel event: laravel_database_test')
  console.log(e) 
});
*/
window.Echo.private('laravel_database_test')
.listen('.App\\Events\\TranslationEvent', (e) => {
  console.log('Private channel event: laravel_database_test')
  console.log(e) 
});
console.log(window.Echo)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route exact path="/" element={<App />} />
        <Route exact sensitive path="/newWindow" element={<Overlay />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
