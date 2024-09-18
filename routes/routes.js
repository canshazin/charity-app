const entry_controller = require("../controllers/entry.js");
const reset_password_controller = require("../controllers/reset_password.js");
const expense_controller = require("../controllers/expense.js");
const razorpayController = require("../controllers/razorpay.js");
const userController = require("../controllers/user.js");

const organizationController = require("../controllers/organization.js");
const adminController = require("../controllers/admin.js");
const misc_controller = require("../controllers/misc.js");
const middlewares = require("../middlewares/auth.js");

const express = require("express");
const router = express.Router();

//----------------------- Entry routes---------------

router.post("/user/signup", entry_controller.signup);
router.post("/user/login", entry_controller.login);
router.post("/org/signup", entry_controller.signupOrg);

//---------------------forgot password routes-------------
router.post(
  "/password/forgotpassword",
  reset_password_controller.forgot_password
);

router.get(
  "/password/resetpassword/:id",
  reset_password_controller.reset_password
);

router.post(
  "/password/resetpassword/updatepassword",
  reset_password_controller.update_password
);

//------------------------transaction routes---------------------
router.get(
  "/user/donate",
  middlewares.authenticate,
  razorpayController.donateController
);

router.post(
  "/user/updatetransactionstatus",
  middlewares.authenticate,
  razorpayController.updateTransaction
);
router.post(
  "/user/failedTransaction",
  middlewares.authenticate,
  razorpayController.failedTransaction
);

//-----------------------------user routes-------------------------

//profile
router.get(
  "/user/profile",
  middlewares.authenticate,
  userController.getUserProfile
);
router.put(
  "/user/edit-profile",
  middlewares.authenticate,
  userController.editUserProfile
);

//organization
router.get(
  "/user/organizations",
  middlewares.authenticate,
  userController.getApprovedOrganizations
);

//donation

router.get(
  "/user/get-all-donations",
  middlewares.authenticate,
  userController.getAllDonations
);
router.get(
  "/user/get-all-updates",
  middlewares.authenticate,
  userController.getAllUpdates
);

//-------------------------------organization routes--------------------

//profile
router.get(
  "/org/profile",
  middlewares.authenticate,
  organizationController.getOrgProfile
);
router.put(
  "/org/edit-profile",
  middlewares.authenticate,
  organizationController.editOrgProfile
);

//organizations

router.get(
  "/org/organizations",
  middlewares.authenticate,
  organizationController.getApprovedOrganizations
);

//donation sent

router.get(
  "/org/get-all-donations",
  middlewares.authenticate,
  organizationController.getAllDonations
);
router.get(
  "/org/get-all-updates",
  middlewares.authenticate,
  organizationController.getAllUpdates
);

//donation received
router.get(
  "/org/get-received-donations",
  middlewares.authenticate,
  organizationController.getReceivedDonations
);
router.post(
  "/org/send-update",
  middlewares.authenticate,
  organizationController.sendUpdate
);

//-------------------------------admin---------------------

//profile

router.get(
  "/admin/profile",
  middlewares.authenticate,
  adminController.getAdminProfile
);

router.put(
  "/admin/edit-profile",
  middlewares.authenticate,
  adminController.editAdminProfile
);

//all users

router.get(
  "/admin/get-all-users",
  middlewares.authenticate,
  adminController.getAllUsers
);
router.get(
  "/admin/block-user",
  middlewares.authenticate,
  adminController.blockUser
);
router.get(
  "/admin/unblock-user",
  middlewares.authenticate,
  adminController.unblockUser
);

//all organizations

router.get(
  "/admin/get-all-organizations",
  middlewares.authenticate,
  adminController.getAllOrganizations
);
router.get(
  "/admin/block-organization",
  middlewares.authenticate,
  adminController.blockOrganization
);
router.get(
  "/admin/unblock-organization",
  middlewares.authenticate,
  adminController.unblockOrganization
);

//all donations
router.get(
  "/admin/get-all-donations",
  middlewares.authenticate,
  adminController.adminGetAllDonations
);
router.get(
  "/admin/get-all-updates",
  middlewares.authenticate,
  adminController.getAllUpdates
);

//approvals
router.get(
  "/admin/get-non-approved-organizations",
  middlewares.authenticate,
  adminController.getNonApprovedOrganizations
);

router.get(
  "/admin/approve-organization",
  middlewares.authenticate,
  adminController.approveOrganization
);

router.get(
  "/admin/reject-organization",
  middlewares.authenticate,
  adminController.rejectOrganization
);

// home and invalid routes
router.get("/", misc_controller.HomePage);

router.use("/", misc_controller.pageNotFound);

module.exports = router;
