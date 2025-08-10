import { User } from "../models/user.model.js";
import { SecurityEvent } from "../models/securityEvent.model.js";
import { DeviceSession } from "../models/deviceSession.model.js";
import { NextFunction, Request, Response } from "express";
import { startSession } from "mongoose";
import requestIp from "request-ip";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { Subscription } from "../models/subscription.model.js";
import { SubscriptionHistory } from "../models/subscriptionHistory.model.js";
import sendEmail from "../utils/sendEmail.js";
import {
  newLoginDeviceTemplate,
  signupEmailTemplate
} from "../utils/emailTemplates.js";
import { OAuth2Client } from "google-auth-library";
import { asyncHandler } from "../utils/asyncHandler.js";

// Handles user registration with email/password, device/session logging, security event, and trial subscription creation. Sends welcome email and sets auth cookies.
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if(!req.body){
    throw new ApiError(400, "Request body is required");
  }
  // Start a MongoDB session for transaction
  const session = await startSession();
  try {
    session.startTransaction();
    // Validate input
    if (!req?.body?.email || !req?.body?.password || !req?.body?.fullName) {
      throw new ApiError(
        400,
        "Please provide email, password, and full name to continue"
      );
    }
    const { email, password, fullName } = req.body;

    // Check for empty values
    if ([email, password].some((value) => value?.trim() === "")) {
      throw new ApiError(400, "Email and Password both fields are required");
    }

    // Prevent duplicate users
    const isUserExists = await User.findOne({ email }).session(session);

    if (isUserExists) {
      throw new ApiError(400, "User already exists");
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ApiError(400, "Invalid email format");
    }

    // Validate password strength 
    if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&.,:;'"<>?() \[\] {}|\\/~`_^+-]{8,}$/.test(password)) {
      throw new ApiError(400, "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number");
    }

    // Split full name into first and last names
    const [firstName, ...lastNameParts] = fullName.split(" ");
    const lastName = lastNameParts.join(" ");
    
    // Create user document
    const user = await User.create([{ email, password, firstName, lastName }], { session });

    // Generate JWT tokens for authentication
    const refreshToken = generateRefreshToken(user[0]._id as string);
    const accessToken = generateAccessToken({
      _id: user[0]._id as string,
      role: user[0].role,
      email: user[0].email,
    });

    // Create device session document for security and session management
    await DeviceSession.create(
      [
        {
          userId: user[0]._id,
          ipAddress: requestIp.getClientIp(req) || "Unknown IP",
          userAgent: req.header("user-agent") || "Unknown User Agent",
          refreshToken,
        },
      ],
      { session }
    );

    // Create security event document for auditing
    await SecurityEvent.create(
      [
        {
          userId: user[0]._id,
          eventType: "signup",
          ipAddress: requestIp.getClientIp(req) || "Unknown IP",
          userAgent: req.header("user-agent") || "Unknown User Agent",
          isEmailSent: true,
        },
      ],
      { session }
    );

    // Create a trial subscription for the new user
    const subscription = await Subscription.create(
      [
        {
          userId: user[0]._id,
          isTrial: true,
          trialExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isSubscriptionActive: true,
        },
      ],
      { session }
    );

    // Create subscription history for future reference
    await SubscriptionHistory.create(
      [
        {
          userId: user[0]._id,
          amount: 0,
          isTrial: true,
          trialExpiresAt: subscription[0].trialExpiresAt,
        },
      ],
      { session }
    );

    // Commit transaction to save all changes atomically
    await session.commitTransaction();
    session.endSession();

    // Send welcome email (non-blocking)
    sendEmail(
      email,
      "signup-success",
      signupEmailTemplate(user[0].firstName ?? "User")
    );

    // Set secure cookies and send response
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? ("None" as "none")
          : ("Strict" as "strict"),
    };
    res
      .status(201)
      .cookie("accessToken", accessToken, {
        ...options,
        maxAge: Number(process.env.ACCESS_TOKEN_EXPIRY) * 24 * 60 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        ...options,
        maxAge: Number(process.env.REFRESH_TOKEN_EXPIRY) * 24 * 60 * 60 * 1000,
      })
      .json(
        new ApiResponse(
          201,
          {
            _id: user[0]._id,
            email: user[0].email,
            role: user[0].role,
            firstName: user[0].firstName || "",
            lastName: user[0].lastName || "",
            avatar: user[0].avatar || "",
          },
          "Sign up successful"
        )
      );
  } catch (err) {
    // Rollback transaction on error
    if(session.inTransaction()){
      await session.abortTransaction();
    }
    session.endSession();
    next(err);
  }
};

