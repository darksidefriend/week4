const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

/* ===== CORS (для LMS) ===== */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

/* ===== /login ===== */
app.get(['/login', '/login/'], (_, res) => {
  res.type('text/plain');
  res.end('23886bd5-1b0d-4860-8ed8-d9106051b1a1'); // ← ВПИШИ СВОЙ ЛОГИН
});

/* ===== /test ===== */
app.get(['/test', '/test/'], async (req, res) => {
  const targetURL = req.query.URL;

  if (!targetURL) {
    return res.sendStatus(400);
  }

  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });

    const page = await browser.newPage();
    await page.goto(targetURL, { waitUntil: 'networkidle2' });

    await page.click('#bt');

    await page.waitForFunction(() => {
      const inp = document.querySelector('#inp');
      return inp && inp.value;
    }, { timeout: 2000 });

    const result = await page.evaluate(() => {
      return document.querySelector('#inp').value;
    });

    res.type('text/plain');
    res.end(String(result));
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  } finally {
    if (browser) await browser.close();
  }
});

/* ===== START ===== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
