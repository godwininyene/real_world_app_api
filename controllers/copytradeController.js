const AppError = require('../utils/apError');
const catchAsync = require('../utils/catchAsync');
const{CopyTrade} = require('./../models')
const multer = require('multer')
const sharp = require('sharp');
const {cloudinary} = require('./../utils/cloudinary');


const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb)=>{
    if(file.mimetype.startsWith("image")){
       cb(null, true)
    }else{
        cb(new AppError("Invalid File.", {image:"Image must be of type image!"}, 400), false)
    }
}

const upload = multer({
    storage:multerStorage,
    fileFilter:multerFilter
})


exports.uploadImage = upload.single("image");
exports.resizeImage = catchAsync(async(req, res, next)=>{
    if (!req.file) return next();
    const processedImageBuffer = await sharp(req.file.buffer)
        // .resize(800, 600)
        .toFormat("jpeg")
        .jpeg({ quality: 30 })
        .toBuffer();

    const result = await cloudinary.uploader.upload_stream({
        folder: 'crypto/tradeImages',
        public_id: `barcode-${req.user.id}-${Date.now()}`,
        format: 'jpeg',
    }, (error, result) => {
        if (error) {
            return next(new AppError("Cloudinary upload failed.",'', 500));
        }
        req.file.filename = result.secure_url; // store the URL for future use
        next();
    }).end(processedImageBuffer); // upload the buffer directly
});

exports.createCopyTrade = catchAsync(async(req, res, next)=>{
   if(req.file) req.body.image = req.file.filename;
    const copytrade = await CopyTrade.create(req.body);
    res.status(200).json({
        status:"success",
        data:{
            copytrade
        }
    })
});

exports.getAllCopytrades = catchAsync(async (req, res, next) => {
    const copytrades = await CopyTrade.findAll({order:[['createdAt', 'DESC']]});
    res.status(200).json({
        status:"success",
        result:copytrades.length,
        data:{
           copytrades
        }
    })
});

exports.updateCopytrade = catchAsync(async (req, res, next) => {
    if (req.file) req.body.image = req.file.filename;

    const copytrade = await CopyTrade.findByPk(req.params.id);

    if (!copytrade) {
        return next(new AppError("No copytrade was found with that ID", '', 404));
    }

    // Update fields manually
    Object.assign(copytrade, req.body);

    // This triggers validations & hooks
    await copytrade.save();

    res.status(200).json({
        status: "success",
        data: {
            copytrade
        }
    });
});

exports.deleteCopytrade  = catchAsync(async (req, res, next) => {
    console.log('trade id', req.params.id);
    
    const copytrade = await CopyTrade.findByPk(req.params.id);

    if (!copytrade) {
        return next(new AppError("No copytrade was found with that ID", '', 404));
    }

    await copytrade.destroy();

    res.status(204).json({
        status: "success",
        data: null
    });
});

