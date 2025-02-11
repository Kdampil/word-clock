const { app, BrowserWindow, ipcMain } = require('electron');
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
        resizable: true, // Allow resizing
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
            const bounds = mainWindow.getBounds(); // Correctly access bounds as an object
            windowState = {
                width: bounds.width,
                height: bounds.height,
                x: bounds.x,
                y: bounds.y,
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

    // Handle "Always on Top" toggle
    ipcMain.on('set-always-on-top', (event, isActive) => {
        mainWindow.setAlwaysOnTop(isActive);
    });

    // Handle Minimize Button
    ipcMain.on('minimize-window', () => {
        if (mainWindow) {
            mainWindow.minimize();
        }
    });

    // Handle Close Button
    ipcMain.on('close-window', () => {
        if (mainWindow) {
            mainWindow.close();
        }
    });

    // Handle Dynamic Window Height Adjustment
    ipcMain.on('resize-window', (event, newHeight) => {
        if (mainWindow) {
            const currentBounds = mainWindow.getBounds();

            // Only resize if the height has changed significantly
            if (Math.abs(newHeight - currentBounds.height) > 5) {
                mainWindow.setBounds({
                    width: currentBounds.width,
                    height: newHeight,
                    x: currentBounds.x,
                    y: currentBounds.y,
                });
            }
        }
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
