const express = require('express');
const puppeteer = require('puppeteer');
const http = require('http'); // Изменено с https на http

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

app.get('/login/', (_, res) => {
  // TODO: Добавьте ваш логин
  res.send('23886bd5-1b0d-4860-8ed8-d9106051b1a1');
});

app.get('/test/', async (req, res) => {
  const targetURL = req.query.URL;
  
  if (!targetURL) {
    return res.status(400).send('Missing URL parameter');
  }

  try {
    // Конфигурация для Render.com
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process' // Важно для ограниченных ресурсов
      ],
      // Render.com автоматически устанавливает Chrome
      executablePath: process.env.CHROMIUM_PATH || 
                    (process.platform === 'linux' ? '/usr/bin/chromium-browser' : null)
    });

    const page = await browser.newPage();
    
    // Установка таймаутов
    page.setDefaultNavigationTimeout(10000);
    page.setDefaultTimeout(10000);
    
    await page.goto(targetURL, { 
      waitUntil: ['networkidle2', 'domcontentloaded'],
      timeout: 10000
    });

    await page.click('#bt');

    await page.waitForFunction(() => {
      const input = document.querySelector('#inp');
      return input && input.value;
    }, { timeout: 5000 });

    const result = await page.evaluate(() => {
      return document.querySelector('#inp').value;
    });

    await browser.close();

    res.send(result || 'No result found');
  } catch (error) {
    console.error('Error in /test endpoint:', error);
    res.status(500).send(`Error: ${error.message}`);
  }
});

// Проверка работоспособности (для health check)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Корневой путь
app.get('/', (req, res) => {
  res.send('Puppeteer server is running');
});

const PORT = process.env.PORT || 3000; // Render.com использует свой PORT

// На Render.com HTTPS обрабатывается на их балансировщике
// Используем HTTP сервер
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});