var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');

const err = require('./middlewares/errors');

var app = express();
// app settings
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
const services = require('./services');
app.use('/v1', services);

app.use(err.error404);
app.use(err.error5xx);

module.exports = app;
