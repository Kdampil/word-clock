const { app, BrowserWindow, ipcMain } = require('electron');
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 338,
        height: 450,
        frame: false, // Borderless window
        transparent: true, // Enable transparency for rounded corners
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        backgroundColor: '#00000000', // Fully transparent background
        resizable: true, // Allow resizing
        hasShadow: true, // Add a subtle shadow around the window
    });

    // Load the HTML file
    mainWindow.loadFile('index.html');

    // Handle window close event
    mainWindow.on('closed', () => (mainWindow = null));
}

// Handle "Always on Top" toggle
ipcMain.on('set-always-on-top', (event, isChecked) => {
    if (mainWindow) {
        mainWindow.setAlwaysOnTop(isChecked);
    }
});

// Create the window when the app is ready
app.whenReady().then(createWindow);

// Quit the app when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Recreate the window on macOS if it was closed and the app is activated
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
