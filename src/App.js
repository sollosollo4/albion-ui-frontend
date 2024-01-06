import './App.css';
import React, { Component } from 'react';
import PanelCreator from './PanelCreator/PanelCreator';

const electron = window.require('electron');

electron.ipcRenderer.on('focus-change', (e, state) => {
});

electron.ipcRenderer.on('visibility-change', (e, state) => {
  if (document.body.style.display) {
    document.body.style.display = null
  } else {
    document.body.style.display = 'none'
  }
});

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <br /><span><b>Ctrl + J</b> чтобы взаимодействовать с панелью</span>
          <br /><span><b>Ctrl + K</b> чтобы скрыть все панели</span>
          <br />
          Создайте или присоединитесь к существующей комнате
          <form className='roomForm'>
            <label for="room">id комнаты</label>
            <input type="text" name="room" />
            <label for="room">пароль</label>
            <input type="password" name="password" />
            <button>Создать</button>
            <button>Войти</button>
          </form>
        </header>
        <main>

        </main>
      </div>
    );
  }
}

export default App;
