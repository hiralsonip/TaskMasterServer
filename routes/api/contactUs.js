const express = require("express");
const router = express.Router();
const ContactUs = require("../../models/ContactUs");

// Configure body parsing middleware
router.use(express.json());

router.get('/get', (req, res) => {
  res.send('Yatri Patel');
});

// GET all contact entries
router.get('/getAllContact', (req, res) => {
  ContactUs.find({})
    .then(contactUs => res.status(200).json(contactUs))
    .catch(err => res.status(500).json({ error: 'Failed to fetch contactUs entries' }));
});

// GET a specific contact entry by ID
router.get('/contact/:id', (req, res) => {
  const id = req.params.id;
  ContactUs.findById(id)
    .then(contactUs => {
      if (contactUs) {
        res.status(200).json(contactUs);
      } else {
        res.status(404).json({ message: 'ContactUs entry not found' });
      }
    })
    .catch(err => res.status(500).json({ error: 'Failed to fetch contactUs entry' }));
});

// POST a new contact entry
router.post('/addContact', (req, res) => {
  const newContactUs = new ContactUs(req.body);
  newContactUs.save()
    .then(contactUs => res.status(200).json({ status: 200, message: 'Contact Added Successfully', data: contactUs }))
    .catch(err => res.status(500).json({ error: 'Failed to save contactUs entry' }));
});

// PUT (update) an existing contact entry
router.put('/updateContact/:id', (req, res) => {
  const id = req.params.id;
  ContactUs.findByIdAndUpdate(id, req.body, { new: true })
    .then(updatedContactUs => {
      if (updatedContactUs) {
        res.status(200).json({ status: 200, message: 'Contact Updated Successfully', data: updatedContactUs });
      } else {
        res.status(404).json({ message: 'ContactUs entry not found' });
      }
    })
    .catch(err => res.status(500).json({ error: 'Failed to update contactUs entry' }));
});

// DELETE a contactUs entry
router.delete('/DeleteContact/:id', (req, res) => {
  const id = req.params.id;
  ContactUs.findByIdAndRemove(id)
    .then(removedContactUs => {
      if (removedContactUs) {
        res.status(200).json({ message: 'Contact deleted successfully' });
      } else {
        res.status(404).json({ message: 'Contact entry not found' });
      }
    })
    .catch(err => res.status(500).json({ error: 'Failed to delete contact entry' }));
});

module.exports = router;
