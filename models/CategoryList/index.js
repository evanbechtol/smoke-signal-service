const mongoose = require("mongoose");

const CategoryListSchema = mongoose.Schema({
  name: {
    type: String,
    default: ""
  }
}, {
  collection: 'category_list'
});

module.exports = mongoose.model("CategoryList", CategoryListSchema);
