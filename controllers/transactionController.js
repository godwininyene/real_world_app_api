const catchAsync = require("../utils/catchAsync");
const{Transaction, User, Wallet} = require('./../models')
const Email = require('./../utils/email')
const AppError = require('./../utils/apError')
const multer = require('multer')
const sharp = require('sharp');
const {cloudinary} = require('./../utils/cloudinary');


const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb)=>{
    if(file.mimetype.startsWith("image")){
       cb(null, true)
    }else{
        cb(new AppError("Invalid File.", {receipt:"Receipt must be of type image!"}, 400), false)
    }
}

const upload = multer({
    storage:multerStorage,
    fileFilter:multerFilter
})


exports.uploadReceipt = upload.single("receipt");
exports.resizeReceipt = catchAsync(async(req, res, next)=>{
    if (!req.file) return next();

    const processedImageBuffer = await sharp(req.file.buffer)
        .toFormat("jpeg")
        .jpeg({ quality: 30 })
        .toBuffer();

    const result = await cloudinary.uploader.upload_stream({
        folder: 'trw/receipts',
        public_id: `receipt-${req.user._id}-${Date.now()}`,
        format: 'jpeg',
    }, (error, result) => {
        if (error) {
            return next(new AppError("Cloudinary upload failed.", 500));
        }
        req.file.filename = result.secure_url; // store the URL for future use
        next();
    }).end(processedImageBuffer); // upload the buffer directly
})
exports.createTransaction = catchAsync(async(req, res, next)=>{
    const { type, amount, payOption, user } = req.body;
    
    // Assign the user ID if it's not provided in the body (for nested routes)
    if (!req.body.userId) req.body.userId = req.user.id;

    // If transaction type is 'withdrawal', check the payment option
    if (type === 'withdrawal') {
        if (!payOption) {
            return next(new AppError('Missing Pay option.', { payOption: 'Please provide pay option' }, 400));
        }

        const wallet = await Wallet.findOne({ userId: req.user.id });
        if (!wallet) return next(new AppError('Wallet not found.', '', 404));

        // Validate withdrawal based on the selected payOption and wallet balances
        let balanceField, balanceAmount;
        if (payOption === 'profit') {
            balanceField = 'profit';
            balanceAmount = wallet.profit;
        } else if (payOption === 'balance') {
            balanceField = 'balance';
            balanceAmount = wallet.balance;
        } else if (payOption === 'referralBalance') {
            balanceField = 'referral balance';
            balanceAmount = wallet.referralBalance;
        }else if(payOption ==='copytradeBalance'){
             balanceField = 'copytrade balance';
            balanceAmount = wallet.copytradeBalance

        }else if(payOption === 'copytradeProfit'){
            balanceField = 'copytrade profit';
            balanceAmount = wallet.copytradeProfit

        }else{
            return next(new AppError('Invalid pay opton.', {payOption:`Pay option is either: profit, balance or referral_balance. But got ${pay_option}`}, 400))
        }

        if (balanceAmount < amount) {
            return next(
                new AppError(
                    `Insufficient funds. You are trying to withdraw $${amount} from your ${balanceField}, but your ${balanceField} is only $${balanceAmount}. Please check your balance and try again.`,
                    '',
                    400
                )
            );
        }
    }

    // Create new transaction
    // if(req.file) req.body.receipt = `${req.protocol}://${req.get('host')}/img/receipts/${req.file.filename}`;
    if(req.file) req.body.receipt = req.file.filename;
     const newTransaction = await Transaction.create(req.body);

    //send email to user
    try {
        await new Email(req.user, type, '', amount).sendTransaction()
        // Send response after successful transaction and email
        res.status(201).json({
            status: 'success',
            data: {
                transaction: newTransaction,
            },
        });
    } catch (error) {
       
        return next(new AppError("There was a problem sending the email.. Please try again later!", '', 500))
    }
});

exports.getAllTransactions = catchAsync(async (req, res, next) => {
    // Set filter condition based on user role
    const whereCondition = req.user.role !== 'admin' ? { userId: req.user.id } : {};

    // Build the query options
    const queryOptions = {
        where: whereCondition,
        order: [['createdAt', 'DESC']],
    };

    // If admin, include user details
    if (req.user.role === 'admin') {
        queryOptions.include = [
            {
                model: User,
                as: 'user',
                attributes: ['firstName', 'lastName', 'photo', 'email'],
            },
        ];
    }

    const transactions = await Transaction.findAll(queryOptions);

    res.status(200).json({
        results: transactions.length,
        status: 'success',
        data: {
            transactions,
        },
    });
});



