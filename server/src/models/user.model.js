import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    about: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      default: null,
    },

    emailVerificationTokenExpires: {
      type: Date,
      default: null,
    },

    pendingEmail: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },

    forgotPasswordToken: {
      type: String,
      default: null,
    },

    forgotPasswordTokenExpires: {
      type: Date,
      default: null,
    },

    sessionVersion: {
      type: Number,
      default: 0,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    avatar: {
      type: String, //Cloudinary URL
      // required: true,
    },

    coverImage: {
      type: String, //Cloudinary URL
    },

    watchHistory: [
      {
        video: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Video",
        },
        watchedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    password: {
      type: String,
      required: [true, "Password is required!"],
    },

    refreshToken: {
      type: String,
    },
  },

  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  const accessToken = jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
      sessionVersion: this.sessionVersion,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );

  return accessToken;
};

userSchema.methods.generateRefreshToken = function (rememberMe) {
  const refreshToken = jwt.sign(
    {
      _id: this._id,
      rememberMe,
      sessionVersion: this.sessionVersion,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: rememberMe
        ? process.env.REFRESH_TOKEN_LONG_EXPIRY
        : process.env.REFRESH_TOKEN_SHORT_EXPIRY,
    }
  );

  return refreshToken;
};

export const User = mongoose.model("User", userSchema);
