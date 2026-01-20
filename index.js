const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

// Маршрут /login/ - возвращает ваш логин
app.get('/login/', (_, res) => {
  // ЗАМЕНИТЕ 'your-login' на ваш реальный логин!
  res.set('Content-Type', 'text/plain');
  res.send('23886bd5-1b0d-4860-8ed8-d9106051b1a1'); // Например: 'ivanov_i'
});

// Маршрут /test/ - обрабатывает запрос
app.get('/test/', async (req, res) => {
  const targetURL = req.query.URL;
  
  // Проверяем наличие URL
  if (!targetURL) {
    res.status(400).set('Content-Type', 'text/plain');
    return res.send('Error: Missing URL parameter');
  }

  let browser;
  
  try {
    // Конфигурация Puppeteer для Render.com
    const launchOptions = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--single-process',
        '--no-zygote'
      ]
    };

    // На Render.com используем Chrome по умолчанию
    if (process.env.RENDER) {
      launchOptions.executablePath = process.env.CHROME_BIN || 
                                   '/usr/bin/google-chrome-stable';
    }

    browser = await puppeteer.launch(launchOptions);
    
    const page = await browser.newPage();
    
    // Устанавливаем таймауты
    page.setDefaultNavigationTimeout(10000);
    page.setDefaultTimeout(10000);
    
    // Настройка User-Agent
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Переходим по URL
    await page.goto(targetURL, { 
      waitUntil: ['networkidle2', 'domcontentloaded'],
      timeout: 10000
    });

    // Ждем появления кнопки
    await page.waitForSelector('#bt', { timeout: 5000 });
    
    // Кликаем по кнопке
    await page.click('#bt');
    
    // Ждем изменения значения в поле ввода
    await page.waitForFunction(() => {
      const input = document.querySelector('#inp');
      return input && input.value && input.value.trim() !== '';
    }, { timeout: 5000 });

    // Получаем значение из поля ввода
    const result = await page.evaluate(() => {
      const input = document.querySelector('#inp');
      return input ? input.value : '';
    });

    await browser.close();
    
    // Возвращаем результат как plain text
    res.set('Content-Type', 'text/plain');
    res.send(result || '0');

  } catch (error) {
    console.error('Error:', error);
    
    // Закрываем браузер при ошибке
    if (browser) {
      await browser.close().catch(e => console.error('Error closing browser:', e));
    }
    
    res.status(500).set('Content-Type', 'text/plain');
    res.send(`Error: ${error.message}`);
  }
});

// Health check для Render.com
app.get('/health', (req, res) => {
  res.status(200).set('Content-Type', 'text/plain');
  res.send('OK');
});

// Корневой маршрут
app.get('/', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send('Server is running. Use /login/ or /test/?URL=...');
});

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Render.com: ${process.env.RENDER ? 'Yes' : 'No'}`);
});