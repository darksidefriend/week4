const express = require('express');
const { chromium } = require('playwright');

const app = express();

/* CORS */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

/* /login */
app.get(['/login', '/login/'], (_, res) => {
  res.type('text/plain');
  res.end('23886bd5-1b0d-4860-8ed8-d9106051b1a1');
});

/* /test */
app.get(['/test', '/test/'], async (req, res) => {
  const targetURL = req.query.URL;
  if (!targetURL) return res.sendStatus(400);

  let browser;
  try {
    browser = await chromium.launch({
      args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(targetURL);

    await page.click('#bt');
    await page.waitForSelector('#inp[value]', { timeout: 2000 });

    const result = await page.$eval('#inp', el => el.value);

    res.type('text/plain');
    res.end(String(result));
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  } finally {
    if (browser) await browser.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
