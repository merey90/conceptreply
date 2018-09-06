const moment = require('moment');

const parseTimestampPG = (jstime) => {
  const result = moment(jstime).format();
  return result.replace('T', ' ').substring(0, result.length - 3);
};

module.exports = parseTimestampPG;