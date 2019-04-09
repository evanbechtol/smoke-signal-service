const mongoose = require("mongoose");

const schema = mongoose.Schema({
  name: {
    type: String,
    index: true,
    default: ""
  },

});

module.exports = mongoose.model("Apps", schema);
