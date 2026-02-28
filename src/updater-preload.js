const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('updaterAPI', {
  onStatus:   (cb) => ipcRenderer.on('update-status',   (e, d) => cb(d)),
  onProgress: (cb) => ipcRenderer.on('update-progress', (e, d) => cb(d)),
  onComplete: (cb) => ipcRenderer.on('update-complete', (e, d) => cb(d)),
  downloadUpdate: () => ipcRenderer.send('download-update'),
  installNow: ()   => ipcRenderer.send('install-update'),
  skipUpdate: ()   => ipcRenderer.send('skip-update'),
});
