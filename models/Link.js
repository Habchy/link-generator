const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true,
      unique: true,
      maxlength: 6,
    },
    created_at: Date,
    created_ip: String,
  },
  { collection: "links" }
);

module.exports = mongoose.model("Link", linkSchema);
