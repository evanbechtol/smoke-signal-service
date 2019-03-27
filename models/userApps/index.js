const mongoose = require("mongoose");

const schema = mongoose.Schema({

    user: {
        _id: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true
        }
    },
    apps: {
        type: Array
    }

});

module.exports = mongoose.model("user_apps", schema);
