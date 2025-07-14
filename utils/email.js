const nodemailer = require('nodemailer');
const pug = require('pug')
const { convert } = require('html-to-text');

module.exports = class Email {
    constructor(user, type,  url, amount, plan, emailVerificationCode){
        this.email = user.email;
        this.firstName = user.firstName;
        this.type = type;
        this.url = url;
        this.amount = amount;
        this.plan = plan;
        this.emailVerificationCode = emailVerificationCode;
        this.from = `TheRealWorldApp <${process.env.EMAIL_USER}>`;
    }

    newTransport(){
        // if(process.env.NODE_ENV === 'production'){
        //     // Using Gmail service
        //     return nodemailer.createTransport({
        //         service:"Gmail",
        //         auth:{
        //             user:process.env.GMAIL_USERNAME,
        //             pass:process.env.GMAIL_PASS
        //         }
        //     })
        // }

        if (process.env.NODE_ENV === 'production') {
            return nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                secure: process.env.EMAIL_PORT == 465, // Use TLS for port 465
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
        }


        // return nodemailer.createTransport({
        //     host:process.env.EMAIL_HOST,
        //     port:process.env.EMAIL_PORT,
        //     auth:{
        //         user:process.env.EMAIL_USERNAME,
        //         pass:process.env.EMAIL_PASSWORD
        //     }
        // })
    }

    async send(template, subject){
        // 1) Render the HTML base on the pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`,{
            firstName:this.firstName,
            url:this.url,
            type:this.type,
            amount:this.amount,
            plan:this.plan,
            emailVerificationCode:this.emailVerificationCode,
            subject
        })
        //2) Define email options
        const mailOptions = {
            from:this.from,
            to:this.email,
            subject,
            html,
             text: convert(html, {
                wordwrap: 130,       // Better formatting for plain text
                selectors: [
                { selector: 'a', options: { ignoreHref: true } }, // Cleaner links
                { selector: 'img', format: 'skip' }               // Skip images in text
                ]
            })
        }
        // 3) Create a transport and send email
       await this.newTransport().sendMail(mailOptions)
    }

    async sendOnBoard(){
        await this.send("welcome", "Account Approval Status")
    }
    async sendTransaction(){
        await this.send("transaction", "Transaction Notice")
    }

    async sendInvestment(){
        await this.send("investment", "Investment Notice")
    }
    async sendPasswordReset(){
        await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes)')
    }
    async sendVerificationEmail(){
        await this.send('emailVerification', 'Your email verification code (Valid for 15 minutes)')
    }
}
