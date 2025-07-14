const AppError = require("../utils/apError");
const catchAsync = require("../utils/catchAsync");
const Email = require('./../utils/email')
const{ User, Wallet, BankAccount} = require('./../models')
const { Op } = require("sequelize");

const multer = require('multer')
const sharp = require('sharp');
const {cloudinary} = require('./../utils/cloudinary');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb)=>{
    if(file.mimetype.startsWith("image")){
       cb(null, true)
    }else{
        cb(new AppError("Invalid File.", {photo:"Photo must be of type image!"}, 400), false)
    }
}

const upload = multer({
    storage:multerStorage,
    fileFilter:multerFilter
})

exports.uploadPhoto = upload.single("photo");

exports.resizePhoto = catchAsync(async(req, res, next)=>{
    if (!req.file) return next();

    const processedImageBuffer = await sharp(req.file.buffer)
        .toFormat("jpeg")
        .jpeg({ quality: 30 })
        .toBuffer();

    const result = await cloudinary.uploader.upload_stream({
        folder: 'trw/photo',
        public_id: `photo-${req.user.id}-${Date.now()}`,
        format: 'jpeg',
    }, (error, result) => {
        if (error) {
            return next(new AppError("Cloudinary upload failed.", 500));
        }
        req.file.filename = result.secure_url; // store the URL for future use
        next();
    }).end(processedImageBuffer); // upload the buffer directly
})

const filterObj = (obj, ...allowFields)=>{
    const newObj = {};
    Object.keys(obj).forEach(key=>{
        if(allowFields.includes(key)) newObj[key] = obj[key]
    });

    return newObj
}

const updateApprovalStatus = async(user, newStatus)=> {
    if (newStatus === 'approve' && user.status === 'active') {
        throw new AppError("User account already approved!", '', 400);
    }
    if (newStatus === 'deny' && user.status === 'denied') {
        throw new AppError("User account approval already denied!", '', 400);
    }
    if (newStatus === 'deactivate' && user.status === 'deactivated') {
        throw new AppError("User account already deactivated!", '', 400);
    }

    if(newStatus === 'deny'){
        user.status = 'denied'
    }
    if(newStatus === 'approve'){
        user.status = 'active'
    }

    if(newStatus === 'deactivate'){
        user.status = 'deactivated'
    }
    
    await user.save({ validate: false });
    return user;
}



exports.getMe = (req, res, next)=>{
    req.params.id = req.user.id;
    next();
}
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Check if password fields are being updated
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError('This route is not for password updates. Please use /updateMyPassword', '', 401)
    );
  }

  // 2) Filter out fields not allowed to be updated
  const filteredBody = filterObj(req.body, 'firstName', 'lastName', 'email', 'phone', 'photo');
if(req.file) filteredBody.photo = req.file.filename;
  // 3) Update the user using Sequelize
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return next(new AppError('User not found', '', 404));
  }

  // Update only allowed fields
  Object.assign(user, filteredBody);
  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  // Soft delete by setting `status` to false
  const user = await User.findByPk(req.user.id);

  if (!user) {
    return next(new AppError('User not found', '', 404));
  }

  user.status = false;
  await user.save();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});


exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.findAll({
    order: [['createdAt', 'DESC']], 
    where: {
      role: {
        [Op.ne]: 'admin' // Exclude users with role 'admin'
      }
    },
    include: [
      { model: Wallet, as: 'wallet' },
      { model: BankAccount, as: 'bankAccounts' }
    ]
  });

  res.status(200).json({
    status: 'success',
    data: {
      results: users.length,
      users
    }
  });
});

exports.getUser = catchAsync(async(req, res, next)=>{
    const user = await User.findByPk(req.params.id, {
        include:[{model: Wallet, as: 'wallet'}]
    })
    if(!user){
        return next(new AppError("No user found with that ID", '', 404))
    }
    res.status(200).json({
        status:"success",
        data:{
            user
        }
    })
});



exports.deleteUser = catchAsync(async(req, res, next)=>{
    const deletedCount = await User.destroy({
        where: { id: req.params.id }
    });

    if (deletedCount === 0) {
        return next(new AppError("No user found with that ID", '', 404))
    }

    res.status(204).json({
        status: "success",
        data: null,
    });
})


exports.updateStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  let type;

  // Find user by primary key (id) with Wallet included
  const user = await User.findByPk(req.params.id, {
    include: [{ model: Wallet, as: 'wallet' }]
  });

  if (!user) {
    return next(new AppError('No user found with that ID', '', 404));
  }

  const url = `${req.get('referer')}manage/investor/dashboard`;

  if (status === 'approve') type = 'account_approved';
  if (status === 'deny') type = 'account_denied';
  if (status === 'deactivate') type = 'account_deactivated';

  try {
    const updatedUser = await updateApprovalStatus(user, status);

    await new Email(user, type, url).sendOnBoard();

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
    console.log('Email sent');
    
  } catch (error) {
    return next(
      new AppError('There was a problem sending the email. Please try again later!', '', 500)
    );
  }
});