const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();

/* === CORS (ДОЛЖНО БЫТЬ ПЕРВЫМ) === */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

/* body parser */
app.use(express.urlencoded({ extended: false }));

/* /login */
app.get(['/login', '/login/'], (_, res) => {
  res.type('text/plain');
  res.end('23886bd5-1b0d-4860-8ed8-d9106051b1a1'); // ← ВПИШИ ЛОГИН БЕЗ ПРОБЕЛОВ
});

/* /insert */
app.post(['/insert', '/insert/'], async (req, res) => {
  let client;

  try {
    const { login, password, URL } = req.body;

    if (!login || !password || !URL) {
      return res.sendStatus(400);
    }

    client = await new MongoClient(URL).connect();

    const dbName = URL.split('/').pop().split('?')[0];
    const db = client.db(dbName);

    await db.collection('users').insertOne({
      login: String(login),
      password: String(password)
    });

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  } finally {
    if (client) await client.close();
  }
});

app.all('/r', (req, res) => {
  res.sendStatus(200);
});

/* start */
const PORT = process.env.PORT || 3000;
app.listen(PORT);
