/**
 * Created by Samuel on 30.03.2018.
 */
const {BrowserWindow, app} = require('electron');
const url = require('url');
const path = require('path');
require("./i18n");

template = function () {
    const template = [
        {
            label: i18n("menu.file"),
            submenu: [
                {
                    label: i18n("menu.file.open"),
                    click: function () {
                        loadDialog()
                    }
                },
                {
                    label: i18n("menu.file.save"),
                    click: function () {
                        saveDialog();
                    }
                },
                {type: 'separator'},
                {
                    label: i18n("menu.file.exit"),
                    click: function () {

                    }
                }
            ]
        },
        {
            label: i18n("menu.edit"),
            submenu: [
                {
                    role: 'undo',
                    label: i18n("menu.edit.undo")
                },
                {
                    role: 'redo',
                    label: i18n("menu.edit.redo")
                },
                {type: 'separator'},
                {
                    role: 'cut',
                    label: i18n("menu.edit.cut")
                },
                {
                    role: 'copy',
                    label: i18n("menu.edit.copy")
                },
                {
                    role: 'paste',
                    label: i18n("menu.edit.pase")
                },
                {
                    role: 'delete',
                    label: i18n("menu.edit.delete")
                },
                {
                    role: 'selectall',
                    label: i18n("menu.edit.selectall")
                },
                {type: 'separator'},
                {
                    label: i18n("menu.edit.settings"),
                    click: function () {
                    settingsWindow = new BrowserWindow({width: 800, height: 600, title: "Settings"});
                    settingsWindow.loadURL(url.format({
                        pathname: path.join(__dirname, '../sites/settings.html'),
                        protocol: 'file:',
                        slashes: true
                    }));
                    settingsWindow.setMenuBarVisibility(false);
                }}
            ]
        },
        {
            label: i18n("menu.view"),
            submenu: [
                {
                    role: 'reload',
                    label: i18n("menu.edit.reload")
                },
                {
                    role: 'forcereload',
                    label: i18n("menu.edit.forcereload")
                },
                {
                    role: 'toggledevtools',
                    label: i18n("menu.edit.toggledevtools")
                },
                {type: 'separator'},
                {
                    role: 'resetzoom',
                    label: i18n("menu.edit.resetzoom")
                },
                {
                    role: 'zoomin',
                    label: i18n("menu.edit.zoomin")
                },
                {
                    role: 'zoomout',
                    label: i18n("menu.edit.zoomout")
                },
                {type: 'separator'},
                {
                    role: 'togglefullscreen',
                    label: i18n("menu.edit.togglefullscreen")
                }
            ]
        },
        {
            role: 'window',
            label: i18n("menu.window"),
            submenu: [
                {
                    role: 'minimize',
                    label: i18n("menu.window.minimize")
                },
                {
                    role: 'close',
                    label: i18n("menu.window.close")
                }
            ]
        },
        {
            role: 'help',
            label: i18n("menu.help"),
            submenu: [
                {
                    label: i18n("menu.help.about"),
                    click(){
                        aboutWindow = new BrowserWindow({width: 800, height: 600, title: "About"});
                        aboutWindow.loadURL(url.format({
                            pathname: path.join(__dirname, '../sites/about.html'),
                            protocol: 'file:',
                            slashes: true
                        }));
                        aboutWindow.setMenuBarVisibility(false);
                    }
                }
            ]
        }
    ];

    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                {
                    role: 'about',
                    label: i18n("menu.about")
                },
                {type: 'separator'},
                {
                    role: 'services',
                    submenu: [],
                    label: i18n("menu.services")
                },
                {type: 'separator'},
                {
                    role: 'toggledevtools',
                    label: i18n("menu.edit.toggledevtools")
                },
                {type: 'separator'},
                {
                    role: 'hide',
                    label: i18n("menu.hide")
                },
                {
                    role: 'hideothers',
                    label: i18n("menu.hideothers")
                },
                {
                    role: 'unhide',
                    label: i18n("menu.unhide")
                },
                {type: 'separator'},
                {
                    role: 'quit',
                    label: i18n("menu.quit")
                }
            ]
        });

        // Edit menu
        template[1].submenu.push(
            {type: 'separator'},
            {
                label: i18n("menu.speech"),
                submenu: [
                    {
                        role: 'startspeaking',
                        label: i18n("menu.startspeaking")
                    },
                    {
                        role: 'stopspeaking',
                        label: i18n("menu.stopspeaking")
                    }
                ]
            }
        );

        // Window menu
        template[3].submenu = [
            {
                role: 'close',
                label: i18n("menu.close")
            },
            {
                role: 'minimize',
                label: i18n("menu.minimize")
            },
            {
                role: 'zoom',
                label: i18n("menu.zoom")
            },
            {type: 'separator'},
            {
                role: 'front',
                label: i18n("menu.front")
            }
        ]
    }
    return template;
};