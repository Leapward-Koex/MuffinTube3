import { app, BrowserWindow } from 'electron';
import { ElectronNativeApi } from './electronNativeApi';
import npm from 'npm'
import ytdl from "ytdl-core";
import { create as createYdDl, YtFlags } from 'youtube-dl-exec'
import orderBy from 'lodash.orderby';
import https from 'https'
import fs from 'fs';
import path from 'path'
import os from 'os';
import url from 'url'
import { YtdlManager } from './ytdlManager';

// Remove 'user:pass@' if you don't need to authenticate to your proxy.

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
        const downloadManager = new YtdlManager();
        downloadManager.checkForUpdate();
    }

    private createWindow() {
        this.mainWindow = new BrowserWindow({ 
            width: 600, height: 600, show: false,
            webPreferences: {
                nodeIntegration: false, // is default value after Electron v5
                contextIsolation: true, // protect against prototype pollution
                preload: path.join(__dirname, 'preload.js')
            },
        });
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
