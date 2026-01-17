//controllers/userController.js

import User from "../models/User.js";
const ALLOWED_LIMITS = [20, 50, 100, 1000, 5000, 10000];

export const registerUser = async (req, res) => {
  try {
    const smsEnabled =
      req.body.promotionChannelSms === true ||
      req.body.promotionChannelSms === "true";

    const emailEnabled =
      req.body.promotionChannelEmail === true ||
      req.body.promotionChannelEmail === "true";

    if (!req.body.termsAccepted) {
      return res.status(400).json({
        success: false,
        error: "Terms must be accepted",
      });
    }

    if (!req.body.termsText || !req.body.termsLanguage) {
      return res.status(400).json({
        success: false,
        error: "Invalid terms payload",
      });
    }

    const prefix = req.body.prefix; // "+995"
    const number = req.body.phoneNumber; // "555123456"
    const full = (prefix + number).replace(/\D/g, "");

    const now = new Date();

    const branch =
      typeof req.body.branch === "string" && req.body.branch.trim()
        ? req.body.branch.trim()
        : "Web";

    const data = {
      branch,
      brands: req.body.brands || [],
      gender: req.body.gender,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      dateOfBirth: req.body.dateOfBirth,
      city: req.body.city || "",
      country: req.body.country || "",
      email: req.body.email || "",
      phone: {
        prefix,
        number,
        full,
      },
      promoChannels: {
        sms: {
          enabled: smsEnabled,
          createdAt: smsEnabled ? now : null,
          updatedAt: smsEnabled ? now : null,
        },
        email: {
          enabled: emailEnabled,
          createdAt: emailEnabled ? now : null,
          updatedAt: emailEnabled ? now : null,
        },
      },
      terms: {
        accepted: req.body.termsAccepted,
        text: req.body.termsText,
        language: req.body.termsLanguage,
        acceptedAt: new Date(),
      },
    };
    console.log(req.body.branch);
    const user = new User(data);
    await user.save();

    return res.json({ success: true, user });
  } catch (err) {
    console.log(err);
    if (err.code === 11000 && err.keyPattern?.["phone.full"]) {
      return res.status(409).json({
        success: false,
        error: "Phone number already registered",
      });
    }

    res.status(500).json({ error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date();

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update simple fields
    const editableFields = [
      "branch",
      "brands",
      "gender",
      "firstName",
      "lastName",
      "dateOfBirth",
      "country",
      "city",
      "email",
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    if (req.body.phone) {
      const { prefix, number } = req.body.phone;

      if (prefix && number) {
        const full = (prefix + number).replace(/\D/g, "");

        user.phone.prefix = prefix;
        user.phone.number = number;
        user.phone.full = full;
      }
    }
    // -----------------------
    //   UPDATE PROMO CHANNELS
    // -----------------------

    if (req.body.promoChannels) {
      // SMS
      if (req.body.promoChannels.sms?.enabled !== undefined) {
        const newVal = req.body.promoChannels.sms.enabled;
        const sms = user.promoChannels.sms;

        if (sms.enabled !== newVal) {
          sms.updatedAt = now;
          if (newVal && !sms.createdAt) sms.createdAt = now;
        }

        sms.enabled = newVal;
      }

      // EMAIL
      if (req.body.promoChannels.email?.enabled !== undefined) {
        const newVal = req.body.promoChannels.email.enabled;
        const email = user.promoChannels.email;

        if (email.enabled !== newVal) {
          email.updatedAt = now;
          if (newVal && !email.createdAt) email.createdAt = now;
        }

        email.enabled = newVal;
      }
    }

    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Update failed", message: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-__v");

    return res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-__v");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Failed to fetch user",
      message: err.message,
    });
  }
};

export const getPaginatedUsers = async (req, res) => {
  try {
    const rawPage = Number(req.query.page);
    const rawLimit = Number(req.query.limit);

    const page = rawPage > 0 ? rawPage : 1;
    const limit = ALLOWED_LIMITS.includes(rawLimit) ? rawLimit : 20;
    const skip = (page - 1) * limit;

    const filter = {};

    // TEXT FIELDS (case-insensitive, partial)
    if (req.query.firstName) {
      filter.firstName = { $regex: req.query.firstName, $options: "i" };
    }

    if (req.query.lastName) {
      filter.lastName = { $regex: req.query.lastName, $options: "i" };
    }

    if (req.query.phone) {
      filter["phone.full"] = { $regex: req.query.phone };
    }

    if (req.query.email) {
      filter.email = { $regex: req.query.email, $options: "i" };
    }

    if (req.query.city) {
      filter.city = { $regex: req.query.city, $options: "i" };
    }

    // PROMO CHANNELS
    if (req.query.sms === "true") {
      filter["promoChannels.sms.enabled"] = true;
    }
    if (req.query.sms === "false") {
      filter["promoChannels.sms.enabled"] = false;
    }

    if (req.query.emailPromo === "true") {
      filter["promoChannels.email.enabled"] = true;
    }
    if (req.query.emailPromo === "false") {
      filter["promoChannels.email.enabled"] = false;
    }

    // BRAND
    if (req.query.brand) {
      filter.brands = req.query.brand;
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-__v"),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      page,
      limit,
      totalUsers: total,
      totalPages: Math.ceil(total / limit),
      users,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
