"use strict";
let mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const opts = {
  createdAt: "created_at",
  updatedAt: "updated_at",
};

let userSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    //required: true,
  },
  user_type: {
    type: String,
  },
  first_name: {
    type: String,
  },
  date_of_birth: { type: Date },
  address: {
    type: String,
  },
  contact_number: {
    type: Number,
    validate: {
      validator: (v) => {
        return /d{10}/.test(v);
      },
      message: "{VALUE} is not a valid 10 digit number!",
    },
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  zip_code: {
    type: String,
    //min: [10000, "Zip code too short"],
    //max: 99999,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", ""],
  },
});

userSchema.plugin(timestamps, opts);

const userModel = mongoose.model("user", userSchema);
module.exports = {
  userModel: userModel,
};
