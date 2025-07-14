const catchAsync = require("../utils/catchAsync");
const{BankAccount} = require('./../models')

exports.createBankAccount = catchAsync(async(req, res, next)=>{
    // Assign the user ID if it's not provided in the body (for nested routes)
    if (!req.body.userId) req.body.userId = req.user.id;
    const account = await BankAccount.create(req.body);
    res.status(200).json({
        status:"success",
        data:{
            account
        }
    })
})

exports.getAllAccounts = catchAsync(async(req, res, next)=>{
    const accounts = await BankAccount.findAll({where:{userId:req.user.id}});

    res.status(200).json({
        status:"success",
        data:{
            accounts
        }
    });
})

exports.deleteWallet = catchAsync(async (req, res, next) => {
    const deletedCount = await BankAccount.destroy({
        where: { id: req.params.id }
    });

    if (deletedCount === 0) {
        return next(new AppError("No wallet was found with that ID", '', 404));
    }

    res.status(204).json({
        status: "success",
        data: null
    });
});