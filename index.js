const express = require('express');
const { MongoClient } = require('mongodb');

const http = require('http');
const fs = require('fs');

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

app.use(express.urlencoded({ extended: true }));

app.get('/login/', (_, res) => {
  // TODO: Добавьте ваш логин
  res.send('daniil_savelev');
});

app.get('/hour/', (_, res) => {
  // TODO: Добавьте ваш логин
  const formatter = new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      hour12: false,
      timeZone: 'Europe/Moscow'
    });

    const hour = formatter.format(new Date());
    res.statusCode = 200;
    res.end(hour);
});


const PORT = 443;

http.createServer(app).listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
