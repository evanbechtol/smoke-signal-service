
const qUtil = require("../../util/queryUtil");
const resUtil = require("../../util/responseUtil");
const objectUtil = require("../../util");
const logger = require("../../config/logger");
const UserApps = require("../../models/userApps");
const path = require("path");
const fs = require("fs");
const loki = require("lokijs");
const dbName = "db.json";
const collectionName = "files";
const uploadPath = "uploads";
const db = new loki(`${uploadPath}/${dbName}`, { persistenceMethod: "fs" });


const userAppsKeyWhitelist = [
  "user",
  "apps"
];

module.exports = {
  getUserApps,
  createUserApps
};

function getUserApps(req, res) {

  console.log(">>>", req.query);
  UserApps
    .find(req.query)
    .select({ __v: 0, description: 0 })
    // .sort( queryStrings.sort )
    // .limit( queryStrings.limit )
    .exec(function (err, results) {
      if (err) {
        return res.status(500).send(resUtil.sendError(err));
      }

      return res.send(resUtil.sendSuccess(results));
    });
}

// Todo: create callback to create userApps when user registered
function createUserApps(req, res) {
  if (req.body) {
    const body = objectUtil.whitelist(req.body, userAppsKeyWhitelist);
    UserApps
      .create(body, function (err, results) {
        if (err) {
          return res.status(500).send(resUtil.sendError(err));
        }
        return res.send(resUtil.sendSuccess(results));
      });
  } else {
    return res.status(400).send(resUtil.sendError("Request body not provided"));
  }
}