const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();

/* CORS */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

/* body parser */
app.use(express.urlencoded({ extended: true }));

/* /login */
app.get('/login/', (_, res) => {
  res.send('23886bd5-1b0d-4860-8ed8-d9106051b1a1'); // ← сюда свой логин
});

/* /insert */
app.post('/insert/', async (req, res) => {
  let client;

  try {
    const { login, password, URL } = req.body;

    client = new MongoClient(URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    await client.connect();

    const dbName = URL.split('/').pop().split('?')[0];
    const db = client.db(dbName);
    const users = db.collection('users');

    await users.insertOne({
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

/* Render PORT */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
