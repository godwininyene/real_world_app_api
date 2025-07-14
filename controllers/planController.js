const AppError = require('../utils/apError');
const {Plan } = require('./../models');
const catchAsync = require('./../utils/catchAsync')


exports.getAllPlans = async(req, res, next)=>{
   
    const plans = await Plan.findAll();
    res.status(200).json({
        status:"success",
        result:plans.length,
        data:{
           plans
        }
    })
}

exports.createPlan = catchAsync(async(req, res, next)=>{
    const plan = await Plan.create(req.body)
    res.status(201).json({
        status:"success",
        data:{
            plan
        }
    })

});

exports.getPlan = catchAsync(async(req, res, next)=>{
    const plan = await Plan.findByPk(req.params.id)
    if(!plan){
        return next(new AppError("No plan was found with that ID", '', 404))
    }
    res.status(201).json({
        status:"success",
        data:{
            plan
        }
    })

});

exports.updatePlan = catchAsync(async (req, res, next) => {
  const [updatedCount] = await Plan.update(req.body, {
    where: { id: req.params.id }
  });

  if (updatedCount === 0) {
    return next(new AppError("No plan was found with that ID", '', 404));
  }

  const updatedPlan = await Plan.findByPk(req.params.id);

  res.status(200).json({
    status: "success",
    data: {
      plan: updatedPlan,
    },
  });
});


exports.deletePlan = catchAsync(async (req, res, next) => {
  const deletedCount = await Plan.destroy({
    where: { id: req.params.id }
  });

  if (deletedCount === 0) {
    return next(new AppError("No plan was found with that ID", '', 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
