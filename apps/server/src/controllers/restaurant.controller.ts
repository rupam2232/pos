import path from "path";
import fs from "fs";
import cloudinary from "../utils/cloudinary.js";
import { Restaurant } from "../models/restaurant.models.js";
import {
  canAddCategory,
  canCreateRestaurant,
  canToggleOpeningStatus,
} from "../service/restaurant.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { restaurantCreatedTemplate } from "../utils/emailTemplates.js";
import sendEmail from "../utils/sendEmail.js";
import { Order } from "../models/order.model.js";
import { Table } from "../models/table.model.js";
const isProduction = process.env?.NODE_ENV === "production";

export const createRestaurant = asyncHandler(async (req, res) => {
  if (!req.body?.restaurantName || !req.body?.slug) {
    throw new ApiError(400, "Restaurant name and slug are required.");
  }
  const { restaurantName, slug, description, address, logoUrl } = req.body;
  const ownerId = req.user!._id;

  if (req.user!.role !== "owner") {
    throw new ApiError(403, "Only owners can create restaurants.");
  }

  if (slug.length < 3 || slug.length > 20) {
    throw new ApiError(400, "Slug must be between 3 to 20 characters long");
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new ApiError(
      400,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    );
  }

  isProduction && (await canCreateRestaurant(req.user!, req.subscription!));

  // Check if the restaurant already exists
  const existingRestaurant = await Restaurant.findOne({
    $or: [
      { slug },
      {
        restaurantName: { $regex: new RegExp(`^${restaurantName}$`, "i") },
        ownerId: { $ne: ownerId },
      },
    ],
  });

  if (existingRestaurant) {
    throw new ApiError(
      400,
      `Restaurant with slug ${slug} or name ${restaurantName} already exists`
    );
  }

  const restaurant = await Restaurant.create({
    restaurantName,
    slug,
    description,
    address,
    ownerId,
    logoUrl,
  });
  if (!restaurant) {
    throw new ApiError(500, "Failed to create restaurant.");
  }

  req.user!.restaurantIds!.push(restaurant._id as any); // Type assertion to avoid TS error
  // Ensure the restaurantIds array is unique
  req.user!.restaurantIds = Array.from(new Set(req.user!.restaurantIds));
  // Save the user without validation to avoid triggering validation errors
  await req.user!.save({ validateBeforeSave: false });

  sendEmail(
    req.user!.email,
    "restaurant-created",
    restaurantCreatedTemplate(
      req.user!.firstName ?? "User",
      restaurant.restaurantName,
      restaurant.slug,
      restaurant.description ?? "Not defined",
      restaurant.address ?? "Not defined"
    )
  );
  res
    .status(201)
    .json(new ApiResponse(201, restaurant, "Restaurant created successfully"));
});

export const getAllRestaurantofOwner = asyncHandler(async (req, res) => {
  if (req.user!.role !== "owner") {
    throw new ApiError(403, "Only owners can view their restaurants");
  }

  const restaurants = await Restaurant.find({ ownerId: req.user!._id }).select(
    "_id restaurantName slug description address logoUrl isCurrentlyOpen"
  );
  res
    .status(200)
    .json(
      new ApiResponse(200, restaurants, "Restaurants fetched successfully")
    );
});

export const getRestaurantofStaff = asyncHandler(async (req, res) => {
  if (req.user!.role !== "staff") {
    throw new ApiError(403, "Only staff can view their restaurant");
  }
  const restaurant = await Restaurant.findOne({
    staffIds: { $in: [req.user!._id] },
  }).select(
    "_id restaurantName slug description address logoUrl isCurrentlyOpen"
  );
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found for this staff member");
  }
  res
    .status(200)
    .json(new ApiResponse(200, restaurant, "Restaurant fetched successfully"));
});

export const getRestaurantBySlug = asyncHandler(async (req, res) => {
  if (!req.params?.slug) {
    throw new ApiError(400, "Restaurant slug is required.");
  }
  const { slug } = req.params;
  if (!slug) {
    throw new ApiError(400, "Restaurant slug is required.");
  }

  const restaurant = await Restaurant.findOne({ slug }).select(
    "-staffIds -ownerId -__v -updatedAt"
  );
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found.");
  }
  res
    .status(200)
    .json(new ApiResponse(200, restaurant, "Restaurant fetched successfully"));
});

