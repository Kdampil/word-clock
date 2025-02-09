const { app, BrowserWindow, ipcMain } = require('electron');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 338,
        height: 450,
        frame: false, // Borderless window
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadFile('index.html');
    mainWindow.on('closed', () => (mainWindow = null));
}

app.whenReady().then(createWindow);

// Handle "Always on Top" toggle
ipcMain.on('set-always-on-top', (event, isChecked) => {
    if (mainWindow) {
        mainWindow.setAlwaysOnTop(isChecked);
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
