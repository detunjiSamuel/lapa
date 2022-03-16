const handleError = (err, req, res, next) => {
  if (err.status == undefined)
    return res.status(500).json({
      Error: "Something went wrong from our end",
    });
  return res.status(err.status).json({
    Error: err.message,
  });
};

module.exports = handleError;
