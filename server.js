const dotenv = require('dotenv');
dotenv.config({path:'./config.env'});

process.on('uncaughtException', err=>{
    console.log("uncaughtException! shutting down...")
    console.log(err, err.name, err.message) 
    process.exit(1)
})

const app = require('./app');

const port = process.env.PORT || 3000
const server = app.listen(port, ()=>{
    console.log(`running on port ${port}`);
})
process.on('unhandledRejection', err=>{
    console.log("UNHANDLED REJECTION! shutting down...")
    console.log(err.name, err.message)
    server.close(()=>{
        process.exit(1)
    })
})