// server/routes/adminSmsTemplateRoutes.js

import SmsTemplate from "../models/SmsTemplate.js";

export const getTemplates = async (req, res) => {
  const { brand } = req.query;

  const filter = brand ? { brand } : {};
  const templates = await SmsTemplate.find(filter).sort({ createdAt: -1 });

  res.json({ success: true, templates });
};

export const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await SmsTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    res.json({ success: true, template });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch template" });
  }
};

export const createTemplate = async (req, res) => {
  const { name, brand, content } = req.body;

  if (!name || !brand || !content) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const template = await SmsTemplate.create({
    name,
    brand,
    content,
    createdBy: req.admin.id,
  });

  res.json({ success: true, template });
};

export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brand, content } = req.body;

    if (!name || !brand || !content) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const template = await SmsTemplate.findByIdAndUpdate(
      id,
      { name, brand, content },
      { new: true }
    );

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    res.json({ success: true, template });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update template" });
  }
};

export const deleteTemplate = async (req, res) => {
  await SmsTemplate.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

