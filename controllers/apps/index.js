const resUtil = require("../../util/responseUtil");
const qUtil = require("../../util/queryUtil");
const Apps = require("../../models/Apps");



module.exports = {
  getApps
};

function getApps(req, res) {
  const queryStrings = qUtil.getDbQueryStrings(req.query);
  Apps
    .find(queryStrings.query)
    .exec(function (err, results) {
      if (err) {
        return res.status(500).send(resUtil.sendError(err));
      }
      return res.send(resUtil.sendSuccess(results));
    });
}