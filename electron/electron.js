const { OverlayController, OVERLAY_WINDOW_OPTS } = require('electron-overlay-window')
const { app, BrowserWindow, globalShortcut, ipcMain, desktopCapturer } = require('electron')
const { fork } = require('child_process');
const path = require('path');
const url = require('url');
const fs = require('fs');
const cv = require('@u4/opencv4nodejs');

const data_resolution_coords =
{
  resolution1920x1080: {
    coords: [
      { x: 648, y: 1032, r: 24 }, // q
      { x: 738, y: 1032, r: 24 }, // w
      { x: 828, y: 1032, r: 24 }, // e 
      { x: 918, y: 1032, r: 24 }, // r
      { x: 1008, y: 1032, r: 24 }, // d
      { x: 1098, y: 1032, r: 24 }, // f
    ]
  },
  resolution1920x820: {
    coords: [
      { x: 723, y: 914, r: 18 }, // q
      { x: 791, y: 914, r: 18 }, // w
      { x: 860, y: 914, r: 18 }, // e 
      { x: 927, y: 914, r: 18 }, // r
      { x: 995, y: 914, r: 18 }, // d
      { x: 1064, y: 914, r: 18 }, // f
    ]
  }
};

const toggleMouseKey = 'CmdOrCtrl + J'
const toggleShowKey = 'CmdOrCtrl + K'
const stopWorkerKey = 'CmdOrCtrl + Shift + B'

var panels = [];
function createMainWindow() {
  const mainWindow = new BrowserWindow({
    name: "Albion-UI",
    title: "Albion-UI",
    width: 1200,
    height: 800,
    frame: true,
    autoHideMenuBar: true,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  })

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../index.html'),
    protocol: 'file:',
    slashes: true
  });

  mainWindow.loadURL(startUrl);

  mainWindow.webContents.openDevTools({ mode: 'detach', activate: false })

  mainWindow.on('close', () => app.quit());

  return mainWindow;
}
let worker = false;
let isInteractable = false
let selectedResolution = 'resolution1920x1080';
function createOverlay() {
  const overlayWindow = new BrowserWindow({
    name: `AttachableWindow`,
    title: "albion-overlay",
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    ...OVERLAY_WINDOW_OPTS,
    resizable: false,
  })
  overlayWindow.setAlwaysOnTop(true, "screen-saver");

  const startUrl = "http://localhost:3000/#/overlayWindow" || url.format({
    pathname: path.join(__dirname, '../index.html/#/overlayWindow'),
    protocol: 'file:',
    slashes: true
  });
  overlayWindow.loadURL(startUrl);

  overlayWindow.webContents.openDevTools({ mode: 'detach', activate: false })

  OverlayController.attachByTitle(
    overlayWindow,
    process.platform === 'darwin' ? 'Albion Online Client' : 'Albion Online Client',
    { hasTitleBarOnMac: true }
  )

  function toggleOverlayState() {
    if (isInteractable) {
      isInteractable = false
      OverlayController.focusTarget()
      overlayWindow.webContents.send('focus-change', false)
    } else {
      isInteractable = true
      OverlayController.activateOverlay()
      overlayWindow.webContents.send('focus-change', true)
    }
  }
  overlayWindow.on('blur', () => {
    isInteractable = false
    overlayWindow.webContents.send('focus-change', false)
  })
  globalShortcut.register(toggleMouseKey, toggleOverlayState)
  globalShortcut.register(toggleShowKey, () => {
    overlayWindow.webContents.send('visibility-change', false)
  });
  globalShortcut.register(stopWorkerKey, () => {
    worker = !worker;
  });

  return overlayWindow;
}

function createWorker() {
  const workerWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      nodeIntegrationInWorker: true
    },
  });
  workerWindow.loadURL(__dirname + "/worker.html");
  workerWindow.webContents.openDevTools();

  const Worker = require('worker_threads').Worker;
  const workerJs = new Worker(__dirname + '/worker.js', { data: 1 });

  var authToken;
  var roomId;

  workerJs.on('message', async (event) => {
    if (event.type === 'get-screenshot') {
      if(!isInteractable && worker) {
        let data = await immediatlyCapture();
        workerJs.postMessage({ 
          type: 'set-screenshot',
          data: data,
          authToken: authToken,
          roomId: roomId,
          resolution: selectedResolution
        });
      }
    } 
  });

  ipcMain.on('set-auth', (event, data) => {
    authToken = data.authToken
    roomId = data.roomId
  });

  async function immediatlyCapture() {
    return desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: {
        width: 1920,
        height: 1080, 
      }
    })
    .then(sources => {
      const selectedSource = sources[0];
      const captureData = selectedSource.thumbnail.toDataURL();
      const imgData = Buffer.from(captureData.split(',')[1], 'base64');
      return imgData;
    })
    .catch(e => {
      console.log("Error:" + e)
    });
  }

  return workerWindow;
}

app.whenReady().then(() => {
  const mainWindow = createMainWindow(); // main window
  const overlayWindow = createOverlay(); // overlay
  const workerWindow = createWorker(); // worker process

  ipcMain.on('panels-data', (event, newPanels) => {
    console.log("Update panels"+newPanels);
    panels = newPanels;
    overlayWindow.webContents.send('panels-data', newPanels);
  });

  ipcMain.on('get-positions', (event, data) => {
    workerWindow.webContents.send('worker', {
      auth: data.auth,
      roomId: data.roomId
    });
  });

  ipcMain.on('PressButtonEvent', (event, data) => {
    overlayWindow.webContents.send('PressButtonEvent', data);
  });

  ipcMain.on('get-resolution-list', (event) => {
    event.reply('resolution-list', data_resolution_coords);
  });

  ipcMain.on('set-resolution', (event, resolution) => {
    selectedResolution = resolution;
  });

  ipcMain.on('update-concrete-panel', (event, data) => {
    console.log(`Set ${data.field} = ${data.value} for panel id: ${data.id}`)
    console.log(panels);
    const updatedPanels = panels.map(panel => {
      if (panel.player && panel.player.id === data.id) {
        return { ...panel, [data.field]: data.value };
      }
    });
    panels = updatedPanels;
    overlayWindow.webContents.send('panels-data', panels);
  });

  ipcMain.on('remove-concrete-panel', (event, newPanel) => {
    const updatedPanels = array.filter(obj => obj.player.id !== newPanel.player.id);
    panels = updatedPanels;
    overlayWindow.webContents.send('panels-data', panels);
  });

})
.catch((echo) => {
  console.log(echo);
});

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});