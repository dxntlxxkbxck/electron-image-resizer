const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendResize: (data) => ipcRenderer.send('image:resize', data),
  onDone: (callback) => ipcRenderer.on('image:done', (event) => callback()),
  onError: (callback) => ipcRenderer.on('image:error', (event, error) => callback(error))
});

contextBridge.exposeInMainWorld('electronAPI', {
  sendResize: (data) => ipcRenderer.send('image:resize', data),
  onDone: (callback) => ipcRenderer.on('image:done', callback),
  onError: (callback) => ipcRenderer.on('image:error', (e, error) => callback(error)),
  toast: {
    success: (text) => {
      const toast = Toastify({
        text,
        duration: 4000,
        style: { background: '#10B981', color: 'white' }
      });
      toast.showToast();
    },
    error: (text) => {
      const toast = Toastify({
        text,
        duration: 5000,
        style: { background: '#EF4444', color: 'white' }
      });
      toast.showToast();
    }
  }
});