const mongo = require('mongodb');
const fs = require('fs');

//IMPORTANT: set the path to your authentication file before first run!
let raw = fs.readFileSync('path/to/authentication/file.json');
let keys = JSON.parse(raw);

const username = keys['username'];
const password = keys['password'];

//IMPORTANT: set your database connection string before first run!
var url = `mongodb://${username}:${password}@YOURMONGODBPATH/YOURDATABASE`;

var mongoClient = new mongo.MongoClient(url);

module.exports = mongoClient;
