const User = require("../models/user.js");
const Organization = require("../models/organization.js");
const Donation = require("../models/donation.js");
const Update = require("../models/update.js");

const Razorpay = require("razorpay");
const AWS = require("aws-sdk");
const PDFDocument = require("pdfkit");
const Sib = require("sib-api-v3-sdk");

//------------------------------profile----------------------

exports.getOrgProfile = async (req, res) => {
  try {
    const org = await Organization.findOne({ where: { userId: req.user.id } });

    res.json({
      oname: req.user.uname,
      contactEmail: req.user.email,
      mission: org.mission,
      description: org.description,
      goal: org.goal,
      location: org.location,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.editOrgProfile = async (req, res) => {
  try {
    const response = { Success: false, msg: "" };
    await User.update(
      { uname: req.body.oname },
      { where: { id: req.user.id } }
    );
    await Organization.update(
      {
        oname: req.body.oname,
        mission: req.body.mission,
        location: req.body.location,
        description: req.body.description,
        goal: req.body.goal,
      },
      { where: { userId: req.user.id } }
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
      await Organization.update(
        { contactEmail: req.body.email },
        { where: { userId: req.user.id } }
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

//-----------------------------------organizations------------------------
exports.getApprovedOrganizations = async (req, res) => {
  try {
    const orgs = await Organization.findAll({ where: { isApproved: true } });

    res.json(orgs);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

//---------------------------donation sent-----------------
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

//------------------------donations received---------------------
//getupdates from above also used here
exports.getReceivedDonations = async (req, res) => {
  try {
    const myOrg = await Organization.findOne({
      where: { userId: req.user.id },
    });
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
      where: { organizationId: myOrg.id, status: "SUCCESSFUL" },
    });

    res.json(allDonations);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.sendUpdate = async (req, res) => {
  try {
    await Update.create({ msg: req.body.msg, donationId: req.body.did });
    const donation = await Donation.findOne({ where: { id: req.body.did } });
    const user = await User.findOne({ where: { id: donation.userId } });
    const org = await Organization.findOne({
      where: { id: donation.organizationId },
    });
    sendMail(
      user.email,
      "update alert",
      `You have an update from ${
        org.oname
      } regarding donation done on ${new Date(
        donation.createdAt
      ).toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      })} of Rs${donation.amount}`
    );

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

//extra functions
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
