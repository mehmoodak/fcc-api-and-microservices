const mongoose = require("mongoose");
const Schema = mongoose.Schema;

mongoose.set("useCreateIndex", true);

var exerciseSchema = Schema({
  username: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

var Exercise = mongoose.model("Exercise", exerciseSchema);

module.exports = Exercise;
