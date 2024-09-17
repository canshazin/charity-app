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
  "/user/organizations",
  middlewares.authenticate,
  expense_controller.getApprovedOrganizations
);

router.put(
  "/user/edit-profile",
  middlewares.authenticate,
  expense_controller.editUserProfile
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

// get-add-delete routes
router.get(
  "/expense/getexpenses",
  middlewares.authenticate,
  expense_controller.get_expenses
);

router.post(
  "/expense/addexpense",
  middlewares.authenticate,
  expense_controller.add_expense
);

router.get(
  "/expense/deleteexpense/:id",
  middlewares.authenticate,
  expense_controller.delete_expense
);

// Paypal routes
router.get(
  "/purchase/premium-membership",
  middlewares.authenticate,
  paypal_controller.purchase_premium
);

router.post(
  "/purchase/premium-membership/update",
  middlewares.authenticate,
  paypal_controller.update
);

// Premium routes
router.get(
  "/premium/leaderboard",
  middlewares.authenticate,
  premium_controller.leaderboard
);

router.get(
  "/premium/report/view/:date",
  middlewares.authenticate,
  premium_controller.view_report
);

router.get(
  "/premium/download",
  middlewares.authenticate,
  premium_controller.download_expenses
);

router.post(
  "/premium/download/history/save",
  middlewares.authenticate,
  premium_controller.download_history_save
);

router.get(
  "/premium/download/history/get",
  middlewares.authenticate,
  premium_controller.download_history_get
);

// home and invalid routes
router.get("/", misc_controller.HomePage);

router.use("/", misc_controller.pageNotFound);

module.exports = router;