export const updateRestaurantDetails = asyncHandler(async (req, res) => {
  if (!req.params?.slug) {
    throw new ApiError(400, "Restaurant slug is required");
  }
  const { slug } = req.params;
  if (!req.body?.restaurantName || !req.body?.newSlug) {
    throw new ApiError(400, "Restaurant name and new slug are required");
  }
  if (req.user!.role !== "owner") {
    throw new ApiError(403, "Only owners can update restaurant details");
  }

  const {
    restaurantName,
    newSlug,
    description,
    address,
    openingTime,
    closingTime,
  } = req.body;

  if (newSlug.length < 3 || newSlug.length > 20) {
    throw new ApiError(400, "Slug must be between 3 to 20 characters long");
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(newSlug)) {
    throw new ApiError(
      400,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    );
  }

  if (
    (closingTime && closingTime.match(/^\d{2}:\d{2}$/) === null) ||
    (openingTime && openingTime?.match(/^\d{2}:\d{2}$/) === null)
  ) {
    throw new ApiError(
      400,
      "openingTime and closingTime must be in HH:MM format (24-hour clock)"
    );
  }

  if (closingTime || openingTime) {
    if (!openingTime || !closingTime) {
      throw new ApiError(
        400,
        "Both opening and closing times must be provided or neither"
      );
    }
  }

  const restaurant = await Restaurant.findOneAndUpdate(
    { slug, ownerId: req.user!._id },
    {
      $set: {
        restaurantName,
        slug: newSlug,
        description: description ? description : null,
        address: address ? address : null,
        openingTime: openingTime ? openingTime : null,
        closingTime: closingTime ? closingTime : null,
      },
    },
    { new: true, runValidators: true }
  );

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found or you are not the owner");
  }
  res
    .status(200)
    .json(new ApiResponse(200, restaurant, "Restaurant updated successfully"));
});

export const toggleRestaurantOpenStatus = asyncHandler(async (req, res) => {
  if (!req.params?.slug) {
    throw new ApiError(400, "Restaurant slug is required.");
  }
  const { slug } = req.params;
  if (req.user!.role !== "owner") {
    throw new ApiError(403, "Only owners can toggle restaurant status.");
  }

  const restaurant = await Restaurant.findOne({ slug, ownerId: req.user!._id }).select(
    "_id restaurantName slug description address logoUrl isCurrentlyOpen"
  );

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found or you are not the owner.");
  }

  isProduction && (await canToggleOpeningStatus(restaurant));

  restaurant.isCurrentlyOpen = !restaurant.isCurrentlyOpen;
  await restaurant.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        restaurant,
        `Restaurant is now ${restaurant.isCurrentlyOpen ? "open" : "closed"}`
      )
    );
});

export const addRestaurantCategory = asyncHandler(async (req, res) => {
  if (!req.params?.slug) {
    throw new ApiError(400, "Restaurant slug is required");
  }
  const { slug } = req.params;
  if (
    !req.body ||
    !req.body?.category ||
    typeof req.body.category !== "string" ||
    req.body.category.trim() === ""
  ) {
    throw new ApiError(400, "Category is required");
  }
  if (req.user!.role !== "owner") {
    throw new ApiError(403, "Only owners can create restaurant categories");
  }

  const restaurant = await Restaurant.findOne({ slug, ownerId: req.user!._id }).select(
    "_id restaurantName slug description address logoUrl isCurrentlyOpen categories"
  );

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  isProduction && canAddCategory(restaurant, req.subscription!);

  const categories = restaurant.categories || [];
  // Check if the category already exists
  if (categories.includes(req.body.category.trim())) {
    throw new ApiError(400, "Category already exists in the restaurant");
  }

  // Add categories to the restaurant
  restaurant.categories.push(req.body.category);
  await restaurant.save();

  res
    .status(200)
    .json(new ApiResponse(200, restaurant, "Category added successfully"));
});

export const removeRestaurantCategories = asyncHandler(async (req, res) => {
  if (!req.params?.slug) {
    throw new ApiError(400, "Restaurant slug is required.");
  }
  const { slug } = req.params;
  if (!req.body?.categories || !Array.isArray(req.body.categories)) {
    throw new ApiError(400, "Categories must be an array.");
  }
  const { categories } = req.body;
  if (categories.length === 0) {
    throw new ApiError(
      400,
      "At least one category must be provided to remove."
    );
  }
  if (req.user!.role !== "owner") {
    throw new ApiError(403, "Only owners can remove restaurant categories.");
  }
  const restaurant = await Restaurant.findOneAndUpdate(
    { slug, ownerId: req.user!._id },
    { $pull: { categories: { $in: categories } } },
    { new: true, runValidators: true }
  ).select(
    "_id restaurantName slug description address logoUrl isCurrentlyOpen categories"
  );

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found or you are not the owner.");
  }
  res
    .status(200)
    .json(new ApiResponse(200, restaurant, "Categories removed successfully"));
});

