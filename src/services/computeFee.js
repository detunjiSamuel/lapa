const httpError = require("../utils/error");
const data = require("./store/data");

const store = data.store;
const feeStore = data.fees;

const acceptedCurrency = "NGN";

const computeFee = ({
  CurrencyCountry,
  PaymentEntity,
  Currency,
  Amount,
  Customer,
}) => {
  let locale;
  let ChargeAmount = Amount;
  // check if currecy "NGN"(only accepted for this assessment)
  if (Currency != acceptedCurrency)
    throw new httpError(
      400,
      `No fee configuration for ${Currency} transactions.`
    );
  // Set transaction locale
  if (CurrencyCountry == PaymentEntity.Country) locale = "LOCL";
  else locale = "INTL";

  // Get all fees that match transation
  const matches = getFeeMatch(locale, PaymentEntity.Type);
  if (!matches)
    throw new httpError(
      404,
      "fee configuration for this transactions cannot be found"
    );

  // select fee id that match the best
  const bestMatch = getBestMatch(matches, PaymentEntity);
  const AppliedFeeValue = calculateFee(bestMatch, Amount);
  //check who bears the fees
  if (Customer.BearsFee) ChargeAmount += AppliedFeeValue;

  return {
    AppliedFeeID: bestMatch,
    AppliedFeeValue,
    ChargeAmount,
    SettlementAmount: ChargeAmount - AppliedFeeValue,
  };
};

const getBestMatch = (matches, specificFeeEntities) => {
  //loop through non empty elemets
  for (let i = 0; i < matches.length; i++) {
    if (matches[i]) {
      // compare matches to specific fee entities of transation
      for (let specific in specificFeeEntities) {
        value = specificFeeEntities[specific];
        if (matches[i][value] != undefined) {
          return matches[i][value];
        }
      }
      // check if wildcard exists
      if (matches[i]["wildcard"] != undefined) return matches[i]["wildcard"];
    }
  }
  return false;
};

const getFeeMatch = (locale, feeEntity, properties) => {
  // Data structure will only return a maximum of 2 matches
  // only 2! mathes possible
  //  cc cw wc ww
  matches = [];

  // check if anything is within object that matches i.e is empty

  if (Object.keys(store[locale]).length > 0) {
    if (Object.keys(store[locale][feeEntity]).length > 0) {
      // correct correct
      matches[0] = store[locale][feeEntity];
    }
    if (Object.keys(store[locale]["wildcard"]).length > 0) {
      // correct wildcard
      matches[1] = store[locale]["wildcard"];
    }
  }
  if (Object.keys(store["wildcard"]).length > 0) {
    if (Object.keys(store["wildcard"][feeEntity]).length > 0) {
      // wildcard correct
      matches[2] = store["wildcard"][feeEntity];
    }
    if (Object.keys(store["wildcard"]["wildcard"]).length > 0) {
      // wildcard wildcard
      matches[3] = store["wildcard"]["wildcard"];
    }
    // check if mache exists
    if (matches.length == 0) return false;

    return matches;
  }
};

const calculateFee = (AppliedFeeID, amount) => {
  feeRule = feeStore[AppliedFeeID];
  feeValue = feeRule[1];
  switch (feeRule[0]) {
    case "FLAT_PERC":
      let feeValues = feeValue.split(":");
      let flatfeeVal = feeValues[0];
      let feeValPercent = feeValues[1];
      return parseFloat(flatfeeVal) + (feeValPercent * amount) / 100;
      break;
    case "PERC":
      return parseFloat((feeValue * amount) / 100);
      break;
    case "FLAT":
      return parseFloat(feeValue);
      break;
    default:
      throw new httpError(400, "invalid fee charge rule");
  }
};

module.exports = computeFee;
