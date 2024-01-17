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
exports.data_resolution_coords = data_resolution_coords;

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

function createWorker(resolution) {
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
  ipcMain.on('set-auth', (event, data) => {
    workerJs.postMessage({ 
      type: 'worker', 
      authToken: data.authToken,
      roomId: data.roomId
    });
    immediatlyCapture();
  });
  resolution = 'resolution1920x820';
  setInterval(() => {
    if (!isInteractable)
      immediatlyCapture();
  }, 500);

  function immediatlyCapture() {
    desktopCapturer.getSources({
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
      workerJs.postMessage({ 
        type: 'screenshot', 
        data: imgData 
      });
    })
    .catch(e => {
      console.log("Error:" + e)
    });
  }

  function captureAndSend(selectedSource, x, y, radius) {
    const captureData = selectedSource.thumbnail.toDataURL();
    const imgData = Buffer.from(captureData.split(',')[1], 'base64');
    const processImageResult = processImage(imgData, x, y, radius);
    // const base64Data = processImageResult.replace(/^data:image\/png;base64,/, '');
    // const buffer = Buffer.from(base64Data, 'base64');
    return processImageResult;

    function processImage(media, x, y, radius) {
      radius = Math.floor(radius);
      let dblRad = radius * 2;
      try {
        const mat = cv.imdecode(media);
        if (mat.empty) {
          throw new Error('Empty image');
        }
        // Creating a circular mask
        const mask = new cv.Mat(mat.rows, mat.cols, cv.CV_8U, 0);
        const center = new cv.Point(x, y);
        mask.drawCircle(center, radius, new cv.Vec(255, 255, 255), -1, cv.LINE_8, 0);
        let resultMat = new cv.Mat(dblRad, dblRad, cv.CV_8UC4, [-1, -1, -1, 0]);
        resultMat = mat.copyTo(resultMat, mask);
        if (!resultMat.empty) {
          const rect = new cv.Rect(x - radius, y - radius, dblRad, dblRad);
          const croppedImage = resultMat.getRegion(rect);

          const fourChannelMat = new cv.Mat(croppedImage.rows, croppedImage.cols, cv.CV_8UC4, [-1, -1, -1, 0]);
          const centerX = fourChannelMat.rows / 2;
          const centerY = fourChannelMat.cols / 2;
          for (let row = 0; row < fourChannelMat.rows; row++) {
            for (let col = 0; col < fourChannelMat.cols; col++) {
              let channels =  croppedImage.at(row, col);
              if(isPointInsideCircle(row, col, centerX, centerY, radius))
                fourChannelMat.set(row, col, [channels.x, channels.y, channels.z, 255]);
              else 
                fourChannelMat.set(row, col, [-1, -1, -1, 0]);
            }
          }

          function isPointInsideCircle(x, y, centerX, centerY, radius) {
            const distanceSquared = Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2);
            const radiusSquared = Math.pow(radius, 2);
          
            return distanceSquared <= radiusSquared;
          }
          const resultBase64 = cv.imencode('.png', fourChannelMat).toString('base64');
          return resultBase64;
        } else {
          throw new Error('Empty resultMat');
        }
      } catch (error) {
        console.error('Error processing image:', error);
        throw error;
      }
    }
  }

  return workerWindow;
}

app.whenReady().then(() => {
  const mainWindow = createMainWindow(); // main window
  const overlayWindow = createOverlay(); // overlay
  const workerWindow = createWorker(); // worker process

  ipcMain.on('panels-data', (event, newPanels) => {
    panels = newPanels;
    overlayWindow.webContents.send('panels-data', newPanels);
  });

  ipcMain.on('get-positions', (event, data) => {
    workerWindow.webContents.send('worker', {
      auth: data.auth,
      roomId: data.roomId
    });
    mainWindow.webContents.send('set-positions', JSON.stringify(data_resolution_coords));
  });

  ipcMain.on('PressButtonEvent', (event, data) => {
    overlayWindow.webContents.send('PressButtonEvent', data);
  });
}).catch((echo) => {
  console.log(echo);
});

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});