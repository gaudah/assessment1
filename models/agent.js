"use strict";
let mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const opts = {
  createdAt: "created_at",
  updatedAt: "updated_at",
};

let agentSchema = new mongoose.Schema({
  agent_id: {
    type: String,
  },
  agent_name: {
    type: String,
    unique: true,
    required: [true, "agent_name should be unique."],
  },
});

agentSchema.plugin(timestamps, opts);

const agentModel = mongoose.model("agent", agentSchema);
module.exports = {
  agentModel: agentModel,
};
