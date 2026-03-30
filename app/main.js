// noinspection JSAnnotator
const path = require('path');
const url = require('url');
const osLocale = require('os-locale');
const os = require('os');
const fs = require('fs');
const http = require('http');
const {app, BrowserWindow, ipcMain, dialog, shell, Menu} = require('electron');
const store = require('data-store')('LetterCreator');
const log = require('electron-log');
var installUpdate = false;
var pendingExportPath = null;
require("./js/i18n");
require("./js/MenuTemplate");

app.commandLine.appendSwitch('remote-debugging-port', '9222');
const {autoUpdater} = require("electron-updater");
autoUpdater.logger = log;
autoUpdater.autoInstallOnAppQuit = false;
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
    win.webContents.print({pageSize: "A4"}, function (error, data) {
        if (error){
            console.error(error)
            throw error;
        }
    })
});

ipcMain.on("reload", function () {
    mainWindow.reload();
});

ipcMain.on("message", function (event, content) {
    mainWindow.webContents.send("message", content);
});

let mainWindow;
let dropboxAuthServer = null;

function createWindow () {
    autoUpdater.checkForUpdates();
    mainWindow = new BrowserWindow({
        width: 640,
        height: 480,
        backgroundColor: "#04C800",
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    mainWindow.maximize();
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '/sites/index.html'),
        protocol: 'file:',
        slashes: true
    }));
    menu = Menu.buildFromTemplate(template());
    Menu.setApplicationMenu(menu);
    mainWindow.webContents.on('did-finish-load', function () {
        for (const arg of process.argv) {
            if (fs.existsSync(arg) && arg.endsWith(".let")) {
                try {
                    var content = fs.readFileSync(arg, 'utf8');
                    mainWindow.webContents.send("file-content", content);
                } catch (e) {
                    console.error('Error reading file:', e);
                }
            }
        }
    });

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
      if (installUpdate) {
          autoUpdater.quitAndInstall();
      }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send("closed");
    }
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
function saveDialog(content) {
    const options = {
        title: 'Save a letter',
        filters: [
            {name: 'Letter', extensions: ['let']}
        ]
    };
    dialog.showSaveDialog(options, (filename) => {
        if (filename && content != null) {
            fs.writeFileSync(filename, content);
        } else if (filename) {
            mainWindow.webContents.send('save-requested');
        }
    })
}

// code. You can also put them in separate files and require them here.
ipcMain.on('save-dialog', (event, content) => {
    saveDialog(content);
});

// In this file you can include the rest of your app's specific main process
function exportDialog(content) {
    const options = {
        title: 'Export a letter',
        filters: [
            {name: 'Word Document', extensions: ['docx']}
        ]
    };
    dialog.showSaveDialog(options, (filename) => {
        if (filename && content) {
            try {
                var officegen = require('officegen');
                var async = require('async');
                var docx = officegen('docx');
                var _content = JSON.parse(content);
                var _receivers = _content.receiver.split("<br>");
                for (var i = 0; i < 3; i++) {
                    docx.createP();
                }
                var _receiverP = docx.createP();
                _receiverP.addText(_content.sender, {underline: true, font_size: 10});
                _receiverP.addLineBreak();
                _receiverP.addText(_receivers[0]);
                for (let i = 1; i < _receivers.length; i++) {
                    _receiverP.addLineBreak();
                    _receiverP.addText(_receivers[i]);
                }
                for (let i = 0; i < 3; i++) {
                    docx.createP();
                }
                _receiverP = docx.createP();
                _receiverP.addText(_content.subject, {"bold": true});
                docx.createP();
                docx.createP();
                _receiverP = docx.createP();
                _receiverP.addText(_content.content);
                docx.createP();
                docx.createP();
                _receiverP = docx.createP();
                _receiverP.addText(_content.greeting);
                var out = fs.createWriteStream(filename);
                out.on('error', function (err) {
                    console.log(err);
                });
                async.parallel([
                    function (done) {
                        out.on('close', function () {
                            console.log('Finish to create a DOCX file.');
                            done(null);
                        });
                        docx.generate(out);
                    }
                ], function (err) {
                    if (err) {
                        console.log('error: ' + err);
                    }
                });
            } catch (e) {
                console.error('Export error:', e);
            }
        }
    });
}

