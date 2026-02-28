const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('updaterAPI', {
  // Listen for events from main process
  onUpdateStatus:   (cb) => ipcRenderer.on('update-status',   (_, data) => cb(data)),
  onUpdateProgress: (cb) => ipcRenderer.on('update-progress', (_, data) => cb(data)),
  onUpdateComplete: (cb) => ipcRenderer.on('update-complete', () => cb()),
  onUpdateError:    (cb) => ipcRenderer.on('update-error',    (_, data) => cb(data)),

  // Send commands to main process
  startDownload:    () => ipcRenderer.send('start-update-download'),
  installUpdate:    () => ipcRenderer.send('install-update'),
  skipUpdate:       () => ipcRenderer.send('skip-update'),
});