exports.getRecentTransactions = catchAsync(async (req, res, next) => {
    // Default to 5 if not provided
    const limit = parseInt(req.query.limit) || 5;

    // Setup base query options
    const queryOptions = {
        order: [['createdAt', 'DESC']],
        limit,
        where: {},
    };

    // If user is not admin, filter by logged-in user
    if (req.user.role !== 'admin') {
        queryOptions.where.userId = req.user.id;
    } else {
        // Admin: allow querying by user ID if provided
        if (req.query.user) {
            queryOptions.where.userId = req.query.user;
        }

        // Include user details
        queryOptions.include = [{
            model: User,
            as:'user',
            attributes: ['firstName', 'lastName'],
        }];
    }

    const transactions = await Transaction.findAll(queryOptions);

    res.status(200).json({
        status: 'success',
        results: transactions.length,
        data: {
            transactions,
        },
    });
});


exports.handleTransaction = catchAsync(async (req, res, next) => {
    const { action } = req.params; // 'approve' or 'decline'
    const transactionId = req.params.id;

    // Retrieve the transaction
    const transaction = await Transaction.findByPk(transactionId, {
        include: req.user.role === 'admin' ? [{ model: User, as:'user',attributes: ['firstName', 'lastName', 'photo'] }] : []
    });

    if (!transaction) {
        return next(new AppError("No transaction was found with that ID", '', 404));
    }

    // Get the user and wallet
    const user = await User.findByPk(transaction.userId);
    const wallet = await Wallet.findOne({ where: { userId: transaction.userId } });

    if (!user || !wallet) {
        return next(new AppError("User or wallet not found", '', 404));
    }

    // Check already processed
    if (action === 'approve' && transaction.status === 'success') {
        return next(new AppError("Transaction already approved!", '', 400));
    }
    if (action === 'decline' && transaction.status === 'declined') {
        return next(new AppError("Transaction already declined!", '', 400));
    }

    // Update balances and transaction status
    if (action === 'approve') {
        if (transaction.type === 'investment deposit') {
            wallet.balance += transaction.amount;
        }else if(transaction.type == 'copytrade deposit'){
            wallet.copytradeBalance = transaction.amount
        } else if (transaction.type === 'withdrawal') {
            wallet[transaction.payOption] -= transaction.amount;
        }
        transaction.status = 'success';
    } else if (action === 'decline') {
        // If already approved before and now declining, reverse the previous action
        if (transaction.status === 'success') {
            if (transaction.type === 'investment deposit') {
                wallet.balance -= transaction.amount;
            }else if(transaction.type === 'copytrade deposit'){
                wallet.copytradeBalance-=transaction.amount
            } else if (transaction.type === 'withdrawal') {
                wallet[transaction.payOption] += transaction.amount;
            }
        }
        transaction.status = 'declined';
    }

    // Save updates
    await wallet.save();
    await transaction.save();

    // Email preparation
    const referer = req.get('referer') || '';
    const urls = {
        deposit: `${referer}manage/investor/dashboard`,
        withdrawal: `${referer}manage/investor/transactions`
    };

    const types = {
        approve: {
            deposit: 'confirmed_deposit',
            withdrawal: 'confirmed_withdraw'
        },
        decline: {
            deposit: 'unconfirmed_deposit',
            withdrawal: 'unconfirmed_withdraw'
        }
    };

    const use_type = transaction.type ==='investment deposit' || transaction.type =='copytrade deposit' ? 'deposit' : 'withdrawal'

    const type = types[action]?.[use_type];
    const url = action === 'approve' ? urls[use_type] : undefined;

    try {
        await new Email(user, type, url, transaction.amount).sendTransaction();

        res.status(200).json({
            status: 'success',
            message: `Transaction ${action}d successfully!`,
            data: {
                transaction
            }
        });
    } catch (error) {
        return next(new AppError("There was a problem sending the email. Please try again later!", '', 500));
    }
});
