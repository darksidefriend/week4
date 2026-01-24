// index.js
// import express from "express";
// import { createReadStream } from "fs";
// import crypto from "crypto";
// import http from "http";
// import bodyParser from "body-parser";

// import appSrc from "./app.js";

// const app = appSrc(express, bodyParser, createReadStream, crypto, http);

// app.listen(3000);

const express = require("express");
const { createReadStream } = require("fs");
const crypto = require("crypto");
const http = require("http");
const bodyParser = require("body-parser");

const appSrc = require("./app.js");

const app = appSrc(express, bodyParser, createReadStream, crypto, http);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});