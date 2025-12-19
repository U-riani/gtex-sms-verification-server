import SmsTemplate from "../models/SmsTemplate.js";

export const getTemplates = async (req, res) => {
  const { brand } = req.query;

  const filter = brand ? { brand } : {};
  const templates = await SmsTemplate.find(filter).sort({ createdAt: -1 });

  res.json({ success: true, templates });
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

export const deleteTemplate = async (req, res) => {
  await SmsTemplate.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};
