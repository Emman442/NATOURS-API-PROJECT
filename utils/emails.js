const { config } = require('dotenv')
const pug = require('pug')
const htmlToText = require('html-to-text')
// new Email(user, url, sendWelcome)
const nodemailer = require('nodemailer')
module.exports = class Email{
    constructor(user, url){
        this.to = user.email,
        this.firstName = user.name.split(" "),
        this.url = url,
        this.from = `Ndema Emmanuel Chidera <${process.env.EMAIL_FROM}>`

    }
    newTransport(){
        
        if(process.env.NODE_ENV === 'production'){
            return 1
        }
        return nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                }
                // activate in gmail "less secure app option"
            })
        }
        async send(template, subject){
            //send the actual email
            //1.) Render HTML based on a pug template
           const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,{
            firstName: this.firstName,
            url: this.url,
            subject
           })
            //2.) Define email options
            const mailOptions = {
                from:this.from,
                to: this.to,
                subject,
                html,
                text: htmlToText.convert(html, {
                    wordwrap: 130
                })
            }
            //3.) Create a transport and send the email
            await this.newTransport().sendMail(mailOptions);
        }
        async sendWelcome(){
            await this.send('welcome', 'Welcome to the Natours Family')
        }
        async sendPasswordReset(){
            await this.send('passwordReset','Your password Reset token(Valid for 10 minutes)')
        }
    }

