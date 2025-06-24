// ./config/db/mongoClient.js
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri, { maxPoolSize: 50 });

let db = null;

async function connect() {
  if (!db) {
    try {
      await client.connect();
      db = client.db('WeelyReport');
      console.log('✅ MongoDB connected to WeelyReport');
    } catch (err) {
      console.error('❌ MongoDB connection failed:', err);
    }
  }
}

function getCollection(name) {
  if (!db) {
    throw new Error('MongoDB not connected yet!');
  }
  return db.collection(name);
}

module.exports = { connect, getCollection };
