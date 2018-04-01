const path = require('path')
const url = require('url')
const osLocale = require('os-locale');
const os = require('os')
const fs = require('fs')
const {app, BrowserWindow, ipcMain, dialog, shell, Menu} = require('electron')
const store = require('data-store')('my-app');
const log = require('electron-log');
require("./js/i18n");
require("./js/MenuTemplate")

console.log(i18n("menu.file"))

app.commandLine.appendSwitch('remote-debugging-port', '9222')
const autoUpdater = require("electron-updater").autoUpdater
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

ipcMain.on('print-to-pdf', function (event) {
    const pdfPath = path.join(os.tmpdir(), 'print.pdf');
    var win = BrowserWindow.fromWebContents(event.sender)
    // Use default printing options
    console.log("Print-to-pdf")
    win.webContents.printToPDF({pageSize: "A4"}, function (error, data) {
        if (error) throw error
        fs.writeFile(pdfPath, data, function (error) {
            if (error) {
                throw error
            }
            shell.openExternal('file://' + pdfPath)
            event.sender.send('wrote-pdf', pdfPath)
        })
    })
});

ipcMain.on('print', function (event) {
    const win = BrowserWindow.fromWebContents(event.sender)
    // Use default printing options
    win.webContents.print({pageSize: "A4"}, function (error, data) {
        if (error) throw error
    })
});

let mainWindow;

function createWindow () {
    autoUpdater.checkForUpdates();
    mainWindow = new BrowserWindow({width: 800, height: 600, backgroundColor: "#04C800"});
    mainWindow.maximize();
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '/sites/index.html'),
        protocol: 'file:',
        slashes: true
    }));
    const menu = Menu.buildFromTemplate(template());
    Menu.setApplicationMenu(menu);
    mainWindow.webContents.on('did-finish-load', function () {
        for (arg of process.argv) {
            if (fs.existsSync(arg) && arg.endsWith(".let")) {
                mainWindow.webContents.send("file-open", arg);
            }
        }
    });

  // Open the DevTools.
  //  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
      mainWindow = null;
      if (typeof aboutWindow !== "undefined") {
          try {
              aboutWindow.close();
              aboutWindow = null;
          }catch (e){}
      }
      if (typeof settingsWindow !== "undefined") {
          try {
              settingsWindow.close();
              settingsWindow = null;
          }catch (e){}
      }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    mainWindow.webContents.send("closed");
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('save-dialog', (event) => {
    const options = {
        title: 'Save a letter',
        filters: [
            {name: 'Letter', extensions: ['let']}
        ]
    }
    dialog.showSaveDialog(options, (filename) => {
        event.sender.send('saved-file', filename)
    })
});

ipcMain.on('open-file-dialog', (event) => {
    dialog.showOpenDialog({
        filters: [{name: 'Letters', extensions: ['let']}],
        properties: ['openFile']
    }, (files) => {
        if (files) {
            event.sender.send('selected-directory', files)
        }
    })
});

autoUpdater.on('checking-for-update', () => {
    log.info("Checking for updates...")
});
autoUpdater.on('update-available', (info) => {
});
autoUpdater.on('update-not-available', (info) => {
    log.info("Update not available")
});
autoUpdater.on('error', (err) => {
});
autoUpdater.on('download-progress', (progressObj) => {
    log.info("download progrss")
});
autoUpdater.on('update-downloaded', (info) => {
    autoUpdater.quitAndInstall();
});