const User = require("../models/user.js");
const Organization = require("../models/organization.js");
const Donation = require("../models/donation.js");
const Update = require("../models/update.js");

const Razorpay = require("razorpay");
const AWS = require("aws-sdk");
const PDFDocument = require("pdfkit");
const Sib = require("sib-api-v3-sdk");
exports.donateController = async (req, res) => {
  try {
    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET_KEY,
    });

    const amount = parseInt(req.query.amount) * 100;

    const order = await rzp.orders.create({ amount, currency: "INR" });

    const newDonation = await Donation.create({
      paymentid: "PENDING",
      amount: parseInt(req.query.amount),
      url: "pending",
      orderid: order.id,
      status: "PENDING",
      userId: req.user.id,
      organizationId: req.query.oid,
    });

    return res.status(201).json({ order, key_id: rzp.key_id });
  } catch (err) {
    console.log(err);
    res.status(403).json({ message: "Something went wrong", error: err });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { payment_id, order_id } = req.body;
    const donation = await Donation.update(
      {
        paymentid: payment_id,
        status: "SUCCESSFUL",
      },
      {
        where: { orderid: order_id },
      }
    );

    const successDonation = await Donation.findOne({
      where: { orderid: order_id },
    });

    const organization = await Organization.findOne({
      where: { id: successDonation.organizationId },
    });
    await Organization.update(
      { amount: organization.amount + successDonation.amount },
      { where: { id: organization.id } }
    );
    const sender = await User.findOne({
      where: { id: successDonation.userId },
    });
    const pdfUrl = await upload_to_s3(
      [
        {
          amount: `Rs ${successDonation.amount}`,
          payment_id: successDonation.paymentid,
          status: successDonation.status,
          sender: `name : ${sender.uname}___ email : ${sender.email}`,
          reciever: `name :${organization.oname} ___ email :${organization.contactEmail}`,
          date: `${successDonation.createdAt}`,
        },
      ],
      `donation_${req.user.email}/${successDonation.paymentid}.pdf`
    );
    console.log("PDF URL:", pdfUrl);
    await Donation.update(
      {
        url: pdfUrl,
      },
      {
        where: { orderid: order_id },
      }
    );
    sendMail(sender.email, "receipt of transaction", pdfUrl, true);

    return res
      .status(201)
      .json({ success: true, message: "Transaction Successful" });
  } catch (err) {
    console.log(err);
  }
};

exports.failedTransaction = async (req, res) => {
  try {
    const { payment_id, order_id } = req.body;

    const donation = await Donation.update(
      {
        paymentid: payment_id,
        status: "FAILED",
      },
      {
        where: { orderid: order_id },
      }
    );
    const successDonation = await Donation.findOne({
      where: { orderid: order_id },
    });
    const organization = await Organization.findOne({
      where: { id: successDonation.organizationId },
    });
    const sender = await User.findOne({
      where: { id: successDonation.userId },
    });
    const pdfUrl = await upload_to_s3(
      [
        {
          amount: `Rs ${successDonation.amount}`,
          payment_id: successDonation.paymentid,
          status: successDonation.status,
          sender: `name : ${sender.uname}___ email : ${sender.email}`,
          reciever: `name :${organization.oname} ___ email :${organization.contactEmail}`,
          date: `${successDonation.createdAt}`,
        },
      ],
      `donation_${req.user.email}/${successDonation.paymentid}.pdf`
    );
    console.log("PDF URL:", pdfUrl);
    await Donation.update(
      {
        url: pdfUrl,
      },
      {
        where: { orderid: order_id },
      }
    );

    return res
      .status(200)
      .json({ success: false, message: "Transaction Failed" });
  } catch (err) {
    console.log(err);
  }
};

async function createPdfBuffer(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // Add content to the PDF
    doc.fontSize(16).text("Donation Details", { align: "center" });
    doc.moveDown();
    data.forEach((donation) => {
      Object.entries(donation).forEach(([key, value]) => {
        doc.fontSize(12).text(`${key}: ${value}`);
      });
      doc.moveDown();
    });

    doc.end();
  });
}

async function upload_to_s3(data, file_name) {
  try {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_ID = process.env.IAM_USER_ID;
    const IAM_USER_KEY = process.env.IAM_USER_KEY;

    const s3 = new AWS.S3({
      accessKeyId: IAM_USER_ID,
      secretAccessKey: IAM_USER_KEY,
    });

    // Convert data to PDF
    const pdfBuffer = await createPdfBuffer(data);

    const params = {
      Bucket: BUCKET_NAME,
      Key: file_name,
      Body: pdfBuffer,
      ContentType: "application/pdf",
      ACL: "public-read",
    };

    const result = await s3.upload(params).promise();
    console.log("Upload success:", result);
    return result.Location;
  } catch (err) {
    console.error("Error uploading to S3:", err);
    throw err;
  }
}
async function sendMail(to, subj, content, url = false) {
  const Client = Sib.ApiClient.instance;
  const apiKey = Client.authentications["api-key"];
  apiKey.apiKey = process.env.BREVO_KEY;
  const transEmailApi = new Sib.TransactionalEmailsApi();

  const sendSmtpEmail = new Sib.SendSmtpEmail();

  sendSmtpEmail.sender = {
    email: "shazin.cans99@gmail.com",
    name: "UnityAid",
  };
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.subject = subj;
  if (url === false) {
    sendSmtpEmail.htmlContent = `
      <html>
        
        <body>
          <p>"${content}"</p>
  
        </body>
      </html>
    `;
  } else {
    sendSmtpEmail.htmlContent = `
      <html>
        
        <body>
          <p>the below is recept for your donation .Thank you:</p>
          <a href="${content}" class="button">Receipt</a>
         
        </body>
      </html>
    `;
  }

  const result = await transEmailApi.sendTransacEmail(sendSmtpEmail);
}
