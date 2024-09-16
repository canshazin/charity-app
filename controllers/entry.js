const User = require("../models/user.js");
const Organization = require("../models/organization.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

function generateAccessToken(id) {
  return jwt.sign({ user_id: id }, process.env.JWT_SECRET_KEY);
}

exports.signup = async (req, res, next) => {
  try {
    const user = req.body;
    const exist_email = await User.findAll({ where: { email: user.email } });
    if (exist_email.length > 0) {
      res.json({ success: false, msg: "email already taken" });
    } else {
      bcrypt.hash(user.password, 10, async (err, hash) => {
        console.log(err);
        await User.create({
          uname: user.uname,
          email: user.email,
          password: hash,
          isBlocked: false,
          role: "user",
        });
        res.json({ success: true, msg: "Signed successfully" });
      });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.signupOrg = async (req, res, next) => {
  try {
    const user = req.body;
    const exist_email = await User.findAll({ where: { email: user.email } });
    if (exist_email.length > 0) {
      res.json({ success: false, msg: "email already taken" });
    } else {
      bcrypt.hash(user.password, 10, async (err, hash) => {
        console.log(err);
        const user_created = await User.create({
          uname: user.uname,
          email: user.email,
          password: hash,
          isBlocked: false,
          role: "org",
        });
        await Organization.create({
          oname: user.uname,
          description: user.description,
          location: user.location,
          mission: user.mission,
          contactEmail: user.email,
          isApproved: false,
          amount: 0,
          userId: user_created.id,
        });
        res.json({ success: true, msg: "registration request sent" });
      });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const user = req.body;
    const response = { success: true, message: "" };
    const exist_email = await User.findOne({ where: { email: user.email } });
    if (!exist_email) {
      response.success = false;
      response.message = "E-mail doesnt exist";
      return res.status(404).json(response);
    } else {
      if (exist_email.isBlocked === true) {
        response.success = false;
        response.message = "your account is blocked.Contact Us for more info";
        return res.json(response);
      }
      if (exist_email.role === "org") {
        const exist_org = await Organization.findOne({
          where: { userId: exist_email.id },
        });
        if (exist_org.isApproved === false) {
          response.success = false;
          response.message = "your organization is being verified";
          return res.json(response);
        }
      }

      bcrypt.compare(user.password, exist_email.password, (err, result) => {
        if (err) {
          throw new Error("smthing went wrong");
        }
        if (result === true) {
          response.success = true;
          response.message = "Logged in successfully";
          response.role = exist_email.role;
          response.token = generateAccessToken(exist_email.id);
          res.json(response);
        } else if (result === false) {
          response.success = false;
          response.message = "User not authorized";
          res.status(401).json(response);
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
};
