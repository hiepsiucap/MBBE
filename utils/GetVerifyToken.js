/** @format */

const crypto = require("crypto");

function getRandomIntegers(count, min = 0, max = 10) {
  const randomIntegers = [];
  for (let i = 0; i < count; i++) {
    const randomBuffer = crypto.randomBytes(4);
    const randomValue = (randomBuffer.readUInt32BE() % (max - min + 1)) + min;
    randomIntegers.push(randomValue);
  }

  return randomIntegers.join("");
}
module.exports = { getRandomIntegers };
