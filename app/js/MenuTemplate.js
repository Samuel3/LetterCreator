/**
 * Created by Samuel on 30.03.2018.
 */
const {BrowserWindow} = require('electron');
const url = require('url');
const path = require('path');

template = function () {
    const template = [
        {
            label: "File",
            submenu: [
                {
                    label: "Open",
                    click: function () {

                    }
                },
                {
                    label: "Save",
                    click: function () {

                    }
                },
                {type: 'separator'},
                {
                    label: "Exit",
                    click: function () {

                    }
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                {role: 'undo'},
                {role: 'redo'},
                {type: 'separator'},
                {role: 'cut'},
                {role: 'copy'},
                {role: 'paste'},
                {role: 'delete'},
                {role: 'selectall'},
                {type: 'separator'},
                {label: "Settings",
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
            label: 'View',
            submenu: [
                {role: 'reload'},
                {role: 'forcereload'},
                {role: 'toggledevtools'},
                {type: 'separator'},
                {role: 'resetzoom'},
                {role: 'zoomin'},
                {role: 'zoomout'},
                {type: 'separator'},
                {role: 'togglefullscreen'}
            ]
        },
        {
            role: 'window',
            submenu: [
                {role: 'minimize'},
                {role: 'close'}
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: "About",
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
                {role: 'about'},
                {type: 'separator'},
                {role: 'services', submenu: []},
                {type: 'separator'},
                {role: 'hide'},
                {role: 'hideothers'},
                {role: 'unhide'},
                {type: 'separator'},
                {role: 'quit'}
            ]
        });

        // Edit menu
        template[1].submenu.push(
            {type: 'separator'},
            {
                label: 'Speech',
                submenu: [
                    {role: 'startspeaking'},
                    {role: 'stopspeaking'}
                ]
            }
        );

        // Window menu
        template[3].submenu = [
            {role: 'close'},
            {role: 'minimize'},
            {role: 'zoom'},
            {type: 'separator'},
            {role: 'front'}
        ]
    }
    return template;
};