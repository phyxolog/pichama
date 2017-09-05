var mongoose = require('mongoose');
// var redis = require('redis'), redisClient = redis.createClient(); // connect to redis
var Sequelize = require('sequelize');
var config = require('utils/config.js');

// connect to database (MongoDB)
mongoose.connect(config.get('mongoose:uri'));

mongoose.connection.on('error', () => {
  console.error('MongoDB Connection Error.');
  process.exit(1);
});

mongoose.set('debug', function (collectionName, method, query, doc) {
  console.log(`Mongoose ${collectionName}.${method}(${JSON.stringify(query)}) ${JSON.stringify(doc)}`);
});

module.exports.mongoose = mongoose;
// module.exports.redis = redisClient;
