const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';

let mainWindow;
let aboutWindow;

// Main Window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: isDev ? 1000 : 500,
    height: 600,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: isDev,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

// About Window
function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    width: 300,
    height: 300,
    title: 'О программе',
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}

// Запуск приложения
app.on('ready', () => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  mainWindow.on('closed', () => (mainWindow = null));
});

// Меню
const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: 'О программе',
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  {
    role: 'fileMenu',
  },
  ...(!isMac
    ? [
        {
          label: 'Справка',
          submenu: [
            {
              label: 'О программе',
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
];

// IPC обработчик
ipcMain.on('image:resize', async (e, options) => {
  console.log(`Получено: ${options.filename} ${options.width}x${options.height}`);
  
  // Проверяем наличие данных
  if (!options.buffer || !options.filename) {
    mainWindow.webContents.send('image:error', 'Неверные данные файла');
    return;
  }

  options.dest = path.join(os.homedir(), 'imageresizer');
  
  try {
    await resizeImage(options);
  } catch (err) {
    console.error('Общая ошибка:', err.message);
    mainWindow.webContents.send('image:error', err.message);
  }
});

// resizeImage
async function resizeImage({ buffer, filename, height, width, dest }) {
  try {
    // Buffer
    const imgBuffer = Buffer.from(buffer);
    
    // Изменяем размер изображения
    const newPath = await resizeImg(imgBuffer, {
      width: +width,
      height: +height,
    });

    // Создаем папку если нет
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    // Сохраняем файл
    const outputPath = path.join(dest, filename);
    fs.writeFileSync(outputPath, newPath);
    
    console.log(`✅ Сохранено: ${outputPath}`);
    mainWindow.webContents.send('image:done');
    shell.openPath(dest); // Открываем папку
  } catch (err) {
    console.error('resizeImage ошибка:', err);
    throw new Error(`Ошибка обработки: ${err.message}`);
  }
}

// Закрытие приложения
app.on('window-all-closed', () => {
  if (!isMac) app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});
