const Redis = require("ioredis");
const chalk = require("chalk");
const redis = new Redis({ keyPrefix: "auth:" });

redis.on("error", (e) => {
  console.log(chalk.red(e.message));
  throw new Error("Redis error");
});

module.exports = redis;