ipcMain.on('export-dialog', (event, content) => {
    exportDialog(content);
});

ipcMain.on("export-all-dialog", () => {
    const options = {
        title: 'Export all letters',
        filters: [
            {name: 'Letterset', extensions: ['lets']}
        ]
    };
    dialog.showSaveDialog(options, (filename) => {
        if (filename) {
            pendingExportPath = filename;
            settingsWindow.webContents.send('ready-for-export-data');
        }
    })
});

ipcMain.on('close-settings-window', () => {
    if (typeof settingsWindow !== 'undefined' && settingsWindow) {
        settingsWindow.close();
    }
});

function loadDialog() {
    dialog.showOpenDialog({
        filters: [{name: 'Letters', extensions: ['let']}],
        properties: ['openFile']
    }, (files) => {
        if (files && files.length > 0) {
            try {
                var content = fs.readFileSync(files[0] + '');
                mainWindow.webContents.send('file-content', content.toString());
            } catch (e) {
                console.error('Error reading file:', e);
            }
        }
    })
}

function showReleaseNotes(releaseNotes) {
    releaseNote = new BrowserWindow({width: 800, height: 600, backgroundColor: "#04C800", webPreferences: {nodeIntegration: false, contextIsolation: true, preload: path.join(__dirname, 'js/releaseNotes-preload.js')}});
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

ipcMain.on('close-release-notes', () => {
    if (releaseNote) {
        releaseNote.close();
    }
});

ipcMain.on('close-settings-window', () => {
    if (settingsWindow) {
        settingsWindow.close();
    }
});

ipcMain.on('export-data', (_event, data) => {
    if (pendingExportPath) {
        try {
            fs.writeFileSync(pendingExportPath, data);
            log.info(`Exported history to: ${pendingExportPath}`);
        } catch (e) {
            log.error(`Export failed: ${e}`);
        }
        pendingExportPath = null;
    }
});

ipcMain.on('updateDirectly', () => {
    autoUpdater.quitAndInstall();
});

ipcMain.on('updateAfterClose', () => {
    installUpdate = true;
});

ipcMain.on('receivedDropboxkey', () => {
    mainWindow.webContents.send("receivedDropboxkey")
})

ipcMain.on('dropbox-login', (event, authUrl) => {
    shell.openExternal(authUrl);
    if (dropboxAuthServer) {
        try { dropboxAuthServer.close(); } catch (e) {}
        dropboxAuthServer = null;
    }
    dropboxAuthServer = http.createServer(function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        if (req.url === '/') {
            res.end('<html><body>' +
                '<div>LetterCreator has successfully logged into dropbox. You can now close this window.</div>' +
                '<script>' +
                'console.log(document.URL);\n' +
                'var xmlHttp = new XMLHttpRequest();\n' +
                'xmlHttp.open("POST", "http://localhost:17234/accesstoken");\n' +
                'xmlHttp.send(\'{"token":"\' + document.URL + \'\"}\');\n' +
                'console.log(xmlHttp.responseText);\n' +
                '</script>' +
                '</body></html>');
        } else {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                if (body !== '') {
                    try {
                        let token = JSON.parse(body).token;
                        token = token.slice(token.indexOf('access_token=') + 13);
                        token = token.slice(0, token.indexOf('&'));
                        mainWindow.webContents.send('dropbox-auth-token', token);
                        if (dropboxAuthServer) {
                            try { dropboxAuthServer.close(); } catch (e) { console.error('Error closing Dropbox auth server:', e); }
                            dropboxAuthServer = null;
                        }
                    } catch (e) {
                        console.error('Error parsing Dropbox token:', e);
                    }
                }
                res.end('ok');
            });
        }
    }).listen(17234);
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
    if (typeof aboutWindow !== "undefined") {
        aboutWindow.webContents.send("progress", progressObj.percent)
    }
    log.info("download progress")
    log.info(JSON.stringify(progressObj))
});

autoUpdater.on('update-downloaded', (info) => {
    mainWindow.webContents.send("updateDownloaded", info);
});
