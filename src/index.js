import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { HashRouter, Route, Routes } from 'react-router-dom';
import Overlay from './Overlay/Overlay';
import App from './App';

window.Pusher = require('pusher-js');
/*
// Join public
window.Echo.channel(`translation`)
  .listen('TranslationEvent', (e) => {
    console.log('Public channel event: laravel_database_translation')
    console.log(e)
  })

// Join private
window.Echo.join('test')
  .here((users) => {
    console.log('Users currently in the channel:', users);
  })
  .joining((user) => {
    console.log('User joining the channel:', user);
  })
  .leaving((user) => {
    console.log('User leaving the channel:', user);
  })
  .listen('TranslationEvent', (e) => {
    console.log('Private channel event: laravel_database_test')
    console.log(e)
  });
window.Echo.private('laravel_database_test')
.listen('.App\\Events\\TranslationEvent', (e) => {
  console.log('Private channel event: laravel_database_test')
  console.log(e) 
});*/

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
