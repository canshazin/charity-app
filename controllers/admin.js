const User = require("../models/user.js");
const Organization = require("../models/organization.js");
const Donation = require("../models/donation.js");
const Update = require("../models/update.js");
const Sib = require("sib-api-v3-sdk");

//---------------------profile----------------------------

exports.getAdminProfile = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json({ uname: req.user.uname, email: req.user.email });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.editAdminProfile = async (req, res) => {
  try {
    if (req.user.role != "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
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

//------------------------------all users---------------------------

exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const users = await User.findAll({ where: { role: "user" } });
    res.json(users);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.blockUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const result = await User.update(
      { isBlocked: true },
      { where: { id: req.query.id } }
    );
    res.json({ msg: "success" });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.unblockUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const result = await User.update(
      { isBlocked: false },
      { where: { id: req.query.id } }
    );
    res.json({ msg: "success" });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

//------------------------------all organizations--------------------
exports.getAllOrganizations = async (req, res) => {
  try {
    const orgs = await Organization.findAll({
      include: [
        {
          model: User,
          attributes: ["isBlocked"],
        },
      ],
    });

    res.json(orgs);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};
exports.blockOrganization = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const org = await Organization.findOne({ where: { id: req.query.id } });
    const result = await User.update(
      { isBlocked: true },
      { where: { id: org.userId } }
    );
    await Organization.update(
      { isApproved: false },
      { where: { id: req.query.id } }
    );
    res.json({ msg: "success" });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};
exports.unblockOrganization = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const org = await Organization.findOne({ where: { id: req.query.id } });
    const result = await User.update(
      { isBlocked: false },
      { where: { id: org.userId } }
    );
    await Organization.update(
      { isApproved: true },
      { where: { id: req.query.id } }
    );
    res.json({ msg: "success" });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

//--------------------------all donations-----------------------

exports.adminGetAllDonations = async (req, res) => {
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

//---------------------approvals-----------

exports.getNonApprovedOrganizations = async (req, res) => {
  try {
    const orgs = await Organization.findAll({
      where: { isApproved: false },
      include: [
        {
          model: User,
          where: { isBlocked: false },
          attributes: [],
        },
      ],
    });

    res.json(orgs);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.approveOrganization = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const org = await Organization.findOne({ where: { id: req.query.id } });
    const result = await User.update(
      { isBlocked: false },
      { where: { id: org.userId } }
    );
    await Organization.update(
      { isApproved: true },
      { where: { id: req.query.id } }
    );
    sendMail(
      org.contactEmail,
      "Approved",
      "Your request to register to UnityAid has been approved.Contact us for any queries..."
    );
    res.json({ msg: "success" });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};
exports.rejectOrganization = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const org = await Organization.findOne({ where: { id: req.query.id } });
    const result = await User.update(
      { isBlocked: true },
      { where: { id: org.userId } }
    );
    await Organization.update(
      { isApproved: false },
      { where: { id: req.query.id } }
    );
    sendMail(
      org.contactEmail,
      "Rejected",
      "Your request to register to UnityAid has been rejected.Contact us for any queries..."
    );
    res.json({ msg: "success" });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

//-------------extra functions----------------
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
