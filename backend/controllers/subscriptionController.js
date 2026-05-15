const Subscription = require('../models/Subscription');

// @desc    Get all subscriptions for logged in user
// @route   GET /api/subscriptions
// @access  Private
const getSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, count: subscriptions.length, data: subscriptions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single subscription
// @route   GET /api/subscriptions/:id
// @access  Private
const getSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    // Make sure user owns subscription
    if (subscription.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this subscription' });
    }

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new subscription
// @route   POST /api/subscriptions
// @access  Private
const addSubscription = async (req, res, next) => {
  try {
    req.body.userId = req.user.id;

    const subscription = await Subscription.create(req.body);

    res.status(201).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subscription
// @route   PUT /api/subscriptions/:id
// @access  Private
const updateSubscription = async (req, res, next) => {
  try {
    let subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    // Make sure user owns subscription
    if (subscription.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this subscription' });
    }

    subscription = await Subscription.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subscription
// @route   DELETE /api/subscriptions/:id
// @access  Private
const deleteSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    // Make sure user owns subscription
    if (subscription.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this subscription' });
    }

    await subscription.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubscriptions,
  getSubscription,
  addSubscription,
  updateSubscription,
  deleteSubscription
};
