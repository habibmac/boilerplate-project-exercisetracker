const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
});

const User = mongoose.model("User", UserSchema, "exercise-tracker-fcc");

module.exports = User;
