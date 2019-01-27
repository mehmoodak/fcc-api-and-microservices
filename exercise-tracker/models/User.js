const mongoose = require("mongoose");
const Schema = mongoose.Schema;

mongoose.set('useCreateIndex', true);

var userSchema = Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
});

var User = mongoose.model("User", userSchema);

module.exports = User;
