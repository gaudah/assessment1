"use strict";
let mongoose = require("mongoose");
require("@mongoosejs/double"); //plugin to support Double in mongoose
const timestamps = require("mongoose-timestamp");
const opts = {
  createdAt: "created_at",
  updatedAt: "updated_at",
};

let policyInfoSchema = new mongoose.Schema({
  policy_mode: {
    type: Number,
  },
  producer: {
    type: String,
  },
  policy_number: {
    type: String,
  },
  premium_amount: {
    type: mongoose.Schema.Types.Double,
  },
  policy_type: {
    type: String,
    enum: ["Single", "Package"],
  },
  company_collection_id: {
    // company id ref from policy_carrier
    type: String,
    //type: mongoose.Schema.Types.ObjectId,
  },
  policy_category: {
    // category id ref from policy_category
    type: String,
    //type: mongoose.Schema.Types.ObjectId,
  },
  policy_start_date: {
    type: String,
  },
  policy_end_date: {
    type: String,
  },
  csr: {
    type: String,
  },
  account_id: {
    // account_id ref from account
    type: String,
    //type: mongoose.Schema.Types.ObjectId,
  },
  primary: {
    type: String,
  },
  user_id: {
    // user_id ref from user
    //type: String,
    type: mongoose.Schema.Types.ObjectId,
  },
  collection_id: {
    // agent_id ref from agent i.e agency id
    type: String,
    //type: mongoose.Schema.Types.ObjectId,
  },
  has_active_client_id: {
    type: String,
  },
});

policyInfoSchema.plugin(timestamps, opts);

const policyInfoModel = mongoose.model("policy_info", policyInfoSchema);
module.exports = {
  policyInfoModel: policyInfoModel,
};