// Handles user login, device session management, security event logging, and sets auth cookies
export const signin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Start a MongoDB session for transaction
  const session = await startSession();
  try {
    session.startTransaction();
    // Validate required fields in request body
    if (!req?.body?.email || !req?.body?.password) {
      throw new ApiError(
        400,
        "Please provide a email and a password to continue"
      );
    }
    const { email, password } = req.body;

    // Find user by email and check password
    const user = await User.findOne({ email }).session(session);

    if (!user || !(await user.isPasswordCorrect(password))) {
      throw new ApiError(401, "Invalid credentials");
    }

    // Generate JWT tokens for authentication
    const refreshToken = generateRefreshToken(user._id as string);
    const accessToken = generateAccessToken({
      _id: user._id as string,
      role: user.role,
      email: user.email,
      firstName: user.firstName || "",
    });

    // Check for existing device session for this user/device
    const deviceSession = await DeviceSession.findOne({
      userId: user._id,
      ipAddress: requestIp.getClientIp(req),
      userAgent: req.header("user-agent"),
    }).session(session);

    if (deviceSession) {
      // If session is revoked, deny access
      if (deviceSession.revoked) {
        throw new ApiError(
          401,
          "You don't have permission to access this account"
        );
      }
      // Update session with new refresh token and last active time
      deviceSession.refreshToken = refreshToken;
      deviceSession.lastActiveAt = new Date();
      await deviceSession.save();
    } else {
      // If no session, create a new device session
      await DeviceSession.create(
        [
          {
            userId: user._id,
            ipAddress: requestIp.getClientIp(req) || "Unknown IP",
            userAgent: req.header("user-agent") || "Unknown User Agent",
            refreshToken,
          },
        ],
        { session }
      );
      // Send new device login notification email
      const { success } = await sendEmail(
        email,
        "new-login",
        newLoginDeviceTemplate(user.firstName ?? "User", req.header("user-agent") || "Unknown Device", requestIp.getClientIp(req) || "Unknown IP")
      );

      // Log security event for new login
      await SecurityEvent.create(
        [
          {
            userId: user._id,
            eventType: "new_login",
            ipAddress: requestIp.getClientIp(req) || "Unknown IP",
            userAgent: req.header("user-agent") || "Unknown User Agent",
            isEmailSent: success,
          },
        ],
        { session }
      );
    }

    // Commit transaction and end session
    await session.commitTransaction();
    session.endSession();

    // Set secure cookies for tokens and send response
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? ("None" as "none")
          : ("Strict" as "strict"),
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, {
        ...options,
        maxAge: Number(process.env.ACCESS_TOKEN_EXPIRY) * 24 * 60 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        ...options,
        maxAge: Number(process.env.REFRESH_TOKEN_EXPIRY) * 24 * 60 * 60 * 1000,
      })
      .json(
        new ApiResponse(
          200,
          {
            _id: user._id,
            email: user.email,
            role: user.role,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            avatar: user.avatar || "",
          },
          "Sign in successful"
        )
      );
  } catch (err) {
    // Rollback transaction on error
    if(session.inTransaction()){
      await session.abortTransaction();
    }
    session.endSession();
    next(err);
  }
};

