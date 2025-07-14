const AppError = require("../utils/apError");

const handleSequelizeDuplicateError = err =>{
    const errors = err.errors.reduce((acc, el)=>{
        acc[el.path] = `${el.path} is already in use. Please use another value`
        return acc;
    }, {});
    return new AppError('Invalid data supplied', errors, 400)
}

const handleSequelizeValidationError = err =>{
    const errors = err.errors.reduce((acc, el)=>{
        acc[el.path] = el.message
        return acc;
    }, {})
    return new AppError('Invalid data supplied', errors, 400)
}

const handleCastErrorDb = err=>{
    let error =err;
    if(err.name== 'CastError' || err.reason == null){
        error = `Invalid ${err.path}: ${err.value}`;
    }
   
    if(err.reasons){
        if(err.reason.code == 'ERR_ASSERTION'){
            error = [{[err.path] :err.message}]
        }
    }
    return new AppError('Invalid data', error, 400)
}

const handleJWTError = ()=> new AppError("Token Error", {token: "Invalid token. Please log in again!"}, 401)
const handleJWTExpired = ()=> new AppError("Token Expired", {token: "Your token has expired. Please log in again!"}, 401)

const sendErrorDev = (err, res)=>{
    res.status(err.statusCode).json({
        status:err.status,
        message:err.message,
        error:err
    })
}

const sendErrorProd = (err, res)=>{
    // Operational, trusted error
   if(err.isOperational){
        res.status(err.statusCode).json({
            status:err.status,
            message:err.message,
            errors:err.errors
        });
    //programming  and unknown error: Don't Leak detail
   }else{
        res.status(err.statusCode).json({
            status:err.status,
            error:err,
            message:"Something went very wrong!",
        })
   }
    
}


module.exports = (err, req, res, next)=>{
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'
    if(process.env.NODE_ENV== 'development'){
       sendErrorDev(err, res)
    }else if(process.env.NODE_ENV == 'production'){
        let error = err;
       
        if(error.name == 'CastError') error = handleCastErrorDb(error)
        //Handle sequelize Errors
        if(error.name === 'SequelizeValidationError')error = handleSequelizeValidationError(err)
         if(error.name === 'SequelizeUniqueConstraintError') error = handleSequelizeDuplicateError(err)

        if(error.name =='JsonWebTokenError') error = handleJWTError();
        if(error.name == 'TokenExpiredError') error = handleJWTExpired();
      
        sendErrorProd(error, res)
    }
}