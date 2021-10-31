"use strict";
let mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const opts = {
  createdAt: "created_at",
  updatedAt: "updated_at",
};

let policyCarrierSchema = new mongoose.Schema({
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    //required: true,
  },
  company_name: {
    type: String,
    unique: true,
    required: [true, "company_name should be unique."],
  },
});

policyCarrierSchema.plugin(timestamps, opts);

const policyCarrierModel = mongoose.model(
  "policy_carrier",
  policyCarrierSchema
);
module.exports = {
  policyCarrierModel: policyCarrierModel,
};
