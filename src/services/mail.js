const nodemailer = require("nodemailer");
require("dotenv").config({ override: true });

const APP_NAME = "TradeMark";

const transporter = nodemailer.createTransport({
  // service: 'gmail',
  host: process.env.MAIL_HOST,
  secure: true,
  port: process.env.MAIL_PORT_OUT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.error("Mailing failed to verify:", err);
  } else {
    console.log("Ready for message to be sent:", success);
  }
});

async function sendMail({ to, subject, html }) {
  try {
    await transporter.sendMail({
      from: `${APP_NAME} ${process.env.EMAIL_USER}`,
      to,
      subject,
      html,
    });
    console.log("Email sent.", { to, subject });
  } catch (error) {
    console.error("Email not sent.", error);
    throw error;
  }
}

async function sendOTPByEmail({ email, otp, token, name }) {
  const verificationLink = `https://www.trademarkltd-inv.com/auth/emailVerification?otp=${otp}&token=${token}`;
  const html = `
  <html
  lang="en"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:v="urn:schemas-microsoft-com:vml"
>
  <head>
    <title></title>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />

    <link
      href="https://fonts.googleapis.com/css2?family=Abril+Fatface:wght@100;200;300;400;500;600;700;800;900"
      rel="stylesheet"
      type="text/css"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;200;300;400;500;600;700;800;900"
      rel="stylesheet"
      type="text/css"
    />
    <style>
      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 0;
      }

      a[x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: inherit !important;
      }

      #MessageViewBody a {
        color: inherit;
        text-decoration: none;
      }

      p {
        line-height: inherit;
      }

      .desktop_hide,
      .desktop_hide table {
        mso-hide: all;
        display: none;
        max-height: 0px;
        overflow: hidden;
      }

      .image_block img + div {
        display: none;
      }

      @media (max-width: 620px) {
        .desktop_hide table.icons-inner {
          display: inline-block !important;
        }

        .icons-inner {
          text-align: center;
        }

        .icons-inner td {
          margin: 0 auto;
        }

        .image_block div.fullWidth {
          max-width: 100% !important;
        }

        .mobile_hide {
          display: none;
        }

        .row-content {
          width: 100% !important;
        }

        .stack .column {
          width: 100%;
          display: block;
        }

        .mobile_hide {
          min-height: 0;
          max-height: 0;
          max-width: 0;
          overflow: hidden;
          font-size: 0px;
        }

        .desktop_hide,
        .desktop_hide table {
          display: table !important;
          max-height: none !important;
        }
      }
    </style>
  </head>
  <body
    style="
      background-color: #ffffff;
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: none;
      text-size-adjust: none;
    "
  >
    <table
      border="0"
      cellpadding="0"
      cellspacing="0"
      class="nl-container"
      role="presentation"
      style="
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
        background-color: #ffffff;
      "
      width="100%"
    >
      <tbody>
        <tr>
          <td>
            <table
              align="center"
              border="0"
              cellpadding="0"
              cellspacing="0"
              class="row row-1"
              role="presentation"
              style="
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                background-color: #191c24;
              "
              width="100%"
            >
              <tbody>
                <tr>
                  <td>
                    <table
                      align="center"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      class="row-content stack"
                      role="presentation"
                      style="
                        mso-table-lspace: 0pt;
                        mso-table-rspace: 0pt;
                        background-position: center top;
                        color: #000000;
                        background-repeat: no-repeat;
                        width: 600px;
                        margin: 0 auto;
                      "
                      width="600"
                    >
                      <tbody>
                        <tr>
                          <td
                            class="column column-1"
                            style="
                              mso-table-lspace: 0pt;
                              mso-table-rspace: 0pt;
                              font-weight: 400;
                              text-align: left;
                              vertical-align: top;
                              border-top: 0px;
                              border-right: 0px;
                              border-bottom: 0px;
                              border-left: 0px;
                            "
                            width="100%"
                          >
                            <table
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              class="image_block block-1"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                              "
                              width="100%"
                            >
                              <tr>
                                <td
                                  class="pad"
                                  style="
                                    padding-bottom: 35px;
                                    padding-left: 30px;
                                    padding-right: 30px;
                                    padding-top: 35px;
                                    width: 100%;
                                  "
                                >
                                  <div
                                    align="center"
                                    class="alignment"
                                    style="line-height: 10px"
                                  >
                                    <div style="max-width: 270px">
                                      <img
                                        style="
                                          display: block;
                                          height: auto;
                                          border: 0;
                                          width: 100%;
                                        "
                                        width="270"
                                      />
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </table>
                            <table
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              class="image_block block-2"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                              "
                              width="100%"
                            >
                              <tr>
                                <td
                                  class="pad"
                                  style="
                                    width: 100%;
                                    padding-right: 0px;
                                    padding-left: 0px;
                                  "
                                >
                                  <div
                                    align="center"
                                    class="alignment"
                                    style="line-height: 10px"
                                  >
                                    <div
                                      class="fullWidth"
                                      style="max-width: 600px"
                                    >
                                      <img
                                        style="
                                          display: block;
                                          height: auto;
                                          border: 0;
                                          width: 100%;
                                        "
                                        width="600"
                                      />
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            <table
              align="center"
              border="0"
              cellpadding="0"
              cellspacing="0"
              class="row row-2"
              role="presentation"
              style="
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                background-color: #191c24;
              "
              width="100%"
            >
              <tbody>
                <tr>
                  <td>
                    <table
                      align="center"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      class="row-content stack"
                      role="presentation"
                      style="
                        mso-table-lspace: 0pt;
                        mso-table-rspace: 0pt;
                        background-position: center top;
                        color: #000000;
                        background-color: #191c24;
                        width: 600px;
                        margin: 0 auto;
                      "
                      width="600"
                    >
                      <tbody>
                        <tr>
                          <td
                            class="column column-1"
                            style="
                              mso-table-lspace: 0pt;
                              mso-table-rspace: 0pt;
                              font-weight: 400;
                              text-align: left;
                              padding-bottom: 10px;
                              vertical-align: top;
                              border-top: 0px;
                              border-right: 0px;
                              border-bottom: 0px;
                              border-left: 0px;
                            "
                            width="100%"
                          >
                            <table
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              class="image_block block-1"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                              "
                              width="100%"
                            >
                              <tr>
                                <td
                                  class="pad"
                                  style="
                                    padding-bottom: 5px;
                                    padding-left: 20px;
                                    padding-right: 20px;
                                    padding-top: 5px;
                                    width: 100%;
                                  "
                                >
                                  <div
                                    align="center"
                                    class="alignment"
                                    style="line-height: 10px"
                                  >
                                    <div style="max-width: 398px">
                                      <img
                                        style="
                                          display: block;
                                          height: auto;
                                          border: 0;
                                          width: 100%;
                                        "
                                        width="398"
                                      />
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              align="center"
              border="0"
              cellpadding="0"
              cellspacing="0"
              class="row row-3"
              role="presentation"
              style="
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                background-color: #050D1A;
                background-size: auto;
              "
              width="100%"
            >
              <tbody>
                <tr>
                  <td>
                    <table
                      align="center"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      class="row-content stack"
                      role="presentation"
                      style="
                        mso-table-lspace: 0pt;
                        mso-table-rspace: 0pt;
                        background-size: auto;
                        background-color: #ffffff;
                        color: #000000;
                        width: 600px;
                        margin: 0 auto;
                        border-radius: 0.5rem;
                      "
                      width="600"
                    >
                      <tbody>
                        <tr>
                          <td
                            class="column column-1"
                            style="
                              mso-table-lspace: 0pt;
                              mso-table-rspace: 0pt;
                              font-weight: 400;
                              text-align: left;
                              vertical-align: top;
                              border-top: 0px;
                              border-right: 0px;
                              border-bottom: 0px;
                              border-left: 0px;
                            "
                            width="100%"
                          >
                            <table
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              class="paragraph_block block-1"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                                word-break: break-word;
                              "
                              width="100%"
                            >
                              <tr>
                                <td
                                  class="pad"
                                  style="
                                    padding-bottom: 20px;
                                    padding-left: 15px;
                                    padding-right: 15px;
                                    padding-top: 10px;
                                  "
                                >
                                  <div
                                    style="
                                      color: #737487;
                                      font-family: Arial, Helvetica Neue,
                                        Helvetica, sans-serif;
                                      font-size: 18px;
                                      line-height: 180%;
                                      text-align: center;
                                      mso-line-height-alt: 32.4px;
                                    "
                                  >
                                    <h1
                                      style="
                                        text-align: center;
                                        color: #191c24;
                                        padding-block: 1rem;
                                        border: 1px solid #050D1A;
                                        margin: 0;
                                        margin-bottom: 1rem;
                                      "
                                    >
TradeMark
                                    </h1>
                                    <p
                                      style="
                                        margin: 0;
                                        word-break: break-word;
                                        text-transform: capitalize;
                                      "
                                    >
                                      Hello ${name.split(" ")[0]},
                                    </p>
                                    <p
                                      style="margin: 0; word-break: break-word"
                                    >
                                      <span
                                        >Please Confirm your email address
                                      </span>
                                    </p>
                                    <p
                                      style="margin: 0; word-break: break-word"
                                    >
                                      <span
                                        >to finish setting up your
                                        account.</span
                                      >
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            </table>
                            <table
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              class="button_block block-2"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                              "
                              width="100%"
                            >
                              <tr>
                                <td
                                  class="pad"
                                  style="
                                    padding-bottom: 20px;
                                    padding-left: 15px;
                                    padding-right: 15px;
                                    padding-top: 20px;
                                    text-align: center;
                                  "
                                >
                                  <div align="center" class="alignment">
                                    <a href="${verificationLink}">
                                      <div
                                        style="
                                          text-decoration: none;
                                          display: inline-block;
                                          color: #ffffff;
                                          cursor: pointer;
                                          background-color: #050D1A;
                                          border-radius: 4px;
                                          width: auto;
                                          border-top: 0px solid transparent;
                                          font-weight: 400;
                                          border-right: 0px solid transparent;
                                          border-bottom: 0px solid transparent;
                                          border-left: 0px solid transparent;
                                          padding-top: 10px;
                                          padding-bottom: 10px;
                                          font-family: 'Roboto', Tahoma, Verdana,
                                            Segoe, sans-serif;
                                          font-size: 16px;
                                          text-align: center;
                                          mso-border-alt: none;
                                          word-break: keep-all;
                                        "
                                      >
                                        <span
                                          style="
                                            padding-left: 60px;
                                            padding-right: 60px;
                                            font-size: 16px;
                                            display: inline-block;
                                            letter-spacing: normal;
                                          "
                                          ><span
                                            style="
                                              word-break: break-word;
                                              line-height: 32px;
                                            "
                                            >Confirm Email</span
                                          ></span
                                        >
                                      </div>
                                    </a>
                                  </div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              align="center"
              border="0"
              cellpadding="0"
              cellspacing="0"
              class="row row-4"
              role="presentation"
              style="
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                background-color: #050D1A;
              "
              width="100%"
            >
              <tbody>
                <tr>
                  <td>
                    <table
                      align="center"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      class="row-content stack"
                      role="presentation"
                      style="
                        mso-table-lspace: 0pt;
                        mso-table-rspace: 0pt;
                        background-position: center top;
                        color: #000000;
                        width: 600px;
                        margin: 0 auto;
                      "
                      width="600"
                    >
                      <tbody>
                        <tr>
                          <td
                            class="column column-1"
                            style="
                              mso-table-lspace: 0pt;
                              mso-table-rspace: 0pt;
                              font-weight: 400;
                              text-align: left;
                              vertical-align: top;
                              border-top: 0px;
                              border-right: 0px;
                              border-bottom: 0px;
                              border-left: 0px;
                            "
                            width="100%"
                          >
                            <table
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              class="image_block block-1"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                              "
                              width="100%"
                            >
                              <tr>
                                <td
                                  class="pad"
                                  style="
                                    width: 100%;
                                    padding-right: 0px;
                                    padding-left: 0px;
                                  "
                                >
                                  <div
                                    align="center"
                                    class="alignment"
                                    style="line-height: 10px"
                                  >
                                    <div
                                      class="fullWidth"
                                      style="max-width: 600px"
                                    >
                                      <img
                                        style="
                                          display: block;
                                          height: auto;
                                          border: 0;
                                          width: 100%;
                                        "
                                        width="600"
                                      />
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </table>
                            <table
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              class="text_block block-2"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                                word-break: break-word;
                              "
                              width="100%"
                            >
                              <tr>
                                <td
                                  class="pad"
                                  style="
                                    padding-bottom: 5px;
                                    padding-left: 5px;
                                    padding-right: 5px;
                                    padding-top: 30px;
                                  "
                                >
                                  <div
                                    style="
                                      font-family: Tahoma, Verdana, sans-serif;
                                    "
                                  >
                                    <div
                                      class=""
                                      style="
                                        font-size: 12px;
                                        font-family: 'Roboto', Tahoma, Verdana,
                                          Segoe, sans-serif;
                                        mso-line-height-alt: 14.399999999999999px;
                                        color: #fff;
                                        line-height: 1.2;
                                      "
                                    >
                                      <p
                                        style="
                                          margin: 0;
                                          font-size: 14px;
                                          text-align: center;
                                          mso-line-height-alt: 16.8px;
                                        "
                                      >
                                        <span style="font-size: 12px"
                                          >© 2025 TradeMark </span
                                        >
                                      </p>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </table>
                            <table
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              class="text_block block-3"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                                word-break: break-word;
                              "
                              width="100%"
                            >
                              <tr>
                                <td
                                  class="pad"
                                  style="
                                    padding-bottom: 35px;
                                    padding-left: 10px;
                                    padding-right: 10px;
                                    padding-top: 5px;
                                  "
                                >
                                  <div style="font-family: sans-serif">
                                    <div
                                      class=""
                                      style="
                                        font-size: 12px;
                                        mso-line-height-alt: 14.399999999999999px;
                                        color: #262b30;
                                        line-height: 1.2;
                                        font-family: Arial, Helvetica Neue,
                                          Helvetica, sans-serif;
                                      "
                                    >
                                      <p
                                        style="
                                          margin: 0;
                                          font-size: 12px;
                                          mso-line-height-alt: 14.399999999999999px;
                                        "
                                      >
                                         
                                      </p>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- End -->
  </body>
</html>
`;
  await sendMail({
    to: email,
    subject: "Account Verification",
    html,
  });
}

