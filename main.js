const { app, BrowserWindow } = require('electron');
const path = require('path');
const Store = require('electron-store'); // For persistent storage

// Initialize persistent storage
const store = new Store();

let mainWindow;

function createWindow() {
    // Retrieve saved window state
    const savedState = store.get('windowState') || {
        width: 350,
        height: 450,
        x: undefined,
        y: undefined,
        isMaximized: false,
    };

    // Create the browser window
    mainWindow = new BrowserWindow({
        width: savedState.width,
        height: savedState.height,
        x: savedState.x,
        y: savedState.y,
        resizable: true,
        frame: false, // Remove the default window frame
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // Load the index.html file
    mainWindow.loadFile('index.html');

    // Restore maximized state
    if (savedState.isMaximized) {
        mainWindow.maximize();
    }

    // Track window state changes
    let windowState = { ...savedState };
    const saveWindowState = () => {
        if (!mainWindow.isMaximized()) {
            const [x, y] = mainWindow.getBounds();
            windowState = {
                width: mainWindow.getBounds().width,
                height: mainWindow.getBounds().height,
                x: x,
                y: y,
                isMaximized: mainWindow.isMaximized(),
            };
        } else {
            windowState.isMaximized = true;
        }
        store.set('windowState', windowState); // Save state to persistent storage
    };

    // Save state on resize, move, and close
    mainWindow.on('resize', saveWindowState);
    mainWindow.on('move', saveWindowState);
    mainWindow.on('close', saveWindowState);

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
