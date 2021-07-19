const { MongoClient } = require('mongodb');

const conf = require('../config/default');
// Connection
//
const url = conf.dburl;
module.exports.client = new MongoClient(url);

