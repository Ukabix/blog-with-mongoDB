// import mongoDB pack
const mongodb = require("mongodb");

// init MongoClient
const MongoClient = mongodb.MongoClient;

// call database var
let database;

// use connect method - returns promise so use async func
async function connect() {
  const client = await MongoClient.connect("mongodb://127.0.0.1:27017");
  // call db
  database = client.db("blog");
}

// use func to return database
function getDb() {
  // handle lack of connection
  if(!database){
    throw {message: "database connection not established!"};
  }
  return database;
}

// export JSON to execute elsewhere in app
module.exports = {
  connectToDatabase: connect,
  getDb: getDb
}