export const getRestaurantCategories = asyncHandler(async (req, res) => {
  if (!req.params?.slug) {
    throw new ApiError(400, "Restaurant slug is required.");
  }
  const { slug } = req.params;

  const restaurant = await Restaurant.findOne({ slug });
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found.");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        restaurant.categories,
        "Categories fetched successfully"
      )
    );
});

export const setRestaurantTax = asyncHandler(async (req, res) => {
  if (!req.params?.slug) {
    throw new ApiError(400, "Restaurant slug is required");
  }
  const { slug } = req.params;

  if (req.user!.role !== "owner") {
    throw new ApiError(403, "Only owners can set restaurant tax");
  }

  if (typeof req.body?.isTaxIncludedInPrice !== "boolean") {
    throw new ApiError(400, "define whether tax is included in price");
  }

  const { isTaxIncludedInPrice, taxLabel, taxRate } = req.body;

  if ((taxRate && typeof taxRate !== "number") || taxRate < 0) {
    throw new ApiError(400, "Tax rate must be a non-negative number");
  }

  if (taxRate && (!taxLabel || typeof taxLabel !== "string")) {
    throw new ApiError(400, "Tax label is required and must be a string");
  }

  if (
    isTaxIncludedInPrice &&
    ((taxLabel && taxLabel.trim() !== "") || (taxRate && taxRate !== 0))
  ) {
    throw new ApiError(
      400,
      "If tax is included in price, tax label and rate should not be provided"
    );
  }

  const restaurant = await Restaurant.findOneAndUpdate(
    { slug, ownerId: req.user!._id },
    {
      $set: {
        taxRate: isTaxIncludedInPrice ? 0 : taxRate,
        taxLabel: taxLabel ? taxLabel : null,
        isTaxIncludedInPrice: isTaxIncludedInPrice,
      },
    },
    { new: true, runValidators: true }
  ).select(
    "_id restaurantName slug description address logoUrl isCurrentlyOpen categories"
  );
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found or you are not the owner");
  }

  res
    .status(200)
    .json(new ApiResponse(200, restaurant, "Tax set successfully"));
});

export const checkUniqueRestaurantSlug = asyncHandler(async (req, res) => {
  if (!req.params?.slug) {
    throw new ApiError(400, "Restaurant slug is required");
  }
  const { slug } = req.params;

  if (slug.length < 3 || slug.length > 20) {
    throw new ApiError(400, "Slug must be between 3 to 20 characters long");
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new ApiError(
      400,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    );
  }

  const restaurant = await Restaurant.findOne({ slug });
  if (restaurant) {
    res
      .status(200)
      .json(new ApiResponse(200, false, `${slug} slug is already taken`));
  } else {
    res
      .status(200)
      .json(new ApiResponse(200, true, `${slug} slug is unique and available`));
  }
});

export const updateRestaurantLogo = asyncHandler(async (req, res) => {
  const logoLocalPath = req.file?.path;

  if (!req.params?.slug) {
    if (logoLocalPath) fs.unlinkSync(logoLocalPath); // Remove the file if slug is not provided
    throw new ApiError(400, "Restaurant slug is required");
  }

  const { slug } = req.params;

  if (req.user!.role !== "owner") {
    if (logoLocalPath) fs.unlinkSync(logoLocalPath); // Remove the file if the user is not an owner
    throw new ApiError(403, "Only owners can upload restaurant logos");
  }

  // Check file type
  if (logoLocalPath) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(req.file!.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(req.file!.mimetype);

    if (!mimetype || !extname) {
      fs.unlinkSync(logoLocalPath); // Remove the file if it's not valid
      throw new ApiError(400, "Only JPEG, JPG, and PNG files are allowed");
    }
  }

  // Check if the restaurant exists and the user is the owner
  const restaurant = await Restaurant.findOne({ slug, ownerId: req.user!._id }).select(
    "_id restaurantName slug description address logoUrl isCurrentlyOpen categories"
  );
  if (!restaurant) {
    if (logoLocalPath) fs.unlinkSync(logoLocalPath); // Remove the file if restaurant is not found
    throw new ApiError(404, "Restaurant not found or you are not the owner");
  }
  let uploadResponse = null;
  // If a logoLocalPath exists, upload the logo to Cloudinary
  if (logoLocalPath) {
    uploadResponse = await cloudinary.upload(
      logoLocalPath,
      `restaurant-logos/restaurants-${req.user!._id}` // Use the owner's ID to create a unique folder
    );
    if (!uploadResponse || !uploadResponse.secure_url) {
      fs.unlinkSync(logoLocalPath); // Remove the file if upload fails
      throw new ApiError(500, "Failed to upload logo to Cloudinary");
    }
  }
  if (restaurant.logoUrl) {
    // Delete the old logo from Cloudinary if it exists
    await cloudinary.delete(restaurant.logoUrl);
  }
  restaurant.logoUrl = uploadResponse?.secure_url ?? undefined; // Update the logoUrl with the new one
  await restaurant.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, restaurant, "Restaurant logo updated successfully")
    );
});

