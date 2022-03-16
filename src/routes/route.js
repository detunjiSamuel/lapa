const express = require("express");

const router = express.Router();
const store = require("../services/store/data");

const computeFee = require("../services/computeFee");
const setupFee = require("../services/setupFee");

router
  .post("/fees", (req, res, next) => {
    try {
      const { FeeConfigurationSpec } = req.body;
      setupFee(FeeConfigurationSpec);
      return res.status(200).json({ status: "ok" });
    } catch (e) {
      next(e);
    }
  })

  .post("/compute-transaction-fee", (req, res, next) => {
    try {
      const { CurrencyCountry, PaymentEntity, Currency, Amount, Customer } =
        req.body;

      const data = computeFee({
        CurrencyCountry,
        PaymentEntity,
        Currency,
        Amount,
        Customer,
      });
      return res.status(200).json(data);
    } catch (e) {
      next(e);
    }
  })

  .get("/seefees", (req, res, next) => {
    return res.status(200).json({
      fees: store.fees,
    });
  });

module.exports = router;
