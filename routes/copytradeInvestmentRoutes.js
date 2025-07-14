const express = require('express');
const copytradeInvestmentController = require('./../controllers/copytradeInvestmentController');
const authController = require('./../controllers/authController');

const router = express.Router({mergeParams:true});
// Protect all the routes below
router.use(authController.protect);
router.route('/')
.post(authController.restrictTo('user'), copytradeInvestmentController.investInCopyTrade)
.get(copytradeInvestmentController.getAllCopyTradeInvestments);
router.patch(
  '/:tradeId/stop',
  authController.restrictTo('admin'),
  copytradeInvestmentController.stopCopyTradeInvestment
);

module.exports = router;