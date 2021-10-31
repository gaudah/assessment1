"use strict";
let mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const opts = {
  createdAt: "created_at",
  updatedAt: "updated_at",
};

let accountSchema = new mongoose.Schema({
  account_id: {
    type: mongoose.Schema.Types.ObjectId,
    //required: true,
  },
  account_type: {
    type: String,
    //unique: true,
    //required: [true, "account_type should be unique."],
  },
  account_name: {
    type: String,
    unique: true,
    required: [true, "account_name should be unique."],
  },
});

accountSchema.plugin(timestamps, opts);

const accountModel = mongoose.model("account", accountSchema);
module.exports = {
  accountModel: accountModel,
};
