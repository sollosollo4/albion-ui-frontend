const { OverlayController, OVERLAY_WINDOW_OPTS } = require('electron-overlay-window')
const {app, BrowserWindow, globalShortcut, ipcMain} = require('electron')
const path = require ('path');
const url = require ('url');
const fs = require('fs');

const toggleMouseKey = 'CmdOrCtrl + J'
const toggleShowKey = 'CmdOrCtrl + K'

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    name: "Albion-UI",
    title: "Albion-UI",
    width: 400,
    height: 400,
    frame: true,
    autoHideMenuBar: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../index.html'),
    protocol: 'file:',
    slashes: true
  });

  mainWindow.loadURL(startUrl);

  mainWindow.on('close', () => app.quit());
}

ipcMain.on('updatePanels', (event, newPanels) => {
  panels = newPanels;
});

const panels = [];
function createWindow () {
  var newWindow = new BrowserWindow({
    name: `AttachableWindow`,
    title: "albion-overlay",
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    ...OVERLAY_WINDOW_OPTS,
    resizable: false,
  })
  newWindow.setAlwaysOnTop(true, "screen-saver");

  newWindow.webContents.on('did-finish-load', () => {
    newWindow.webContents.send('getPanels', panels);
  });

  const startUrl = "http://localhost:3000/#/newWindow" || url.format({
    pathname: path.join(__dirname, '../index.html/#/newWindow'),
    protocol: 'file:',
    slashes: true
  });
  newWindow.loadURL(startUrl);
  
  newWindow.webContents.openDevTools({ mode: 'detach', activate: false })

  OverlayController.attachByTitle(
    newWindow,
    process.platform === 'darwin' ? 'Albion Online Client' : 'Albion Online Client',
    { hasTitleBarOnMac: true }
  )

  let isInteractable = false

  function toggleOverlayState () {
    if (isInteractable) {
      isInteractable = false
      OverlayController.focusTarget()
      newWindow.webContents.send('focus-change', false)
    } else {
      isInteractable = true
      OverlayController.activateOverlay()
      newWindow.webContents.send('focus-change', true)
    }
  }
  newWindow.on('blur', () => {
    isInteractable = false
    newWindow.webContents.send('focus-change', false)
  })
  globalShortcut.register(toggleMouseKey, toggleOverlayState)
  globalShortcut.register(toggleShowKey, () => {
    newWindow.webContents.send('visibility-change', false)
  })
}

app.whenReady().then(() => {
  createMainWindow(); // main window
  createWindow(); // overlay
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});