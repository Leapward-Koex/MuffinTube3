import { app, BrowserWindow } from 'electron';
import { ElectronNativeApi } from './electronNativeApi';
const path = require('path');
const url = require('url');


class MuffinTube {
    private mainWindow: BrowserWindow;
    private electronApi: ElectronNativeApi;
    
    constructor() {
        app.on('ready', this.createWindow);

        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });
        
        app.on('activate', () => {
            if (!this.mainWindow) {
                this.createWindow();
            }
        });
    }

    private createWindow() {
        this.mainWindow = new BrowserWindow({ width: 600, height: 600, show: false });
        this.mainWindow.webContents.openDevTools()
        this.mainWindow.loadURL(
            !app.isPackaged
                ? process.env.ELECTRON_START_URL
                : url.format({
                    pathname: path.join(__dirname, '../index.html'),
                    protocol: 'file:',
                    slashes: true,
                })
        ).then(() => {
            this.electronApi = new ElectronNativeApi(this.mainWindow);
        })
    
        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow.show();
        });
    
        this.mainWindow.on('closed', () => {
            this.mainWindow = undefined;
        });
    }
}

new MuffinTube();

//https://medium.com/@kahlil/how-to-communicate-between-two-electron-windows-166fdbcdc469
