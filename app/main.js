// noinspection JSAnnotator
const path = require('path');
const url = require('url');
const osLocale = require('os-locale');
const os = require('os');
const fs = require('fs');
const {app, BrowserWindow, ipcMain, dialog, shell, Menu} = require('electron');
const store = require('data-store')('LetterCreator');
const log = require('electron-log');
require("./js/i18n");
require("./js/MenuTemplate");

app.commandLine.appendSwitch('remote-debugging-port', '9222');
const {autoUpdater} = require("electron-updater");
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

ipcMain.on('print-to-pdf', function (event) {
    const pdfPath = path.join(os.tmpdir(), 'print.pdf');
    var win = BrowserWindow.fromWebContents(event.sender)
    // Use default printing options
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

ipcMain.on("reload", function () {
    mainWindow.reload();
});

ipcMain.on("message", function (event, content) {
    mainWindow.webContents.send("message", content);
});

let mainWindow;

function createWindow () {
    autoUpdater.checkForUpdates();
    mainWindow = new BrowserWindow({width: 640, height: 480, backgroundColor: "#04C800"});
    mainWindow.maximize();
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '/sites/index.html'),
        protocol: 'file:',
        slashes: true
    }));
    menu = Menu.buildFromTemplate(template());
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
      if (typeof releaseNote !== "undefined") {
          try {
              releaseNote.close();
              releaseNote = null;
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
function saveDialog() {
    const options = {
        title: 'Save a letter',
        filters: [
            {name: 'Letter', extensions: ['let']}
        ]
    };
    dialog.showSaveDialog(options, (filename) => {
        mainWindow.send('saved-file', filename)
    })
}

// code. You can also put them in separate files and require them here.
ipcMain.on('save-dialog', () => {
    saveDialog();
});

// In this file you can include the rest of your app's specific main process
function exportDialog() {
    const options = {
        title: 'Export a letter',
        filters: [
            {name: 'Word Document', extensions: ['docx']}
        ]
    };
    dialog.showSaveDialog(options, (filename) => {
        mainWindow.send('exported-file', filename)
    })
}

// code. You can also put them in separate files and require them here.
ipcMain.on('export-dialog', () => {
    exportDialog();
});

function loadDialog() {
    dialog.showOpenDialog({
        filters: [{name: 'Letters', extensions: ['let']}],
        properties: ['openFile']
    }, (files) => {
        if (files) {
            mainWindow.send('selected-directory', files)
        }
    })
}

function showReleaseNotes(releaseNotes) {
    releaseNote = new BrowserWindow({width: 800, height: 600, backgroundColor: "#04C800"});
    releaseNote.loadURL(url.format({
        pathname: path.join(__dirname, '/sites/update.html'),
        protocol: 'file:',
        slashes: true
    }));
    releaseNote.on("ready-to-show", () => {
        console.log("ready-to-show")
    });
    setTimeout(function(){releaseNote.webContents.send("releaseNotes-available", releaseNotes);}, 1000)

}

ipcMain.on('open-file-dialog', () => {
    loadDialog();
});

autoUpdater.on('checking-for-update', () => {
    log.info("Checking for updates...")
});
autoUpdater.on('update-available', (info) => {
    showReleaseNotes(info)
});
autoUpdater.on('update-not-available', (info) => {


});
autoUpdater.on('error', (err) => {
});
autoUpdater.on('download-progress', (progressObj) => {
    if (aboutWindow) {
        aboutWindow.webContents.send("progress", progressObj.percent)
    }
    log.info("download progress")
    log.info(JSON.stringify(progressObj))
});
autoUpdater.on('update-downloaded', (info) => {
    mainWindow.webContents.send("message", i18n("message.downloadcomplete"));
    autoUpdater.quitAndInstall();
});