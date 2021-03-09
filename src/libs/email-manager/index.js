const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, // generated ethereal user
        pass: process.env.EMAIL_PASS, // generated ethereal password
    },
});

module.exports = {
    createForgetPasswordEmail: ({to,code}) => {
        let from = "durim@solydfloors.com"
        let text = `Your verification code is: ${code}`
        let html = `Your verification code is: ${code}`
        let subject = "Solyd Floors: Forget password"
        return { from, to, subject, text, html }
    },
    sendEmail: async ({from,to,subject,text,html}) => {
        console.log({ 
            from: from || "durim@solydfloors.com",
            replyTo: "durim@solydfloors.com",
            to,
            subject,
            text,
            html 
        })
        return await transporter.sendMail({ 
            from: from || "durim@solydfloors.com",
            replyTo: "durim@solydfloors.com",
            to,
            subject,
            text,
            html 
        });
    }
}
