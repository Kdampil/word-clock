const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store'); // For persistent storage

// Initialize persistent storage
const store = new Store();

let mainWindow;
let themeWindow;

function createWindow() {
    // Retrieve saved window state
    const savedState = store.get('windowState') || {
        width: 318,
        height: 424,
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
        resizable: false, // Disable resizing for now
        frame: false, // Remove the default window frame
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // Load the index.html file
    mainWindow.loadFile('index.html');

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
            mainWindow.setBounds({
                width: 318,
                height: newHeight,
                x: currentBounds.x,
                y: currentBounds.y,
            });
        }
    });

    // Open Theme Customization Window
    ipcMain.on('open-theme-window', () => {
        if (!themeWindow || themeWindow.isDestroyed()) {
            themeWindow = new BrowserWindow({
                width: 320,
                height: 550, // Adjusted height to fit all options
                resizable: false,
                frame: false,
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false,
                },
            });

            themeWindow.loadFile('theme-window.html');
            themeWindow.on('closed', () => {
                themeWindow = null;
            });
        } else {
            themeWindow.focus();
        }
    });

    // Minimize Theme Window
    ipcMain.on('minimize-theme-window', () => {
        if (themeWindow) {
            themeWindow.minimize();
        }
    });

    // Close Theme Window
    ipcMain.on('close-theme-window', () => {
        if (themeWindow) {
            themeWindow.close();
        }
    });

    // Handle Theme Updates from Pop-Out Window
    ipcMain.on('update-theme', (event, { property, value }) => {
        mainWindow.webContents.send('apply-theme', { property, value });
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
