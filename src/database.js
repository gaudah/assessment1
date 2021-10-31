let mongoose = require("mongoose");
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];

let mongoURI;
if (config.use_env_variable) {
  mongoURI = process.env[config.use_env_variable];
} else {
  mongoURI =
    "mongodb://" +
    config.username +
    ":" +
    config.password +
    "@" +
    config.host +
    ":" +
    config.port +
    "/" +
    config.database +
    "?authSource=admin" +
    "&socketTimeoutMS=1200000&connectTimeoutMS=1200000";
}

class Database {
  constructor() {
    this._connect();
  }

  _connect() {
    mongoose
      .connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("Database connection successful");
      })
      .catch((err) => {
        console.error("Database connection error :", err);
      });
  }
}

module.exports = new Database();
