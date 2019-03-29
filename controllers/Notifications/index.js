const toolNotification = require("../../models/toolNotification");
const qUtil = require("../../util/queryUtil");
const resUtil = require("../../util/responseUtil");

module.exports = {
	getToolNotificationUnreadList,
	updateNotification,
	createNotification,
	userDiscussion
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

async function createNotification(result, resp) {
	resp.forEach(function (data) {
		const inputData = {
			notifyReceiver: data.user,
			readTimeStamp: null,
			createdTimeStamp: new Date().toISOString(),
			cord: { _id: result._id, status: result.status, app: result.app, title: result.title },
			subject: result.subject,
			createdBy: result.puller
		}
		toolNotification
			.create(inputData, function (err, results) {
				if (err) {
					throw err;
				}
				return results;
			});
	});

}

async function userDiscussion(data) {
	
	let lookup = {};
	let result = [];
	if(data.status=="Open"){
	let creater = data.discussion[data.discussion.length - 1].user;
	for (let item, i = 0; item = data.discussion[i++];) {
		let id = item.user._id;
		if ((!(id in lookup)) && (id != data.discussion[data.discussion.length - 1].user._id)) {
			lookup[id] = 1;
			result.push({ user: { _id: item.user._id, username: item.user.username } });
		}
	}

	if (!(data.puller._id in lookup)) {
		if (data.puller._id != data.discussion[data.discussion.length - 1].user._id) {
			result.push({ user: { _id: data.puller._id, username: data.puller.username } });
		}
	}

	if (result.length > 0) {
		data.puller={_id:creater._id,username:creater.username};
		data.subject="Cord has been updated";
		return createNotification(data, result);
	}
}else{
	for (let item, i = 0; item = data.discussion[i++];) {
		let id = item.user._id;
		if ((!(id in lookup)) && (id != data.puller._id)) {
			lookup[id] = 1;
			result.push({ user: { _id: item.user._id, username: item.user.username } });
		}
	}
	if (result.length > 0) {
		data.subject="Cord has been resolved";
		return createNotification(data, result);
	}
}

}


