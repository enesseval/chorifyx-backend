import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
   throw new Error("Email konfigürasyonu eksik! EMAIL_USER ve EMAIL_PASS gerekli.");
}

export const transporter = nodemailer.createTransport({
   service: "gmail",
   auth: {
      user: process.env.EMAIL_USER, // .env'den al
      pass: process.env.EMAIL_PASS,
   },
});

export const sendVerificationMail = async (to: string): Promise<number> => {
   const verificationCode = crypto.randomInt(100000, 999999);

   const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: "Chorifyx kullanıcı doğrulama kodu",
      html: `<!DOCTYPE html>
<html lang="tr">
<head>
   <meta charset="UTF-8">
   <meta http-equiv="X-UA-Compatible" content="IE=edge">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Doğrulama Kodu</title>
   <style>
      body {
         font-family: Arial, sans-serif;
         background-color: #f4f4f4;
         color: #333;
         margin: 0;
         padding: 0;
      }
      .container {
         max-width: 600px;
         margin: 20px auto;
         background-color: #ffffff;
         border-radius: 8px;
         box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
         overflow: hidden;
      }
      .header {
         background-color: #1B1D22;
         color: #ffffff;
         padding: 20px;
         text-align: center;
      }
      .header img {
         max-width: 150px;
         margin-bottom: 10px;
      }
      .content {
         padding: 20px;
         text-align: center;
      }
      .content h1 {
         color: #333333;
      }
      .verification-code {
         font-size: 24px;
         font-weight: bold;
         color: #4a90e2;
         margin: 20px 0;
      }
      .footer {
         background-color: #f4f4f4;
         color: #777777;
         padding: 10px;
         font-size: 12px;
         text-align: center;
         border-radius: 8px;
      }
   </style>
</head>
<body>
   <div class="container">
      <div class="header">
         <img src="https://i.hizliresim.com/3wenu83.png" alt="Chorifyx Logo" />
      </div>
      <div class="content">
         <h1>Merhaba,</h1>
         <p>Hesabınızı doğrulamak için aşağıdaki kodu kullanın:</p>
         <div class="verification-code">${verificationCode}</div>
         <p>Bu kod 15 dakika boyunca geçerlidir. Eğer bu isteği siz yapmadıysanız lütfen bu mesajı göz ardı edin.</p>
      </div>
      <div class="footer">
         © 2024 Chorifyx. Tüm hakları saklıdır.
      </div>
   </div>
</body>
</html>
`,
   };

   return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (err, info) => {
         if (err) {
            console.log("Bir hata oluştu.", err);
            reject(err);
         } else {
            console.log("Mail gönderildi", info.response);
            resolve(verificationCode);
         }
      });
   });
};
