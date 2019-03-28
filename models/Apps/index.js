const mongoose = require("mongoose");

const schema = mongoose.Schema({
  name: {
    type: String,
    default: ""
  },

});

module.exports = mongoose.model("apps", schema);
