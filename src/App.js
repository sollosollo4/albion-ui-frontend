import './App.css';
import React, { Component } from 'react';
import RoomCheckForm from './components/RoomCheckForm';
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
  state = {
    roomId: null
  }

  handleFormSubmit = (roomId) => {
    this.setState({ roomId: roomId }, () => {
      this.joinEchoChannel();
    });
    console.log(roomId);
  };

  joinEchoChannel = () => {
    const { roomId } = this.state;
    window.Echo.join('laravel_database-room.'+roomId)
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
      console.log(e)
    });
    console.log(window.Echo)
  }

  render() {
    return (
      <div className="App">
        <main><br />
          <span><b>Ctrl + J</b> чтобы взаимодействовать с панелью</span><br />
          <span><b>Ctrl + K</b> чтобы скрыть все панели</span>
          <br /><br />
          Создайте или присоединитесь к существующей комнате<br />
          <RoomCheckForm onFormSubmit={this.handleFormSubmit} ></RoomCheckForm>
        </main>
      </div>
    );
  }
}

export default App;
