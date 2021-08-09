const nodemailer = require("nodemailer");

let transporter;

if (process.env.USE_GMAIL){
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }      
    });
} else {
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER, // generated ethereal user
            pass: process.env.EMAIL_PASS, // generated ethereal password
        },
    });
}

module.exports = {
    createForgetPasswordEmail: ({to,code, forget_password_token}) => {
        let from = process.env.EMAIL_USER
        let link = `${process.env.BASE_URL}/forgot_password?token=${forget_password_token}`
        let text = `Click on this link to reset your passwrod: ${link}`
        let html = `Click on this link to reset your passwrod: ${link}`
        let subject = "Solyd Floors: Forget password"
        return { from, to, subject, text, html }
    },
    sendEmail: async ({from,to,subject,text,html}) => {
        console.log({ 
            from: from || process.env.EMAIL_USER || "durim@solydfloors.com",
            replyTo: process.env.EMAIL_USER || "durim@solydfloors.com",
            to: 'gjergjk71@gmail.com',
            subject,
            text,
            html 
        })
        return await transporter.sendMail({ 
            from: from || process.env.EMAIL_USER || "durim@solydfloors.com",
            replyTo: process.env.EMAIL_USER || "durim@solydfloors.com",
            to: 'gjergjk71@gmail.com',
            subject,
            text,
            html 
        });
    }
}
