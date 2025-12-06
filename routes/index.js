/*
Copyright 2020 Square Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const express = require("express");
const managementRoute = require("./management");
const invoiceRoute = require("./invoice");
const estimateRoute = require("./estimate");
const subscriptionRoute = require("./subscription");
const customerRoute = require("./customer");
const uploadRoute = require("./uploads");
const adminRoute = require("./admin");
const analyticsRoute = require("./analytics");
const { customersApi, locationsApi } = require("../util/square-client");

const router = express.Router();

/**
 * Matches: /management and /invoice respectively.
 *
 * Description:
 *  If the rquest url matches one of the router.use calls, then the routes used are in the
 *  required file.
 */
router.use("/management", managementRoute);
router.use("/invoice", invoiceRoute);
router.use("/estimate", estimateRoute);
router.use("/subscription", subscriptionRoute);
router.use("/customers", customerRoute);
router.use("/uploads", uploadRoute);
router.use("/admin", adminRoute);
router.use("/analytics", analyticsRoute);

/**
 * Matches: GET /
 *
 * Description:
 *  Retrieves list of customers then render the homepage with a list of the customers that has an email.
 */
router.get("/", async (req, res, next) => {
  try {
    // Retrieve the main location which is the very first location merchant has
    const {
      result: { location },
    } = await locationsApi.retrieveLocation("main");
    // Retrieves customers for this current merchant
    let {
      result: { customers },
    } = await customersApi.listCustomers();
    customers = customers || [];
    const customersWithEmail = customers.filter(
      (customer) => customer.emailAddress,
    );
    const displayCustomers =
      customersWithEmail.length > 0 ? customersWithEmail : customers;

    // Render the customer list homepage
    const squareEnv = (process.env.SQUARE_ENVIRONMENT || process.env.NODE_ENV || "sandbox").toLowerCase();
    const envStatus = squareEnv === "production" ? { label: "Live", tone: "live" } : { label: "Testing", tone: "testing" };

    res.render("index", {
      customers: displayCustomers,
      locationId: location.id, // use the main location as the default
      envStatus,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
