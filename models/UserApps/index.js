const mongoose = require("mongoose");

const schema = mongoose.Schema({

    user: {
        _id: {
            type: String,
            index: true,
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


module.exports = mongoose.model("User_Apps", schema);
