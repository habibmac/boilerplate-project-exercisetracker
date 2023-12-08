const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date, default: Date.now },
});

const Exercise = mongoose.model("Exercise", exerciseSchema);

module.exports = Exercise;