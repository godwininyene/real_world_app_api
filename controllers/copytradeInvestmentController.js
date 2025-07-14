const AppError = require('../utils/apError');
const catchAsync = require("../utils/catchAsync");
const Email = require("../utils/email");
const { CopyTradeInvestment, CopyTrade, User, Wallet, sequelize } = require("../models");

// User invests in a copy trade
exports.investInCopyTrade = catchAsync(async (req, res, next) => {
    const { copyTradeId, amount, stopLoss } = req.body;
    const userId = req.user.id;

    // 1) Validate copy trade
    const copyTrade = await CopyTrade.findByPk(copyTradeId);
    if (!copyTrade) {
        return next(new AppError("Copy trade not found", { 
            copyTrade: "No copy trade was found with that ID" 
        }, 404));
    }

    // 2) Validate min deposit (using copyTrade.minDeposit)
    if (amount < copyTrade.minDeposit) {
        return next(new AppError("Amount too small", {
            amount: `Minimum deposit for this trade is $${copyTrade.minDeposit}`
        }, 400));
    }

    // 3) Check wallet balance
    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet || wallet.copytradeBalance < amount) {
        return next(new AppError("Insufficient funds", {
            balance: "Fund your wallet to invest"
        }, 400));
    }

    // 4) Create investment
    const investment = await CopyTradeInvestment.create({
        userId,
        copyTradeId,
        amount,
        stopLoss,
        status: "active"
    });

    // 5) Deduct from wallet
    wallet.copytradeBalance -= amount;
    await wallet.save();

    // 6) Send email using to client
    try {
        await new Email(
            req.user, 
            '', 
            '', 
            amount, 
            { 
                // Mock plan-like structure for email template
                name: copyTrade.tradeName,
                planDuration: "1 month", // Static for copy trades
                timingParameter: "monthly" 
            }
        ).sendInvestment();

        res.status(201).json({
            status: 'success',
            data: { investment }
        });

    } catch (error) {
        console.log("Email failed:", error);
        // Still return success but log email failure
        res.status(201).json({
            status: 'success',
            message: 'Investment created but email not sent',
            data: { investment }
        });
    }
});

// Get all investments
exports.getAllCopyTradeInvestments = catchAsync(async (req, res, next) => {
    // 1) Define base query conditions
    const whereClause = req.user.role !== 'admin' ? { userId: req.user.id } : {};
    
    // 2) Fetch investments with conditional includes
    const investments = await CopyTradeInvestment.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']], 
        include: req.user.role === 'admin' 
            ? [
                {
                    model: User,
                    as: 'user',
                    attributes: ['firstName', 'lastName', 'photo']
                },
                {
                    model: CopyTrade,
                    as: 'copyTrade',
                    attributes: ['id', 'tradeName', 'tradeUsername', 'monthlyReturn', 'image']
                }
            ] 
            : [
                {
                    model: CopyTrade,
                    as: 'copyTrade',
                    attributes: ['id', 'tradeName', 'tradeUsername', 'monthlyReturn', 'image']
                }
            ],
        order: [['createdAt', 'DESC']]
    });

    // 3) Send response
    res.status(200).json({
        status: "success",
        results: investments.length,
        data: { investments }
    });
});

// Admin: Get all investments for a specific copy trade
exports.getCopyTradeInvestments = catchAsync(async (req, res, next) => {
  const investments = await CopyTradeInvestment.findAll({
    where: { copyTradeId: req.params.copyTradeId },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email"],
      },
    ],
  });

  res.status(200).json({
    status: "success",
    data: { investments },
  });
});

// Stop a copy trade investment
exports.stopCopyTradeInvestment = catchAsync(async (req, res, next) => {
    const { tradeId } = req.params;

    // 1) Find the investment
    const investment = await CopyTradeInvestment.findOne({
        where: { id: tradeId },
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id']
            },
            {
                model: CopyTrade,
                as: 'copyTrade',
                attributes: ['id']
            }
        ]
    });

    if (!investment) {
        return next(new AppError('Trade not found','', 404));
    }

    // 2) Check if investment is already completed
    if (investment.status === 'completed') {
        return next(new AppError('This trade is already completed', '',400));
    }

    // 3) Find the user's wallet
    const wallet = await Wallet.findOne({ 
        where: { userId: investment.user.id } 
    });

    if (!wallet) {
        return next(new AppError('User wallet not found','', 404));
    }

    // 4) Start transaction to ensure data consistency
    const transaction = await sequelize.transaction();

    try {
        // 5) Update investment status to completed
        investment.status = 'completed';
        await investment.save({ transaction });

        // 6) Credit user's wallet
        wallet.copytradeBalance += investment.amount;
        await wallet.save({ transaction });

        // 7) Commit transaction if all operations succeed
        await transaction.commit();

        // 8) Send success response
        res.status(200).json({
            status: 'success',
            message: 'Trade stopped successfully',
            data: { investment }
        });

    } catch (error) {
        // Rollback transaction if any error occurs
        console.log(error)
        await transaction.rollback();
        return next(new AppError('Error stopping trade', 500));
    }
});