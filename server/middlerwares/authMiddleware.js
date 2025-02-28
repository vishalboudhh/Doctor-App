// server/middlerwares/authMiddleware.js
const JWT = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    // Expect header to be "Bearer <token>"
    const token = req.headers['authorization'].split(" ")[1];
    JWT.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        return res.status(200).send({
          message: 'Auth failed',
          success: false,
        });
      } else {
        // Attach the decoded user ID to the request body
        req.body.userId = decode.id;
        next();
      }
    });
  } catch (error) {
    console.log(error);
    res.status(401).send({
      message: 'Auth failed',
      success: false,
    });
  }
};
