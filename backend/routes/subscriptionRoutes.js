const express = require('express');
const {
  getSubscriptions,
  getSubscription,
  addSubscription,
  updateSubscription,
  deleteSubscription
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router.route('/')
  .get(getSubscriptions)
  .post(addSubscription);

router.route('/:id')
  .get(getSubscription)
  .put(updateSubscription)
  .delete(deleteSubscription);

module.exports = router;
