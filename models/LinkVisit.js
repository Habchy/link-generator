const mongoose = require("mongoose");

const linkVisitSchema = new mongoose.Schema(
  {
    identifier: String,
    ip: String,
    location_country: String,
    location_region: String,
    location_city: String,
    device: String,
    browser: String,
    visited: Date,
  },
  { collection: "linkvisits" }
);

module.exports = mongoose.model("LinkVisit", linkVisitSchema);
