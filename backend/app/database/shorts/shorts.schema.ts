import { Schema } from "mongoose";

const ShortSchema = new Schema(
  {
    image: {
      name: { type: String },
      blobName: { type: String },
      blobUrl: { type: String },
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    hyperlink: { type: String },
    pin: { type: Schema.Types.ObjectId, ref: "Pin" },
    postCode: { type: String },
    housingCondition: { type: String },
  },
  { timestamps: true }
);

export default ShortSchema;
