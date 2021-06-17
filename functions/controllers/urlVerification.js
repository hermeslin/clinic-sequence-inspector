/**
 *
 * @param {*} req
 * @param {*} res
 */
module.exports = (req, res) => {
  const { challenge } = req.body;
  res.status(200).send({ challenge });
};
