const Subscription = require('../models/Subscription');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.user.id });

    // Calculate basic stats
    const activeSubscriptions = subscriptions.filter(s => s.status === 'Active');
    const pausedSubscriptions = subscriptions.filter(s => s.status === 'Paused');
    
    // Total monthly spend (only active)
    const totalMonthlySpend = activeSubscriptions.reduce((acc, sub) => acc + sub.price, 0);
    const totalYearlySpend = totalMonthlySpend * 12;

    // Upcoming renewals (within next 7 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const upcomingRenewals = activeSubscriptions.filter(sub => {
      const renewalDate = new Date(sub.renewalDate);
      renewalDate.setHours(0, 0, 0, 0);
      return renewalDate >= today && renewalDate <= nextWeek;
    });

    // Category breakdown
    const categoryBreakdown = activeSubscriptions.reduce((acc, sub) => {
      acc[sub.category] = (acc[sub.category] || 0) + sub.price;
      return acc;
    }, {});

    const categoryArray = Object.keys(categoryBreakdown).map(category => ({
      category,
      total: categoryBreakdown[category]
    })).sort((a, b) => b.total - a.total); // Sort highest first

    res.status(200).json({
      success: true,
      data: {
        totalSubscriptions: subscriptions.length,
        activeCount: activeSubscriptions.length,
        pausedCount: pausedSubscriptions.length,
        totalMonthlySpend,
        totalYearlySpend,
        upcomingRenewalsCount: upcomingRenewals.length,
        categoryBreakdown: categoryArray
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
