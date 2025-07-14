const { Faq } = require('./../models');
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/apError");

exports.createFaq = catchAsync(async(req, res, next)=>{
    const faq = await Faq.create(req.body);
    res.status(200).json({
        status:"success",
        data:{
            faq
        }
    })
});

exports.getAllfaqs = async(req, res, next)=>{
   
    const faqs = await Faq.findAll();
    res.status(200).json({
        status:"success",
        result:faqs.length,
        data:{
            faqs
        }
    })
}

exports.updateFaq = catchAsync(async (req, res, next) => {
    const [updatedCount, updatedRows] = await Faq.update(req.body, {
        where: { id: req.params.id },
        returning: true,
        individualHooks: true, // Optional: if you use hooks and want validators to run
    });

    if (updatedCount === 0) {
        return next(new AppError("No faq was found with that ID", '', 404));
    }

    const updatedFaq = updatedRows[0];

    res.status(200).json({
        status: "success",
        data: {
            faq: updatedFaq
        }
    });
});


exports.deleteFaq = catchAsync(async (req, res, next) => {
    const deletedCount = await Faq.destroy({
        where: { id: req.params.id }
    });

    if (deletedCount === 0) {
        return next(new AppError("No faq was found with that ID", '', 404));
    }

    res.status(204).json({
        status: "success",
        data: null
    });
});
