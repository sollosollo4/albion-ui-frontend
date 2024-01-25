import './App.css';
import React, { Component } from 'react';
import RoomCheckForm from './components/RoomCheckForm';
import Echo from 'laravel-echo';
import ModalWindow from './components/ModalWindow/ModalWindow';
import RegisterForm from './components/RegisterForm';
import PlayerInRoom from './components/PlayerInRoom/PlayerInRoom';


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
      panels: [],
      resolutionList: {},
      selectedResolution: 'resolution1920x1080',
      isModalOpen: false,
      roomId: null,
      Auth: null,
      resolutions: null
    };
  }

  openModal = () => {
    this.setState({ isModalOpen: true });
  };

  closeModal = () => {
    this.setState({ isModalOpen: false });
  };

  handleFormSubmit = (roomId) => {
    this.setState({ roomId: roomId });
    this.setState({ isModalOpen: true });
  };

  handleRegisterFormSubmit = (response) => {
    this.setState({ Auth: response.data }, () => {
      this.joinEchoChannel();
    });
  }

  joinEchoChannel = () => {
    const { roomId, Auth } = this.state;
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
        users.forEach(element => {
          this.setState((prevState) => {
            const updatedPanels = [...prevState.panels, this.createNewPlayerPanel(element)];
            return { panels: updatedPanels };
          }, () => {
            electron.ipcRenderer.send('panels-data', this.state.panels);
          });
        });
      })
      .joining((user) => {
        console.log('User joining the channel:', user);
        this.setState((prevState) => {
          const updatedPanels = [...prevState.panels, this.createNewPlayerPanel(user)];
          return { panels: updatedPanels };
        }, () => {
          electron.ipcRenderer.send('panels-data', this.state.panels);
        });
      })
      .leaving((user) => {
        console.log('User leaving the channel:', user);
        this.setState((prevState) => {
          const updatedPanels = prevState.panels.filter(pan => pan.player.id !== user.id);
          return { panels: updatedPanels };
        }, () => {
          electron.ipcRenderer.send('panels-data', this.state.panels);
        });

      })
      .listen('PressButtonEvent', (e) => {
        electron.ipcRenderer.send('PressButtonEvent', e);
      });

    electron.ipcRenderer.send('get-positions', {
      auth: Auth.access_token,
      roomId: roomId
    });

    electron.ipcRenderer.on('panels-data-m', this.handlePanelsData);
  };

  handlePanelsData = (event, receivedPanels) => {
    this.setState(() => ({
      panels: receivedPanels,
    }));
  };

  componentDidMount() {
    electron.ipcRenderer.send('get-resolution-list');

    electron.ipcRenderer.on('resolution-list', (event, list) => {
      this.setState({ resolutionList: list });
    });
  }

  componentWillUnmount() {
    electron.ipcRenderer.removeAllListeners('resolution-list');
  }

  handleResolutionChange = (event) => {
    this.setState({ selectedResolution: event.target.value });

    electron.ipcRenderer.send('set-resolution', event.target.value);
  };

  createNewPlayerPanel(player) {
    return {
      player: player,
      color: 'lightblue',
      position: { x: 960, y: 540 },
      size: { width: 100, height: 200 },
      active: true,
      transparency: 1,
      switches: {
        q: false,
        w: false,
        e: true,
        r: false,
        d: false,
        f: false
      },
    }
  };

  render() {
    const { isModalOpen, roomId, Auth, resolutionList, panels, selectedResolution } = this.state;
    const selectedResolutionData = resolutionList[selectedResolution];
    return (
      <div className="App">
        <main>
          <span><b>Выбрать разрешение:</b></span>
          <select onChange={this.handleResolutionChange} value={selectedResolution}>
            {Object.keys(resolutionList).map((resolution, index) => (
              <option key={index} value={resolution}>
                {resolution}
              </option>
            ))}
          </select><br />
          <span><b>Ctrl + J</b> чтобы взаимодействовать с панелью</span><br />
          <span><b>Ctrl + K</b> чтобы скрыть все панели</span><br />
          <span><b>Ctrl + Shift + B</b> переключить Albion вьювер</span><br />
          <br />
          {roomId == null || Auth == null ? (
            <div>
              <RoomCheckForm onFormSubmit={this.handleFormSubmit} ></RoomCheckForm>
              <ModalWindow isModalOpen={isModalOpen} closeModal={this.closeModal}>
                <RegisterForm onFormSubmit={this.handleRegisterFormSubmit} closeModal={this.closeModal} />
              </ModalWindow>
            </div>
          ) : (
            <div>
              <span>RoomId: {roomId}</span>
              <div>
                {panels.map((panel, key) => (
                  <PlayerInRoom
                    key={key}
                    panel={panel}
                  ></PlayerInRoom>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }
}


export default App;
