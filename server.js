require("dotenv").config();
const express = require("express");
const app = express();
const chalk = require("chalk");
const cors = require("cors");
const mdb = require("./db/MongoDB");
const fs = require("fs");
const jwt = require("express-jwt");
const guard = require("express-jwt-permissions")();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const Permission = require("./models/PermissionSchema");

const publicKey = fs.readFileSync("./public.key", "utf8");

app.use(jwt({ secret: publicKey, algorithms: ["RS256"] }));

app.use(guard.check("permission:read"));

app.get("/:userId", (req, res) => {
  let { userId } = req.params;
  Permission.findOne({ userId: userId }, (err, permission) => {
    if (err) return res.status(500).send("app.find err");
    if (!permission) res.status(404).send();
    res.send(permission);
  });
});

app.patch("/:userId", guard.check("permission:write"), (req, res) => {
  let { userId } = req.params;
  let { permissions } = req.body;

  Permission.findOne({ userId: userId }, (err, permission) => {
    if (err) return res.status(500).send("app.find err");
    if (!permission) res.status(404).send();
    permission.permissions = permissions;

    permission.save((err) => {
      if (err) return res.status(500).send();
      res.send(permission);
    });
  });
});

mdb.once("open", () => {
  console.log(chalk.green("MongoDB connected"));
  app.listen(process.env.PORT, () => {
    console.log(`server running on port ${process.env.PORT}`);
  });
});
