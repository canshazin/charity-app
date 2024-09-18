const User = require("../models/user.js");
const Organization = require("../models/organization.js");
const Donation = require("../models/donation.js");
const Update = require("../models/update.js");

const Razorpay = require("razorpay");
const AWS = require("aws-sdk");
const PDFDocument = require("pdfkit");
const Sib = require("sib-api-v3-sdk");

//-----------------------------------profile-------------------------------

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

//------------------------------organization-------------------------

exports.getApprovedOrganizations = async (req, res) => {
  try {
    const orgs = await Organization.findAll({ where: { isApproved: true } });

    res.json(orgs);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

//-----------------------------donation history---------------------------------

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
