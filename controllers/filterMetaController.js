// controllers/filterMetaController.js

import User from "../models/User.js";
import { USER_FILTER_FIELDS } from "../filters/userFilterConfig.js";

export const getDistinctValues = async (req, res) => {
  try {
    const { field } = req.query;

    const config = USER_FILTER_FIELDS[field];
    if (!config) {
      return res.status(400).json({ error: "Invalid field" });
    }

    const values = await User.distinct(config.path);

    res.json(
      values
        .filter(v => v != null)
        .sort()
    );
  } catch (err) {
    console.error("Distinct values error:", err);
    res.status(500).json({ error: "Failed to fetch values" });
  }
};
