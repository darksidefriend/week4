const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();

/* CORS */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    '*'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,OPTIONS'
  );

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

/* body parser для application/x-www-form-urlencoded */
app.use(express.urlencoded({ extended: false }));

/* ===== ROUTES ===== */

/* /login */
app.get(['/login', '/login/'], (_, res) => {
  res.type('text/plain');
  res.send('23886bd5-1b0d-4860-8ed8-d9106051b1a1'); // ← ВПИШИ СВОЙ ЛОГИН
});

/* /insert */
app.post(['/insert', '/insert/'], async (req, res) => {
  let client;

  try {
    console.log('BODY:', req.body);

    const { login, password, URL } = req.body;

    if (!login || !password || !URL) {
      return res.sendStatus(400);
    }

    client = await new MongoClient(URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).connect();

    /* определяем БД из строки подключения */
    const dbName = URL.split('/').pop().split('?')[0];
    const db = client.db(dbName);

    await db.collection('users').insertOne({
      login: String(login),
      password: String(password)
    });

    res.sendStatus(200);
  } catch (err) {
    console.error('ERROR:', err);
    res.sendStatus(500);
  } finally {
    if (client) await client.close();
  }
});

/* ===== START SERVER ===== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
