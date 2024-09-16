const User = require("../models/user.js");
const Organization = require("../models/organization.js");
const Donation = require("../models/donation.js");
const Update = require("../models/update.js");
const Expense = require("../models/organization.js");
const sequelize = require("../util/database.js");
const Razorpay = require("razorpay");
const AWS = require("aws-sdk");
const PDFDocument = require("pdfkit");

exports.donateController = async (req, res) => {
  try {
    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET_KEY,
    });

    const amount = parseInt(req.query.amount) * 100;

    const order = await rzp.orders.create({ amount, currency: "INR" });
    console.log("hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii", req.query);

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

exports.getUserProfile = async (req, res) => {
  try {
    res.json({ uname: req.user.uname, email: req.user.email });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};
exports.editUserProfile = async (req, res) => {
  try {
    const response = { Success: false, msg: "" };
    await User.update(
      { uname: req.body.uname },
      { where: { id: req.user.id } }
    );

    const exist_email = await User.findAll({
      where: { email: req.body.email },
    });
    if (exist_email.length > 0) {
      response.success = false;
      response.msg = "email already taken";
    } else {
      await User.update(
        { email: req.body.email },
        { where: { id: req.user.id } }
      );
      response.success = "true";
      response.msg = "Updated successfully";
    }
    res.json(response);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.getApprovedOrganizations = async (req, res) => {
  try {
    const orgs = await Organization.findAll({ where: { isApproved: true } });
    console.log("ddddddddddddddddddddddddddddddd", orgs);
    res.json(orgs);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.getAllUpdates = async (req, res) => {
  try {
    const donationId = req.query.did;
    const allUpdates = await Update.findAll({
      where: { donationId: donationId },
    });
    res.json(allUpdates);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};
exports.getAllDonations = async (req, res) => {
  try {
    const allDonations = await Donation.findAll({
      attributes: ["createdAt", "id", "url", "amount", "status", "paymentId"],
      include: [
        {
          model: User,
          attributes: ["uname", "email"],
        },
        {
          model: Organization,
          attributes: ["oname", "contactEmail"],
        },
      ],
      where: { userId: req.user.id },
    });

    res.json(allDonations);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.add_expense = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    let msg = "";
    const expense = req.body;

    const expense_added = await Expense.create(
      {
        date: expense.date,
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
        userId: req.user.id,
      },
      { transaction: t }
    );

    const new_total_expense =
      Number(expense.amount) + Number(req.user.total_expense);
    await User.update(
      { total_expense: new_total_expense },
      {
        where: { id: req.user.id },
        transaction: t,
      }
    );
    await t.commit();
    msg = "expense added succefully";
    const id = expense_added.id;

    const response = { msg, id };
    res.json(response);
  } catch (err) {
    await t.rollback();

    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while adding the expense" });
  }
};

exports.get_expenses = async (req, res) => {
  try {
    const items_per_page = parseInt(req.query.items_per_page, 10) || 5;
    const page = parseInt(req.query.page, 10) || 1;
    let prime = req.user.isPrime || false;
    const { count, rows: expenses } = await Expense.findAndCountAll({
      where: { userId: req.user.id },
      offset: (page - 1) * items_per_page,
      limit: items_per_page,
    });
    res.json({
      expenses,
      prime,
      current_page: page,
      has_next_page: items_per_page * page < count,
      next_page: items_per_page * page < count ? page + 1 : null,
      has_previous_page: page > 1,
      previous_page: page > 1 ? page - 1 : null,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.delete_expense = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const id = req.params.id;
    const expense_to_delete = await Expense.findOne(
      {
        where: { id: id, userId: req.user.id },
      },
      { transaction: t }
    );

    const expense = await Expense.destroy(
      {
        where: { id: id, userId: req.user.id },
      },
      { transaction: t }
    );
    const new_total_expense =
      Number(req.user.total_expense) - Number(expense_to_delete.amount);
    await User.update(
      { total_expense: new_total_expense },
      {
        where: { id: req.user.id },
      },
      { transaction: t }
    );
    await t.commit();
    res.json({ success: true });
  } catch (err) {
    await t.rollback();
    console.log(err);
  }
};
