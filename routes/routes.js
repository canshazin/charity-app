const entry_controller = require("../controllers/entry.js");
const reset_password_controller = require("../controllers/reset_password.js");
const expense_controller = require("../controllers/expense.js");
const paypal_controller = require("../controllers/paypal.js");
const premium_controller = require("../controllers/premium.js");
const misc_controller = require("../controllers/misc.js");
const middlewares = require("../middlewares/auth.js");

const express = require("express");
const router = express.Router();

// Entry routes
router.post("/user/signup", entry_controller.signup);
router.post("/org/signup", entry_controller.signupOrg);
router.post("/user/login", entry_controller.login);

router.get(
  "/user/profile",
  middlewares.authenticate,
  expense_controller.getUserProfile
);

router.get(
  "/admin/profile",
  middlewares.authenticate,
  expense_controller.getAdminProfile
);
router.get(
  "/user/organizations",
  middlewares.authenticate,
  expense_controller.getApprovedOrganizations
);
router.get(
  "/admin/get-all-organizations",
  middlewares.authenticate,
  expense_controller.getAllOrganizations
);
router.get(
  "/admin/get-non-approved-organizations",
  middlewares.authenticate,
  expense_controller.getNonApprovedOrganizations
);
router.get(
  "/admin/get-all-users",
  middlewares.authenticate,
  expense_controller.getAllUsers
);
router.get(
  "/admin/block-user",
  middlewares.authenticate,
  expense_controller.blockUser
);
router.get(
  "/admin/unblock-user",
  middlewares.authenticate,
  expense_controller.unblockUser
);

router.get(
  "/admin/block-organization",
  middlewares.authenticate,
  expense_controller.blockOrganization
);
router.get(
  "/admin/unblock-organization",
  middlewares.authenticate,
  expense_controller.unblockOrganization
);

router.get(
  "/admin/approve-organization",
  middlewares.authenticate,
  expense_controller.approveOrganization
);
router.get(
  "/admin/reject-organization",
  middlewares.authenticate,
  expense_controller.rejectOrganization
);

router.put(
  "/user/edit-profile",
  middlewares.authenticate,
  expense_controller.editUserProfile
);
router.put(
  "/admin/edit-profile",
  middlewares.authenticate,
  expense_controller.editAdminProfile
);
router.put(
  "/org/edit-profile",
  middlewares.authenticate,
  expense_controller.editOrgProfile
);

router.get(
  "/user/donate",
  middlewares.authenticate,
  expense_controller.donateController
);

router.post(
  "/user/updatetransactionstatus",
  middlewares.authenticate,
  expense_controller.updateTransaction
);
router.post(
  "/user/failedTransaction",
  middlewares.authenticate,
  expense_controller.failedTransaction
);
router.get(
  "/user/get-all-donations",
  middlewares.authenticate,
  expense_controller.getAllDonations
);
router.get(
  "/admin/get-all-donations",
  middlewares.authenticate,
  expense_controller.adminGetAllDonations
);
router.get(
  "/user/get-received-donations",
  middlewares.authenticate,
  expense_controller.getReceivedDonations
);
router.get(
  "/user/get-all-updates",
  middlewares.authenticate,
  expense_controller.getAllUpdates
);
router.post(
  "/user/send-update",
  middlewares.authenticate,
  expense_controller.sendUpdate
);

router.get(
  "/org/profile",
  middlewares.authenticate,
  expense_controller.getOrgProfile
);

// password reset routes
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

// home and invalid routes
router.get("/", misc_controller.HomePage);

router.use("/", misc_controller.pageNotFound);

module.exports = router;