// Handles Google OAuth sign-in and sign-up, manages device/session/subscription, logs security events, sends emails, and sets auth cookies
export const google = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Start a MongoDB session for transaction
  const session = await startSession();
  try {
    session.startTransaction();
    // Verify Google ID token from request
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    // Check if ID token is provided
    if (!req?.body?.idToken) {
      throw new ApiError(400, "Please provide a Google ID token to continue");
    }
    const { idToken } = req.body;
    // Verify the ID token with Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new ApiError(400, "Invalid Google ID token");
    }
    const {
      sub: googleId,
      email,
      given_name,
      family_name,
      picture,
      name,
      email_verified,
    } = payload;

    // Check if email is verified by Google
    if (!email_verified) {
      throw new ApiError(400, "Email not verified by Google");
    }

    // Check if user already exists in the database
    const user = await User.findOne({ email }).session(session);

    if (user) {
      if(!user.firstName || user.firstName === "" || !user.lastName || user.lastName === "" || !user.avatar) {
        // Update user details if they are missing
        if(!user.firstName || user.firstName === "") {
          user.firstName = given_name || name?.split(" ")[0] || "";
        }
        if(!user.lastName || user.lastName === "") {
          user.lastName = family_name || name?.split(" ")[1] || "";
        }
        if(!user.avatar || user.avatar === "") {
          user.avatar = picture || undefined;
        }
        await user.save({ session });
      }
      // Existing user: generate tokens and manage device session
      const refreshToken = generateRefreshToken(user._id as string);
      const accessToken = generateAccessToken({
        _id: user._id as string,
        email: user.email,
        role: user.role,
        firstName: user.firstName || "",
      });

      // Check for existing device session for this user/device
      const deviceSession = await DeviceSession.findOne({
        userId: user._id,
        ipAddress: requestIp.getClientIp(req),
        userAgent: req.header("user-agent"),
      }).session(session);

      if (deviceSession) {
        // If session is revoked, deny access
        if (deviceSession.revoked) {
          throw new ApiError(
            401,
            "You don't have permission to access this account"
          );
        }
        // Update session with new refresh token and last active time
        deviceSession.refreshToken = refreshToken;
        deviceSession.lastActiveAt = new Date();
        await deviceSession.save();
      } else {
        // If no session, create a new device session
        await DeviceSession.create(
          [
            {
              userId: user._id,
              ipAddress: requestIp.getClientIp(req) || "Unknown IP",
              userAgent: req.header("user-agent") || "Unknown User Agent",
              refreshToken,
            },
          ],
          { session }
        );

        // Send new device login notification email
        const { success } = await sendEmail(
          email,
          "new-login",
          newLoginDeviceTemplate(user.firstName ?? "User", req.header("user-agent") || "Unknown Device", requestIp.getClientIp(req) || "Unknown IP")
        );

        // Create security event for new login
        await SecurityEvent.create(
          [
            {
              userId: user._id,
              eventType: "new_login",
              ipAddress: requestIp.getClientIp(req) || "Unknown IP",
              userAgent: req.header("user-agent") || "Unknown User Agent",
              isEmailSent: success,
            },
          ],
          { session }
        );
      }

      // Commit transaction and end session
      await session.commitTransaction();
      session.endSession();

      // Set secure cookies for tokens and send response
      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite:
          process.env.NODE_ENV === "production"
            ? ("None" as "none")
            : ("Strict" as "strict"),
      };

      res
        .status(200)
        .cookie("accessToken", accessToken, {
          ...options,
          maxAge: Number(process.env.ACCESS_TOKEN_EXPIRY) * 24 * 60 * 60 * 1000,
        })
        .cookie("refreshToken", refreshToken, {
          ...options,
          maxAge:
            Number(process.env.REFRESH_TOKEN_EXPIRY) * 24 * 60 * 60 * 1000,
        })
        .json(
          new ApiResponse(
            200,
            {
              _id: user._id,
              email: user.email,
              role: user.role,
              firstName: user.firstName || "",
              lastName: user.lastName || "",
              avatar: user.avatar || "",
            },
            "Google Sign in successful"
          )
        );
    } else {
      // New user: create user and all related records
      const user = await User.create(
        [
          {
            email,
            firstName: given_name || name?.split(" ")[0],
            lastName: family_name || name?.split(" ")[1] || "",
            oauthProvider: "google",
            oauthId: googleId,
            avatar: picture || undefined,
          },
        ],
        { session }
      );

      // Generate tokens for new user
      const refreshToken = generateRefreshToken(user[0]._id as string);
      const accessToken = generateAccessToken({
        _id: user[0]._id as string,
        email: user[0].email,
        role: user[0].role,
        firstName: "",
      });

      // Create device session for new user
      await DeviceSession.create(
        [
          {
            userId: user[0]._id,
            ipAddress: requestIp.getClientIp(req) || "Unknown IP",
            userAgent: req.header("user-agent") || "Unknown User Agent",
            refreshToken,
          },
        ],
        { session }
      );
      // Create security event for signup
      await SecurityEvent.create(
        [
          {
            userId: user[0]._id,
            eventType: "signup",
            ipAddress: requestIp.getClientIp(req) || "Unknown IP",
            userAgent: req.header("user-agent") || "Unknown User Agent",
            isEmailSent: true,
          },
        ],
        { session }
      );

      // Create a trial subscription for the new user
      const subscription = await Subscription.create(
        [
          {
            userId: user[0]._id,
            isTrial: true,
            trialExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            isSubscriptionActive: true,
          },
        ],
        { session }
      );

      // Create subscription history for future reference
      await SubscriptionHistory.create(
        [
          {
            userId: user[0]._id,
            amount: 0,
            isTrial: true,
            trialExpiresAt: subscription[0].trialExpiresAt,
          },
        ],
        { session }
      );

      // Commit transaction and end session
      await session.commitTransaction();
      session.endSession();

      // Send signup success email (non-blocking)
      sendEmail(
        email,
        "signup-success",
        signupEmailTemplate(user[0].firstName ?? "User")
      );

      // 12b. Set secure cookies for tokens and send response
      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite:
          process.env.NODE_ENV === "production"
            ? ("None" as "none")
            : ("Strict" as "strict"),
      };
      res
        .status(201)
        .cookie("accessToken", accessToken, {
          ...options,
          maxAge: Number(process.env.ACCESS_TOKEN_EXPIRY) * 24 * 60 * 60 * 1000,
        })
        .cookie("refreshToken", refreshToken, {
          ...options,
          maxAge:
            Number(process.env.REFRESH_TOKEN_EXPIRY) * 24 * 60 * 60 * 1000,
        })
        .json(
          new ApiResponse(
            201,
            {
              _id: user[0]._id,
              email: user[0].email,
              role: user[0].role,
              firstName: user[0].firstName || "",
              lastName: user[0].lastName || "",
              avatar: user[0].avatar || "",
            },
            "Google Sign up successful"
          )
        );
    }
  } catch (err) {
    // Rollback transaction on error
    if(session.inTransaction()){
      await session.abortTransaction();
    }
    session.endSession();
    next(err);
  }
};

// Handles user logout by removing refreshtoken from device session, clearing auth cookies, and sending a success response
export const signout = asyncHandler(async (
  req: Request,
  res: Response
) => {
    // Get user ID from request which is set by authentication middleware
    const userId = req.user?._id;

    // Find and revoke device session for the user
    await DeviceSession.findOneAndUpdate(
      {
        userId,
        ipAddress: requestIp.getClientIp(req),
        userAgent: req.header("user-agent"),
      },
      { $unset: { refreshToken: 1 }, $set: { lastActiveAt: new Date() } },
      { new: true }
    );

    // cookies tokens
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? ("None" as "none")
          : ("Strict" as "strict"),
    };

    // Clear auth cookies
    res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, null, "Logout successful"));
}
)