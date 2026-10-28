import { Schema } from "mongoose";

const PinSchema = new Schema(
  {
    latlng: {
      lat: Number,
      lng: Number,
    },
    address: { type: Schema.Types.ObjectId, ref: "Address" },
    name: String,
    creator: { type: Schema.Types.ObjectId, ref: "User" },
    description: Schema.Types.Mixed,
    markerIconType: {
      type: String,
      enum: ["default", "wind power", "solar", "heat"],
    },
  },
  { timestamps: true }
);

export default PinSchema;
