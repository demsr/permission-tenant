const mongoose = require("mongoose");
const moment = require("moment");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const Redis = require("ioredis");
const publisher = new Redis();
const subscriber = new Redis();

const Schema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  permissions: [String],
});

Schema.post("save", (model) => {
  publisher.publish("permission", JSON.stringify(model));
});

const Model = mongoose.model("Permission", Schema);

subscriber.subscribe("user", (err, count) => {
  if (err) {
    // Just like other commands, subscribe() can fail for some reasons,
    // ex network issues.
    console.error("Failed to subscribe: %s", err.message);
  } else {
    // `count` represents the number of channels this client are currently subscribed to.
    console.log(
      `Subscribed successfully! This client is currently subscribed to ${count} channels.`
    );
  }
});

subscriber.on("message", (channel, message) => {
  message = JSON.parse(message);

  Model.findOne({ userId: message._id }, (err, model) => {
    if (err) return console.log(err);
    if (!model) {
      new Model({ userId: message._id, permissions: ["user:read"] }).save(
        (err) => {
          if (err) console.log(err);
        }
      );
    }
  });
});

module.exports = Model;
