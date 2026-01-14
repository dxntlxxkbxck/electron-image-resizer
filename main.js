const { app, BrowserWindow, Menu} = require('electron');
const path = require('path');

const isDev = process.env.NODE_END !== 'development' // or 'development/production
const isMac = process.platform === 'darwin';

// create the main menu
function createMainWindow() {
    const mainWindow = new BrowserWindow ({
        title: 'Image Resizer',
        width: isDev? 1000 : 500,
        height: 800
    });

    // Open devtools if in dev env
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

// crate about window
function createAboutWindow() {
    const aboutWindow = new BrowserWindow({
        title: 'About Image Resizer',
        width: 300,
        height: 300
    });

    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}

// app is ready
app.whenReady().then(() => {
    createMainWindow();

    // implement menu
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow()
        }
    })
});

// menu template
const menu = [
        ...(isMac ? [{
            label: app.name,
            submenu: [
                {
                    label: 'About',
                    click: createAboutWindow
                },
            ],
        }]
    : []),
    {
        role: 'fileMenu',
    },
    ...(!isMac ? [{
        label: 'Help',
        submenu: [{
            label: 'About',
            click: createAboutWindow
        }]
    }] : [])
];

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }
});