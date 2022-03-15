let holder = {
  LOCL: {},
  INTL: {},
  wildcard: {},
};

let supportedLocale = {
  LOCL: {},
  INTL: {},
  wildcard: {},
};

let supportedFeeEntity = {
"CREDIT-CARD": {},
"DEBIT-CARD": {},
"BANK-ACCOUNT": {},
USSD: {},
"WALLET-ID": {},
wildcard: {},
};

function cleanData(specs) {
  const cleaned = {};
  for (let spec in specs) {
    if (specs[spec][0] == "*") {
      cleaned[spec] = "wildcard";
      continue;
    }
    cleaned[spec] = specs[spec];
  }
  return cleaned;
}

// {FEE-ID} {FEE-CURRENCY} {FEE-LOCALE} {FEE-ENTITY}({ENTITY-PROPERTY}) : APPLY {FEE-TYPE} {FEE-VALUE}

function add(locale, feeEntity, property, feeId) {
  let localeHandler;
  let entityHandler;
  localeHandler = holder[locale];

  if (localeHandler[feeEntity] == undefined)
    entityHandler = Object.assign(holder[locale], supportedFeeEntity);
  else entityHandler = localeHandler[feeEntity];

 // used internationally because js ues refernce if you assigned using a 
  holder[locale][feeEntity] = {
    feeId,
    property,
  };
// holder[locale][feeEntity].push(2)


// console.log(holder[locale][feeEntity] , feeId ,feeEntity)
  return;
}

const parseFCS_tree = (spec) => {
  // startTime = performance.now()
  let specConponents = spec.split(" ");
  // return specConponents
  let feeId = specConponents[0];
  let locale = specConponents[2];
  let feeEntity = specConponents[3];
  let fee = [specConponents[6], specConponents[7]];

  // local  , fee entity , property
  let entity = feeEntity.split("(");

  const specs = cleanData({
    locale,
    feeEntity: entity[0],
    property: entity[1],
  });

  if (!supportedLocale[specs.locale] || !supportedFeeEntity[specs.feeEntity])
    throw new Error("failure");

  add(specs.locale, specs.feeEntity, specs.property, feeId);
  // endTime = performance.now()
  return true;
};

module.exports = { parseFCS_tree, holder };

