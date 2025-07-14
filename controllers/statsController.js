const { Wallet, User, Transaction, Investment, Plan,CopyTradeInvestment } = require('./../models');
const catchAsync = require("../utils/catchAsync");
const { Op } = require("sequelize");

// GetInvestmentStats to Sequelize
const getInvestmentStats = async (user_id) => {
    // Get active investments for user with associated plan, sorted by amount
    const minings = await Investment.findAll({
        where: {
            userId: user_id,
            status: 'active'
        },
        include: [{ model: Plan, as: 'plan' }],
        order: [['amount', 'DESC']]
    });

    // Count all investments
    const total_investment = await Investment.count({ where: { userId: user_id } });

    // Sum profits and amounts
    const all_investments = await Investment.findAll({ where: { userId: user_id } });

    let total_profit = 0;
    let total_amount = 0;

    all_investments.forEach(el => {
        total_profit += el.profit;
        total_amount += el.amount;
    });

    const investments = [];

    for (const investment of minings) {
        let totalDuration = 0;
        let currentLevel = 0;

        if (investment) {
            const expiryDate = new Date(investment.expiryDate);
            const createdAt = new Date(investment.createdAt);
            const now = new Date();

            totalDuration = Math.floor(Math.abs(expiryDate - createdAt) / (1000 * 60 * 60));
            currentLevel = Math.floor(Math.abs(now - createdAt) / (1000 * 60 * 60));
        }

        const percentage = (totalDuration !== 0 || currentLevel !== 0)
            ? Math.floor((currentLevel / totalDuration) * 100)
            : 0;

        investments.push({
            investment,
            totalDuration,
            currentLevel,
            percentage
        });
    }

    return { investments, total_investment, total_profit, total_amount };
};

const getUserCopytradeInvestmentStats = async userId =>{
    // Count all investments
    const total_copytrade_investment = await CopyTradeInvestment.count({ where: { userId} });
    // Sum  amounts
    const all_investments = await CopyTradeInvestment.findAll({ where: { userId} });

    let total_copytrade_amount = 0;

    all_investments.forEach(el => {
       total_copytrade_amount += el.amount;
    });

    return{total_copytrade_investment,total_copytrade_amount}
}


// GetTotalTransactions to Sequelize
const getTotalTransactions = async (user_id) => {
    const where = user_id ? { userId: user_id } : {};

    const transactions = await Transaction.findAll({ where });

    let total_deposit = 0;
    let total_copytrade_deposit=0;
    let total_withdrawal = 0;

    transactions.forEach(tran => {
        if (tran.type === 'investment deposit') total_deposit += tran.amount;
        if (tran.type === 'copytrade deposit') total_copytrade_deposit += tran.amount;
        if (tran.type === 'withdrawal') total_withdrawal += tran.amount;
    });

    return { total_deposit,total_copytrade_deposit, total_withdrawal };
};


// Convert getStatsForAdmin to Sequelize
exports.getStatsForAdmin = catchAsync(async (req, res, next) => {
    const wallets = await Wallet.findAll();
    const users = await User.count({ where: { role: { [Op.ne]: 'admin' } } });

    const transactions = await Transaction.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5,
        include: [{ model: User, as:'user', attributes: ['id', 'firstName', 'lastName', 'email', 'photo'] }]
    });

    const investments = await Investment.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5,
        include: [
            { model: User, as:'user', attributes: ['id', 'firstName', 'lastName', 'email', 'photo'] },
            {model: Plan, as: 'plan', attribute:['id', 'name']}

        ]
    });

    const { total_withdrawal } = await getTotalTransactions();

    const total_referrals = await User.count({
        where: { referralId: { [Op.ne]: null } }
    });

    let total_balance = 0;
    let total_profit = 0;
    let total_referral_balance = 0;
    let total_copytrade_profit = 0;

    wallets.forEach(wallet => {
        total_balance += wallet.balance;
        total_profit += wallet.profit;
        total_copytrade_profit+=wallet.copytradeProfit
        total_referral_balance += wallet.referralBalance;
    });

    // Count all investments
    const active_copytrade_investments = await CopyTradeInvestment.count();
    // Sum  amounts
    const all_investments = await CopyTradeInvestment.findAll();

    let total_copytrade_amount = 0;

    all_investments.forEach(el => {
       total_copytrade_amount += el.amount;
    });

    const stats = {
        total_balance,
        total_profit,
        total_withdrawal,
        total_referral_balance,
        total_referrals,
        active_copytrade_investments,
        total_copytrade_amount,
        total_copytrade_profit,
        users
    };

    res.status(200).json({
        status: "success",
        data: {
            stats,
            latest_transactions: transactions,
            latest_investments: investments
        }
    });
});


// GetStatsForUser to Sequelize
exports.getStatsForUser = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const {
        investments,
        total_investment,
        total_profit,
        total_amount
    } = await getInvestmentStats(userId);

    const {total_copytrade_investment,total_copytrade_amount} = await getUserCopytradeInvestmentStats(userId)

    const { total_deposit,total_copytrade_deposit, total_withdrawal } = await getTotalTransactions(userId);

    const wallet = await Wallet.findOne({ where: { userId } });

    const total_referrals = await User.count({
        where: { referralId: req.user.accountId }
    });

    res.status(200).json({
        status: "success",
        data: {
            stats: {
                investments,
                total_investment,
                total_profit,
                total_withdrawal,
                total_amount,
                total_deposit,
                total_copytrade_deposit,
                total_referrals,
                total_copytrade_investment,
                total_copytrade_amount,
                wallet
            }
        }
    });
});
