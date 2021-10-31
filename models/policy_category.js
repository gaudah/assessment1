"use strict";
let mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const opts = {
  createdAt: "created_at",
  updatedAt: "updated_at",
};

let policyCategorySchema = new mongoose.Schema({
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    //required: true,
  },
  category_name: {
    type: String,
    unique: true,
    required: [true, "category_name should be unique."],
  },
});

policyCategorySchema.plugin(timestamps, opts);

const policyCategoryModel = mongoose.model(
  "policy_category",
  policyCategorySchema
);
module.exports = {
  policyCategoryModel: policyCategoryModel,
};
