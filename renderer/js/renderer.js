const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const widthInput = document.querySelector('#width');
const heightInput = document.querySelector('#height');

console.log('✅ Renderer.js загружен');

// ✅ Toastify уведомления в правом верхнем углу
function showToast(type, message) {
  const toastConfig = {
    text: message,
    duration: type === 'success' ? 4000 : 5000,
    close: true,
    gravity: "top",
    position: "center",
    stopOnFocus: true,
    style: {
      background: type === 'success' ? '#10B981' : '#EF4444',
      color: 'white',
      fontFamily: 'Poppins, sans-serif',
      borderRadius: '12px',
      fontSize: '18px',
      fontWeight: '500',
      padding: '20px 40px',
      width: '90%',
      maxWidth: '600px',
      margin: '0 auto',
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      border: '1px solid rgba(255,255,255,0.2)'
    }
  };
  
  Toastify(toastConfig).showToast();
}

// Загрузка изображения
function loadImage(e) {
  console.log('📁 Файл выбран');
  const file = e.target.files[0];
  
  if (!file) return;
  
  if (!isFileImage(file)) {
    showToast('error', 'Только JPG, PNG, GIF');
    return;
  }

  form.classList.remove('hidden');
  filename.textContent = file.name;
  outputPath.textContent = '~\\imageresizer';

  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function() {
    widthInput.value = this.width;
    heightInput.value = this.height;
    console.log(`📐 Размеры: ${this.width}x${this.height}`);
  };
}

function isFileImage(file) {
  return ['image/gif', 'image/jpeg', 'image/png'].includes(file.type);
}

// Изменение размера
function resizeImage(e) {
  e.preventDefault();
  console.log('🔄 Resize');
  
  const file = img.files[0];
  if (!file) {
    showToast('error', 'Выберите изображение');
    return;
  }

  const w = parseInt(widthInput.value);
  const h = parseInt(heightInput.value);
  
  if (!w || !h || w <= 0 || h <= 0) {
    showToast('error', 'Введите размеры > 0');
    return;
  }

  const reader = new FileReader();
  reader.onload = function() {
    window.electronAPI.sendResize({
      buffer: reader.result,
      filename: file.name,
      width: w,
      height: h
    });
  };
  
  reader.readAsArrayBuffer(file);
}

// ✅ Обработчики IPC (ТОЛЬКО для main.js ответов)
if (window.electronAPI) {
  window.electronAPI.onDone(() => {
    showToast('success', `✅ Готово! ${widthInput.value}×${heightInput.value}`);
  });

  window.electronAPI.onError((error) => {
    showToast('error', `❌ ${error}`);
  });
}

// События
img.addEventListener('change', loadImage);
form.addEventListener('submit', resizeImage);

console.log('✅ Готово');
