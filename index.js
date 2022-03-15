// {
//     "FeeConfigurationSpec": "LNPY1221 NGN * *(*) : APPLY PERC 1.4\nLNPY1222 NGN INTL CREDIT-CARD(VISA) : APPLY PERC 5.0\nLNPY1223 NGN LOCL CREDIT-CARD(*) : APPLY FLAT_PERC 50:1.4\nLNPY1224 NGN * BANK-ACCOUNT(*) : APPLY FLAT 100\nLNPY1225 NGN * USSD(MTN) : APPLY PERC 0.55"
// }

// LNPY1221 NGN LOCL CREDIT-CARD(*) : APPLY PERC 1.4
// LNPY1222 NGN INTL CREDIT-CARD(MASTERCARD) : APPLY PERC 3.8
// LNPY1223 NGN INTL CREDIT-CARD(*) : APPLY PERC 5.8
// LNPY1224 NGN LOCL USSD(MTN) : APPLY FLAT_PERC 20:0.5
// LNPY1225 NGN LOCL USSD(*) : APPLY FLAT_PERC 20:0.5

// {FEE-ID} {FEE-CURRENCY} {FEE-LOCALE} {FEE-ENTITY}({ENTITY-PROPERTY}) : APPLY {FEE-TYPE} {FEE-VALUE}
// {
//     NGN :{
//         {
//             LOCL:{
//                 CREDIT-CARD : []
//                 USSd,
//                 walllet-id,
//                 debit-card
//             }
//             INTL,
//             *
//         }
//     }
// }

const express = require("express");
const app = express();

app.use(express.json());

// let holder = [{}, {}, {}];

// let

// const { performance } = require('perf_hooks');

// var startTime
// var endTime

const processing = require("./process");

let test = false;

app.use("*", (req, res) => {
  const { FeeConfigurationSpec, CurrencyCountry, PaymentEntity } = req.body;
  if (!test) {
    const feeSpecs = FeeConfigurationSpec.split("\n");
    for (let i of feeSpecs) {
        processing.parseFCS_tree(i);
    }
    test = true
    return res.status(200).json({ status: "ok" });
  }
  console.log("here")
  let locale;
  if (CurrencyCountry == PaymentEntity.Country) locale = "LOCL";
  else locale = "INTL";
  const matches =  computeFee(locale , PaymentEntity.Type )
  return res.status(200).json(
      {
          matches
      }
  )
  //   return res.json({
  //     ...processor.holder,
  //   });
});

// app.listen(3000, () => {
//   console.log(" app running");
// });

function computeFee(locale = "LOCL", feeEntity = "CREDIT-CARD", properties) {
  const val = processing.holder;
  //  cc cw wc ww
  points = [0, 0, 0, 0];
  matches = [];
  matchFound = false;
  // correct locale
  if (Object.keys(val[locale]).length > 0) {
    // correct feeEntity

    if (Object.keys(val[locale][feeEntity]).length > 0) {
      // 1  +  2
      points[0] = 3;
      matches[0] = val[locale][feeEntity];
      console.log("Cc");
    }
    if (Object.keys(val[locale]["wildcard"]).length > 0) {
      // 1  +  0
      points[1] = 1;
      matches[1] = val[locale]["wildcard"];
      console.log("C2");
    }
  }
  if (Object.keys(val["wildcard"]).length > 0) {
    if (Object.keys(val["wildcard"][feeEntity]).length > 0) {
      // 0  +  2
      points[2] = 2;
      matches[2] = val["wildcard"][feeEntity];
      console.log("2c");
    }
    if (Object.keys(val["wildcard"]["wildcard"]).length > 0) {
      // 0  +  0
      points[3] = 0;
      matches[3] = val["wildcard"]["wildcard"];
      console.log("22");
    }

    return matches;
  }

  //   console.log(matches.length)
}

//computeFee()

// console.log(parseFCS_tree("LNPY1221 NGN LOCL CREDIT-CARD(*) : APPLY PERC 1.4"));
// console.log(
//   parseFCS_tree("LNPY1222 NGN INTL CREDIT-CARD(VISA) : APPLY PERC 5.0")
// );
// console.log(
//   parseFCS_tree("LNPY1223 NGN LOCL CREDIT-CARD(*) : APPLY FLAT_PERC 50:1.4")
// );
// console.log(parseFCS_tree("LNPY1224 NGN * BANK-ACCOUNT(*) : APPLY FLAT 100"));

// console.log(`Call to doSomething took ${endTime - startTime} milliseconds`)
// console.log(holder);
