const Contact = require('../model/contactSchema')

exports.createContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    const newContact = await Contact.create({
      name,
      email,
      phone,
      message
    });

    res.status(201).json({
      success: true,
      data: newContact,
      message: 'Thank you for contacting A4Celebration! We will get back to you soon.'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form',
      error: err.message
    });
  }
};

// Admin-only endpoints (simplified)
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts',
      error: err.message
    });
  }
};