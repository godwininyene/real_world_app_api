const express = require('express');
const copytradeController = require('./../controllers/copytradeController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/')
    .post(
        authController.protect,
        authController.restrictTo('admin'),
        copytradeController.uploadImage,
        copytradeController.resizeImage,
        copytradeController.createCopyTrade
    )
    .get(copytradeController.getAllCopytrades)

router.route('/:id')
    .patch(
        authController.protect,
        authController.restrictTo('admin'),
        copytradeController.uploadImage,
        copytradeController.resizeImage,
        copytradeController.updateCopytrade
    )
.delete( authController.protect, authController.restrictTo('admin'), copytradeController.deleteCopytrade)


module.exports = router;