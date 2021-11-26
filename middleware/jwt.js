const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    const token = req.header("Authorization") || req.query.token;
    if (!token)
      return res
        .status(401)
        .json("Access denied");
    const verified = jwt.verify(token, "dyte");

    if (!Object.keys(verified).length || (verified && verified.source))
      return res
        .status(401)
        .json("Access denied");
    req.user = { id: verified.user_id };
    next();
  } catch (err) {
    console.log(err);
    return res
      .status(401)
      .json("Access denied");
  }
};