async function sendEmailVerified({ email, name }) {
  await sendMail({
    to: email,
    subject: "Registration Successful",
    html: `<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title></title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        background-color: #191c24;
        padding: 20px;
        margin: 0;
      }
      .container {
        max-width: 600px;
        margin: auto;
        background-color: #fff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }
      .logo {
        text-align: center;
        margin-bottom: 20px;
      }
      .logo img {
        width: 150px;
        height: auto;
      }
      .message {
        text-align: center;
        margin-bottom: 30px;
      }
      .footer {
        text-align: center;
        margin-top: 30px;
        font-size: 14px;
        color: #888;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">
        <h1
          style="
            text-align: center;
            color: #191c24;
            padding-block: 1rem;
            border: 1px solid #050D1A;
            margin: 0;
            margin-bottom: 1rem;
          "
        >
          TradeMark 
        </h1>
      </div>
      <div class="message">
        <p>Dear ${name.split(" ")[0]},</p>
        <p>Thank you for registering with us.</p>
        <p>Your account has been successfully verified.</p>
        <p>Enjoy using our platform!</p>
      </div>
      <div class="footer">
        <p>TradeMark  &copy; 2024. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
`,
  });
}

async function sendResetPasswordLink({ email, otp, token, name }) {
  const resetPasswordLink = `https://www.trademarkltd-inv.com/auth/resetpassword?token=${token}`;

  const html = `
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Reset Your Password</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          background-color: #f4f4f4;
          padding: 20px;
          margin: 0;
        }
        .container {
          max-width: 600px;
          margin: auto;
          background-color: #fff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .logo {
          text-align: center;
          margin-bottom: 20px;
        }
        .logo img {
          width: 150px;
          height: auto;
        }
        .message {
          text-align: center;
          margin-bottom: 30px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 14px;
          color: #888;
        }
        .button {
          background-color: #007bff;
          color: #fff;
          padding: 12px 24px;
          text-decoration: none;
          font-size: 16px;
          border-radius: 5px;
          display: inline-block;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <h1 style="text-align: center; color: #191c24; padding-block: 1rem; border: 1px solid #050D1A; margin: 0; margin-bottom: 1rem;">
            TradeMark 
          </h1>
        </div>
        <div class="message">
          <p>Dear ${name.split(" ")[0]},</p>
          <p>We received a request to reset the password for your account.</p>
          <p>Your OTP is: <strong>${otp}</strong></p>
          <p>To reset your password, please click the button below:</p>
          <a href="${resetPasswordLink}" class="button">Reset Password</a>
          <p>If you did not request a password reset, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>TradeMark &copy; 2024. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendMail({
    to: email,
    subject: "Reset Your Password",
    html,
  });
}

async function sendResetPasswordSuccessful({ email }) {
  await sendMail({
    to: email,
    subject: "Password Reset Successful",
    html: `Your password has successfully been reset, if you didn't reset your password, please contact support immediately. <br> ${APP_NAME}.`,
  });
}

module.exports = {
  sendMail,
  sendOTPByEmail,
  sendEmailVerified,
  sendResetPasswordLink,
  sendResetPasswordSuccessful,
};
