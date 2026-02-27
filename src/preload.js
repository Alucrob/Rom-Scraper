const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('romAPI', {
  // Window controls
  minimize:  () => ipcRenderer.send('win-minimize'),
  maximize:  () => ipcRenderer.send('win-maximize'),
  close:     () => ipcRenderer.send('win-close'),

  // Dialogs
  browseDirectory: () => ipcRenderer.invoke('browse-directory'),
  openFolder:  (p) => ipcRenderer.send('open-folder', p),

  // Scraping
  startScrape: (cfg) => ipcRenderer.invoke('start-scrape', cfg),
  pauseScrape: ()    => ipcRenderer.send('pause-scrape'),
  stopScrape:  ()    => ipcRenderer.send('stop-scrape'),
  getResults:  ()    => ipcRenderer.invoke('get-results'),

  // App info
  getVersion: () => ipcRenderer.invoke('get-version'),

  // Exports
  saveLog:    (txt)  => ipcRenderer.invoke('save-log', txt),
  exportCsv:  (data) => ipcRenderer.invoke('export-csv', data),
  exportJson: (data) => ipcRenderer.invoke('export-json', data),

  // Events from main
  onLog:      (cb) => ipcRenderer.on('log',            (e, d) => cb(d)),
  onResult:   (cb) => ipcRenderer.on('result',         (e, d) => cb(d)),
  onProgress: (cb) => ipcRenderer.on('progress',       (e, d) => cb(d)),
  onComplete: (cb) => ipcRenderer.on('scrape-complete',(e, d) => cb(d)),
});
