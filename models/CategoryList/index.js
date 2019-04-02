const mongoose = require("mongoose");

const categoryListSchema = mongoose.Schema({
  name: {
    type: String,
    default: ""
  }
}, {
  collection: "CategoryList"
});

module.exports = mongoose.model( "CategoryList", categoryListSchema );
