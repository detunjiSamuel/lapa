const httpError = require("../utils/error");
const data = require("./store/data");


const store = data.store;
const feeStore = data.fees;

const supportedLocale = {
  LOCL: {},
  INTL: {},
  wildcard: {},
};

const supportedFeeEntity = {
  "CREDIT-CARD": {},
  "DEBIT-CARD": {},
  "BANK-ACCOUNT": {},
  USSD: {},
  "WALLET-ID": {},
  wildcard: {},
};

const setupFee = (FeeConfigurationSpec) => {
  const feeSpecs = FeeConfigurationSpec.split("\n");
  // parse individual FCS
  for (let i of feeSpecs) {
    parseFCS(i);
  }
};

const parseFCS = (spec) => {
  let specConponents = spec.split(" ");
  let feeId = specConponents[0];
  let locale = specConponents[2];
  let feeEntity = specConponents[3];
  let fee = [specConponents[6], specConponents[7]];

  // local  , fee entity , property
  let entity = feeEntity.split("(");

  // replace all "*" with "wildcard"
  const specs = cleanData({
    locale,
    feeEntity: entity[0],
    property: entity[1].slice(0, -1),
  });
  feeStore[feeId] = fee;

  // check if invalid specification for passed
  if (!supportedLocale[specs.locale] || !supportedFeeEntity[specs.feeEntity])
    throw new httpError(400, "Invalid specifications received");

  // add spec to data store
  addToStore(specs.locale, specs.feeEntity, specs.property, feeId);
  return;
};

const cleanData = (specs) => {
  const cleaned = {};
  for (let spec in specs) {
    if (specs[spec][0] == "*") {
      cleaned[spec] = "wildcard";
      continue;
    }
    cleaned[spec] = specs[spec];
  }
  return cleaned;
};

// {FEE-ID} {FEE-CURRENCY} {FEE-LOCALE} {FEE-ENTITY}({ENTITY-PROPERTY}) : APPLY {FEE-TYPE} {FEE-VALUE}
const addToStore = (locale, feeEntity, property, feeId) => {
  const mapPropToFee = {};
  let localeHandler;
  localeHandler = store[locale];

  //  add copy of supported entity to locale if it does not exists
  if (localeHandler[feeEntity] == undefined)
    Object.assign(store[locale], supportedFeeEntity);

  mapPropToFee[property] = feeId;

  // add property & Fee to existing values that match
  store[locale][feeEntity] = {
    ...store[locale][feeEntity],
    ...mapPropToFee,
  };

  return;
};

module.exports = setupFee;
