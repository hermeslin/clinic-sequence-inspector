const config = require('../config/index');

module.exports = (req, res, next) => {
  const { token } = req.body;

  if (token !== config.slack.verifycationToken) {
    res.status(403).send({ message: 'Forbidden' });
    return;
  }

  next();
};
