// main.js
const electron = require('electron');
const {app, BrowserWindow} = electron;
const shell = require('electron').shell;
//var app = require('electron').app;
//var BrowserWindow = require('browser-window');
//var NativeImage = require('native-image');
var mainWindow = null;
require('electron-debug')({showDevTools: false, enabled:true});
app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', function() {
	 
	
  mainWindow = new BrowserWindow({width: 1024, height: 768});
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
  mainWindow.webContents.on('new-window', function(e, url) {
  	e.preventDefault();
  	shell.openExternal(url);
	});
});
