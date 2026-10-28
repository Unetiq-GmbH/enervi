import { Schema } from "mongoose";

const ManipulatedImageSchema = new Schema(
  {
    uuid: {
      type: String,
      required: true,
    },
    originalImage: {
      name: {
        type: String,
      },
      blobUrl: {
        type: String,
      },
      blobName: {
        type: String,
      },
    },
    manipulatedImageVariants: [
      {
        name: {
          type: String,
        },
        blobUrl: {
          type: String,
        },
        blobName: {
          type: String,
        },
      },
    ],
    visualizationType: {
      type: String,
    },
    adjustment: {
      type: String,
    },
    lang: {
      type: String,
    },
    housingCondition: {
      type: String,
    },
    custom_prompt: {
      type: String,
    },
    custom_negative_prompt: {
      type: String,
    },
    flux_prompt: {
      type: String,
    },
    flux_object_to_detect: {
      type: String,
    },
    inProcess: {
      type: Boolean,
      default: false,
    },
    sentToServer: {
      type: Boolean,
      default: false,
    },
    error: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default ManipulatedImageSchema;
