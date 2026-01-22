const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // In development, we load the Vite dev server
  // In production, we load the built index.html
  const devUrl = 'http://localhost:5173'; // Default Vite port
  
  // We can check if we are in dev mode by looking for an env var or argument
  // For now, let's try to load the local file first, if not try dev url
  // A better way is to pass an env var when running electron
  
  if (process.env.NODE_ENV === 'development') {
    win.loadURL(devUrl);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
