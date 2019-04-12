const mongoose = require("mongoose");

const CategoryListSchema = mongoose.Schema({
  name: {
    type: String,
    default: ""
  }
});

module.exports = mongoose.model("CategoryList", CategoryListSchema);
