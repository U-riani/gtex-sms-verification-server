import User from "../models/User.js";

export const registerUser = async (req, res) => {
  try {
    const smsEnabled =
      req.body.promotionChanel1 === true ||
      req.body.promotionChanel1 === "true";

    const emailEnabled =
      req.body.promotionChanel2 === true ||
      req.body.promotionChanel2 === "true";

    const now = new Date();
    const data = {
      branch: req.body.branch,
      brands: req.body.brands || [],
      gender: req.body.gender,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      dateOfBirth: req.body.dateOfBirth,
      city: req.body.city || "",
      country: req.body.country || "",
      email: req.body.email || "",
      phone: req.body.phoneNumber,
      termsAccepted: req.body.termsAccepted,
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
    };
    console.log(req.body.branch);
    const user = new User(data);
    await user.save();

    return res.json({ success: true, user });
  } catch (err) {
    console.log(err);
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
      "phone",
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
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
      filter.phone = { $regex: req.query.phone, $options: "i" };
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

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v");

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      page,
      totalUsers: total,
      totalPages: Math.ceil(total / limit),
      users,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
