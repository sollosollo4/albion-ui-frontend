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
const stopWorker = 'CmdOrCtrl + Shift + B'

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
  globalShortcut.register(stopWorker, () => {
    worker = !worker;
    overlayWindow.webContents.send('stop-worker', worker)
  });

  return overlayWindow;
}

function createWorker(resolution) {
  const workerWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  workerWindow.loadURL(__dirname + "/worker.html");
  workerWindow.webContents.openDevTools();

  resolution = 'resolution1920x820';

  setInterval(() => {
    if(worker)
      desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: {
          width: 1920,
          height: 1080
        }
      }).then(sources => {
        const selectedSource = sources[0];
        if (selectedSource) {
          let buffers = [];
          data_resolution_coords[resolution].coords.forEach(function (elem, index) {
            let buffer = captureAndSend(selectedSource, elem.x, elem.y, elem.r);
            buffers[index] = buffer;
          });
          workerWindow.webContents.send('send-buffer', buffers);
        }
      }).catch(e => {
        console.log("Error:" + e)
      });
  }, 1000);

  function captureAndSend(selectedSource, x, y, radius) {
    const captureData = selectedSource.thumbnail.toDataURL();
    const imgData = Buffer.from(captureData.split(',')[1], 'base64');
    const processImageResult = processImage(imgData, x, y, radius);
    const base64Data = processImageResult.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    return buffer;

    function processImage(media, x, y, radius) {
      radius = Math.floor(radius);
      try {
        const mat = cv.imdecode(media);
        if (mat.empty) {
          throw new Error('Empty image');
        }
        // Creating a circular mask
        const mask = new cv.Mat(mat.rows, mat.cols, cv.CV_8U, 0);
        const center = new cv.Point(x, y);
        mask.drawCircle(center, radius, new cv.Vec(255, 255, 255), -1, cv.LINE_8, 0);
        let resultMat = new cv.Mat();
        resultMat = mat.copyTo(resultMat, mask);
        if (!resultMat.empty) {
          const rect = new cv.Rect(x - radius, y - radius, 2 * radius, 2 * radius);
          const croppedImage = resultMat.getRegion(rect);
          const resultBase64 = cv.imencode('.png', croppedImage).toString('base64');
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
      turn: true,
      auth: data.auth,
      roomId: data.roomId
    });
    mainWindow.webContents.send('set-positions', JSON.stringify(data_resolution_coords));
  });

  ipcMain.on('stop-worker', (event, worker) => {
    workerWindow.webContents.send('stop-worker', worker);
  });

  //require('./background.js');
  function getCirclePositions(templatePath, screenShootPath, threshold = 0.45) {
    const templateImage = cv.imread(templatePath);
    const screenshot = cv.imread(screenShootPath);

    const match = screenshot.matchTemplate(templateImage, 5);

    const locations = [];
    const minDistance = 10;

    const startY = 800;
    const endY = 1400;

    for (let y = startY; y < endY && y < match.rows; y++) {
      for (let x = 0; x < match.cols; x++) {
        const matchVal = match.atRaw(y, x);
        if (matchVal >= threshold) {
          const currentLocation = new cv.Point(x, y);

          // Проверка, находится ли текущее совпадение достаточно далеко от ранее найденных
          const isFarEnough = locations.every((prevLocation) => {
            const distance = Math.sqrt(
              Math.pow(currentLocation.x - prevLocation.x, 2) +
              Math.pow(currentLocation.y - prevLocation.y, 2)
            );
            return distance >= minDistance;
          });

          if (isFarEnough) {
            locations.push(currentLocation);
          }
        }
      }
    }
    // Отобразите прямоугольники вокруг найденных совпадений
    locations.forEach(loc => {
      const startX = loc.x;
      const startY = loc.y;
      screenshot.drawCircle(
        new cv.Point(startX / 2, startY / 2), // Центр круга
        (25), // Радиус круга (можно использовать половину ширины шаблона)
        new cv.Vec(0, 255, 0), // Цвет (зеленый в формате BGR)
        2, // Толщина линии
        cv.LINE_8
      );
    });

    // Сохраните изображение с отмеченным совпадением
    //cv.imwrite(__dirname + '/rawSkillPatterns/result.png', screenshot);
    return locations;
  }
}).catch((echo) => {
  console.log(echo);
});

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});

function captureAndSend(selectedSource, x, y, radius) {
  const captureData = selectedSource.thumbnail.toDataURL();
  const imgData = Buffer.from(captureData.split(',')[1], 'base64');
  const processImageResult = processImage(imgData, x, y, radius);
  const base64Data = processImageResult.replace(/^data:image\/png;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  return buffer;

  function processImage(media, x, y, radius) {
    radius = Math.floor(radius);
    try {
      console.log(`ProcessImage: ${x} ${y} ${radius}`)
      console.log('imgData length:', media.length);
      const mat = cv.imdecode(media);
      if (mat.empty) {
        throw new Error('Empty image');
      }
      // Creating a circular mask
      const mask = new cv.Mat(mat.rows, mat.cols, cv.CV_8U, 0);
      const center = new cv.Point(x, y);
      mask.drawCircle(center, radius, new cv.Vec(255, 255, 255), -1, cv.LINE_8, 0);
      let resultMat = new cv.Mat();
      resultMat = mat.copyTo(resultMat, mask);
      if (!resultMat.empty) {
        const rect = new cv.Rect(x - radius, y - radius, 2 * radius, 2 * radius);
        const croppedImage = resultMat.getRegion(rect);
        const resultBase64 = cv.imencode('.png', croppedImage).toString('base64');
        return resultBase64;
      }
      else {
        throw new Error('Empty resultMat');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }
}