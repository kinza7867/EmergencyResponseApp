const EmergencyContact = require("../models/EmergencyContact");

// ===============================
// Add Emergency Contact
// POST /api/contacts
// ===============================
const createEmergencyContact = async (req, res) => {
  try {
    const { name, relationship, phone } = req.body;

    const contact = await EmergencyContact.create({
      user: req.user._id,
      name,
      relationship,
      phone,
    });

    return res.status(201).json({
      success: true,
      message: "Emergency contact added successfully.",
      data: contact,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// Get Logged-in User Contacts
// GET /api/contacts
// ===============================
const getEmergencyContacts = async (req, res) => {
  try {
    const contacts = await EmergencyContact.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
const updateEmergencyContact = async (req, res) => {
  try {
    const { name, relationship, phone } = req.body;

    const contact = await EmergencyContact.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Emergency contact not found.",
      });
    }

    contact.name = name;
    contact.relationship = relationship;
    contact.phone = phone;

    await contact.save();

    return res.status(200).json({
      success: true,
      message: "Emergency contact updated successfully.",
      data: contact,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
// ===============================
// Delete Emergency Contact
// DELETE /api/contacts/:id
// ===============================
const deleteEmergencyContact = async (req, res) => {
  try {
    const contact = await EmergencyContact.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Emergency contact not found.",
      });
    }

    await contact.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Emergency contact deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  createEmergencyContact,
  getEmergencyContacts,
  updateEmergencyContact,
  deleteEmergencyContact,
};