export const getStaffDashboardStats = asyncHandler(async (req, res) => {
  if (!req.params || !req.params.slug) {
    throw new ApiError(400, "Restaurant slug is required");
  }
  const { slug } = req.params;

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const yesterdayStart = new Date();
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  yesterdayStart.setHours(0, 0, 0, 0);
  const yesterdayEnd = new Date();
  yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
  yesterdayEnd.setHours(23, 59, 59, 999);

  const restaurant = await Restaurant.findOne({ slug });

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  if (req.user!.role === "owner") {
    if (restaurant.ownerId.toString() !== req.user!.id) {
      throw new ApiError(403, "You can't access this data");
    }
  } else if (req.user!.role === "staff") {
    if (!restaurant.staffIds || restaurant.staffIds.length === 0) {
      throw new ApiError(403, "You can't access this data");
    } else if (
      !restaurant.staffIds.map((id) => id.toString()).includes(req.user!.id)
    ) {
      throw new ApiError(403, "You can't access this data");
    }
  }

  const [
    newOrders,
    inProgressOrders,
    tableStats,
    todayTotalOrders,
    yesterdayTotalOrdersAgg,
    unPaidCompletedOrders,
    readyOrders
  ] = await Promise.all([
    Order.countDocuments({
      restaurantId: restaurant._id,
      status: "pending",
      createdAt: { $gte: start, $lte: end },
    }),
    Order.aggregate([
      {
        $match: {
          restaurantId: restaurant._id,
          status: "preparing",
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]),
    Table.aggregate([
      {
        $match: {
          restaurantId: restaurant._id,
        },
      },
      {
        $group: {
          _id: null,
          occupiedTableCount: {
            $sum: { $cond: [{ $eq: ["$isOccupied", true] }, 1, 0] },
          },
          freeTableCount: {
            $sum: { $cond: [{ $eq: ["$isOccupied", false] }, 1, 0] },
          },
        },
      },
    ]),
    Order.aggregate([
      {
        $match: {
          restaurantId: restaurant._id,
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]),
    Order.aggregate([
      {
        $match: {
          restaurantId: restaurant._id,
          createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]),
    Order.aggregate([
      {
        $match: {
          restaurantId: restaurant._id,
          status: "completed",
          isPaid: false,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]),
    Order.aggregate([
      {
        $match: {
          restaurantId: restaurant._id,
          status: "ready",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]),
  ]);

  const todayTotal = todayTotalOrders[0]?.total || 0;
  const yesterdayTotal = yesterdayTotalOrdersAgg[0]?.total || 0;

  let totalOrderChangePercent = null;
  if (yesterdayTotal === 0 && todayTotal > 0) {
    totalOrderChangePercent = 100;
  } else if (yesterdayTotal === 0 && todayTotal === 0) {
    totalOrderChangePercent = 0;
  } else {
    totalOrderChangePercent = ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100;
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        newOrders,
        inProgressOrders: inProgressOrders[0]?.total || 0,
        occupiedTables: tableStats[0]?.occupiedTableCount || 0,
        freeTables: tableStats[0]?.freeTableCount || 0,
        todayTotalOrders: todayTotal,
        totalOrderChangePercent,
        unPaidCompletedOrders: unPaidCompletedOrders[0]?.total || 0,
        readyOrders: readyOrders[0]?.total || 0
      },
      "Dashboard stats retrieved successfully"
    )
  );
});
