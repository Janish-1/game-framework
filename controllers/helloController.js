// controllers/helloController.js
const { getHelloMessage } = require('../services/helloService');

const getHello = (req, res) => {
  const message = getHelloMessage();
  res.json({ message });
};

module.exports = {
  getHello,
};
