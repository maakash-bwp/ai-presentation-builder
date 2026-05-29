const mongoose = require("mongoose");
const { PRESENTATION_TEMPLATES } = require("../utils/constants");

const imageStyleSchema = new mongoose.Schema(
  {
    offsetX: {
      type: Number,
      default: 50
    },
    offsetY: {
      type: Number,
      default: 50
    },
    scale: {
      type: Number,
      default: 100
    }
  },
  { _id: false }
);

const slideSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    bulletPoints: [
      {
        type: String,
        trim: true,
        maxlength: 240
      }
    ],
    summary: {
      type: String,
      trim: true,
      maxlength: 500
    },
    imageUrl: {
      type: String,
      trim: true,
      default: ""
    },
    imagePrompt: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ""
    },
    layoutVariant: {
      type: String,
      enum: [
        "image-left",
        "image-right",
        "image-top",
        "image-bottom",
        "image-background"
      ],
      default: "image-right"
    },
    imageStyle: {
      type: imageStyleSchema,
      default: () => ({
        offsetX: 50,
        offsetY: 50,
        scale: 100
      })
    },
    order: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { _id: false }
);

const presentationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    template: {
      type: String,
      enum: PRESENTATION_TEMPLATES,
      default: "Minimal"
    },
    outline: [
      {
        type: String,
        trim: true
      }
    ],
    isFavorite: {
      type: Boolean,
      default: false
    },
    slides: {
      type: [slideSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

presentationSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model("Presentation", presentationSchema);
