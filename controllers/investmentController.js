const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/apError");
const Email = require("../utils/email");
const { Wallet, User, Investment, Plan } = require('./../models');


exports.makeInvestment = catchAsync(async (req, res, next) => {
    // Assign the user ID if not provided
    if (!req.body.userId) req.body.userId = req.user.id;

    const { userId, planId, amount } = req.body;

    const plan = await Plan.findByPk(planId);
    if (!plan) {
        return next(new AppError("Missing Plan", { plan: "No plan was found with that ID" }, 404));
    }

    // Validate deposit limits
    if (amount < plan.minDeposit) {
        return next(new AppError("Amount too small", {
            amount: `You cannot invest less than the minimum deposit of $${plan.minDeposit} on this plan`
        }, 400));
    }

    if (amount > plan.maxDeposit) {
        return next(new AppError("Amount too large", {
            amount: `You cannot invest more than the maximum deposit of $${plan.maxDeposit} on this plan`
        }, 400));
    }

    // Get user wallet
    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet || wallet.balance < amount) {
        return next(new AppError("Insufficient fund", {
            balance: `Insufficient wallet balance. Kindly fund your wallet and try again.`
        }, 400));
    }

    // Calculate expiry date
    let expiryDate;
    if (plan.timingParameter === 'hours') {
        expiryDate = new Date(Date.now() + plan.planDuration * 60 * 60 * 1000);
    } else if (plan.timingParameter === 'days') {
        expiryDate = new Date(Date.now() + plan.planDuration * 24 * 60 * 60 * 1000);
    }

    // Create investment
    const investment = await Investment.create({
        userId,
        planId,
        amount,
        expiryDate
    });

    // Subtract invested amount from wallet
    wallet.balance -= amount;
    await wallet.save();

    // Handle referral bonus
    if (req.user.referralId) {
        const referral = await User.findOne({ where: { accountId: req.user.referralId } });
        if (referral) {
            const referralBonus = (plan.percentage / 100) * amount;
            const referralWallet = await Wallet.findOne({ where: { userId: referral.id } });
            if (referralWallet) {
                referralWallet.referralBalance += referralBonus;
                await referralWallet.save();
            }
        }
    }

    // Send investment email
    try {
        await new Email(req.user, '', '', amount, plan).sendInvestment();
        res.status(201).json({
            status: 'success',
            data: {
                investment
            }
        });
    } catch (error) {
        console.log(error);
        return next(new AppError("There was a problem sending the email. Please try again later!", '', 500));
    }
});


exports.getAllInvestments = catchAsync(async (req, res, next) => {
    const whereClause = req.user.role !== 'admin' ? { userId: req.user.id } : {};

    const investments = await Investment.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']], 
        include: req.user.role === 'admin' ? [{
            model: User,
            as:'user',
            attributes: ['firstName', 'lastName', 'photo']
            },
            {
            model: Plan,
            as:'plan',
            attributes: ['id', 'name']
            },
        ] : [ {
            model: Plan,
            as:'plan',
            attributes: ['id', 'name', 'percentage']
            },
        ]
    });

    res.status(200).json({
        result: investments.length,
        status: "success",
        data: {
            investments
        }
    });
});

exports.handleInvestments = catchAsync(async (req, res, next) => {
    const investments = await Investment.findAll({
        where: { userId: req.user.id, status: 'active' },
        include: [{ model: Plan, as: 'plan' }]
    });
    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });

    let totalProfit = 0;
    let totalBalance = 0;

    for (const investment of investments) {
        const plan = investment.plan;

        const today = new Date();
        const lastUp = new Date(investment.updatedAt);
        const hours = (today.getTime() - lastUp.getTime()) / 3600000;

        const from = new Date(investment.createdAt).getTime();
        const to = new Date(investment.expiryDate).getTime();
        const totalDuration = (to - from) / 3600000;

        const expiryDate = to;
        const now = today.getTime();

        if (expiryDate <= now) {
            // Mining ended
            const profit = (plan.percentage / 100) * investment.amount;
            totalProfit += profit;
            totalBalance += investment.amount;

            investment.profit = profit;
            investment.status = 'completed';
            await investment.save(); // Save individual investment
        } else {
            // Mining still active
            const hourlyInterest = (((plan.percentage / 100) * investment.amount) / totalDuration) * hours;
            investment.profit += hourlyInterest;
            investment.updatedAt = new Date();
            await investment.save(); // Save individual investment
        }
    }

    wallet.profit += totalProfit;
    wallet.balance += totalBalance;
    await wallet.save();

    res.status(200).json({
        status: "success",
        results: investments.length,
        data: {
            investments
        }
    });
});



