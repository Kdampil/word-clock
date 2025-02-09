const { app, BrowserWindow, ipcMain } = require('electron');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 338, // Default width
        height: 450, // Default height
        resizable: true, // Allow resizing
        frame: false, // Remove the default window frame
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // Load the index.html file
    mainWindow.loadFile('index.html');

    // Optional: Open DevTools for debugging
    // mainWindow.webContents.openDevTools();

    // Handle window close event
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// App lifecycle events
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

// Handle "Always on Top" toggle
ipcMain.on('set-always-on-top', (event, isAlwaysOnTop) => {
    if (mainWindow) {
        mainWindow.setAlwaysOnTop(isAlwaysOnTop);
    }
});
