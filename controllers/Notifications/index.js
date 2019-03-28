const toolNotification = require("../../models/toolNotification");
const userApps = require("../../models/userApps");
const qUtil = require("../../util/queryUtil");
const resUtil = require("../../util/responseUtil");

module.exports = {
	getToolNotificationUnreadList,
	updateNotification,
	createNotification,
};

function getToolNotificationUnreadList(req, res) {
	const queryStrings = qUtil.getDbQueryStrings(req.query);

	//to get list of unread notification
	toolNotification
		.find(queryStrings.query)
		.sort({ created_timestamp: 'desc' })
		.limit(queryStrings.limit)
		.exec(function (err, results) {
			if (err) {
				return res.status(500).send(resUtil.sendError(err));
			}
			return res.send(resUtil.sendSuccess(results));
		});
}


function updateNotification(req, res) {
	const _id = req.query.id || req.params.id || null;

	if (_id) {
		const updatedData = { $set: { readTimeStamp: new Date() } };

		toolNotification.findByIdAndUpdate(_id, updatedData, function (err, result) {
			if (err) {
				return res.send(resUtil.sendError(err)) // 500 error				 
			}
			req.query = req.body;
			getToolNotificationUnreadList(req, res);
		});
	}
}

async function createNotification(result, req, res) {
	const queryStrings = { apps: result.app }
	userApps
		.find(queryStrings)
		.select({ __v: 0, description: 0 })
		.exec(function (err, resp) {
			if (err) {
				return err;
			}
			resp.forEach(function (data) {
				const inputData = {
					notifyReceiver: data.user,
					readTimeStamp: null,
					createdTimeStamp: new Date().toISOString(),
					cord: { _id: result._id, status: result.status, app: result.app, title: result.status },
					subject: "New Cord has been created",
					createdBy: result.puller
				}
				toolNotification
					.create(inputData, function (err, results) {
						if (err) {
							console.log("error", err);
							throw err;
						}
						return results;
					});
			});

		});

}




