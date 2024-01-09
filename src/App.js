import './App.css';
import React, { Component } from 'react';
import RoomCheckForm from './components/RoomCheckForm';
import Echo from 'laravel-echo';
import ModalWindow from './components/ModalWindow/ModalWindow';
import RegisterForm from './components/RegisterForm';
import axios from 'axios';

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
  constructor(props) {
    super(props);
    this.state = {
      isModalOpen: false,
      roomId: null,
      Auth: null
    };
  }

  openModal = () => {
    this.setState({ isModalOpen: true });
  };

  closeModal = () => {
    this.setState({ isModalOpen: false });
  };

  handleFormSubmit = (roomId) => {
    console.log("Connect to room:" + roomId);
    this.setState({ roomId: roomId });
    // show login form
    this.setState({ isModalOpen: true });
  };

  handleRegisterFormSubmit = (response) => {
    console.log(response);
    this.setState({ Auth: response.data }, () => {
      this.joinEchoChannel();
    });
  }

  joinEchoChannel = () => {
    const { roomId, Auth } = this.state;
    console.log(roomId, Auth)

    const laravelEcho = new Echo({
      cluster: "mt1",
      broadcaster: 'pusher',
      appId: "app-id",
      key: "app-key",
      secret: "app-secret",
      wsHost: "albion-overlay.ru",
      wsPort: "6001",
      wssPort: "6002",
      forceTLS: false,
      encrypted: true,
      disableStats: true,
      enabledTransports: ['ws', 'wss'],
      withCredentials: true,
      authEndpoint: 'https://albion-overlay.ru/api/broadcasting/auth',
      auth: {
        headers: {
          Authorization: 'Bearer ' + Auth.access_token,
        },
      }
    });

    laravelEcho.join('room.' + roomId)
    .here((users) => {
      console.log('Users currently in the channel:', users);
    })
    .joining((user) => {
      console.log('User joining the channel:', user);
    })
    .leaving((user) => {
      console.log('User leaving the channel:', user);
    }).listen('PressButtonEvent', (e) => {
      console.log("SOME PLAYER IN ROOM PRESS BUTTON")
      console.log(e)
    })
    .listen('ProfileDataEvent', (e) => {
      console.log("SOME PLAYER IN ROOM SEND NEW PROFILE DATA")
      console.log(e)
    });

    console.log(laravelEcho)
  };

  render() {
    const { isModalOpen, roomId, Auth } = this.state;
    return (
      <div className="App">
        <main>
          {roomId == null || Auth == null ? (
            <div>
              <RoomCheckForm onFormSubmit={this.handleFormSubmit} ></RoomCheckForm>
              <ModalWindow isModalOpen={isModalOpen} closeModal={this.closeModal}>
                <RegisterForm onFormSubmit={this.handleRegisterFormSubmit} closeModal={this.closeModal} />
              </ModalWindow>
            </div>
          ) : (
            <div>RoomId: {roomId}</div>
          )}
        </main>
      </div>
    );
  }
}

export default App;
