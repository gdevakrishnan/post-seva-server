const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema(
  {
    fromUserName: { type: String, required: true },
    fromAddress: { type: String, required: true },
    fromMobileNo: { type: String, required: true },
    fromPostalCode: { type: String, required: true },
    toPostalCode: { type: String, required: true },
    toUserName: { type: String, required: true },
    toAddress: { type: String, required: true },
    toMobileNo: { type: String, required: true },
    location: {
      fromLat: { type: Number, required: true },
      fromLng: { type: Number, required: true },
      toLat: { type: Number, required: true },
      toLng: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ["not-dispatch", "progressing", "dispatched"],
      default: "not-dispatch",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
