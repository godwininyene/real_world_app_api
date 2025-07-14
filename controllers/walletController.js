const catchAsync = require("../utils/catchAsync");
const{User, Wallet} = require('./../models')

exports.fundWallet = catchAsync(async (req, res, next) => {
    const { wallet_type, amount } = req.body;
    const userId = req.params.id;

    // 1) Find wallet by userId
    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) {
        return next(new AppError("Wallet not found for this user", '', 404));
    }

    // 2) Add amount to the appropriate wallet_type field
    wallet[wallet_type] += parseInt(amount, 10);
    await wallet.save();

    // 3) Fetch updated user with populated wallet
    const user = await User.findOne({
        where: { id: userId },
        include: [{ model: Wallet, as: 'wallet' }]
    });

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});
