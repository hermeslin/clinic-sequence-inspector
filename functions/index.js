const glob = require('glob');

const endpoints = glob.sync('./endpoints/*.js', { cwd: __dirname });
const schedules = glob.sync('./schedules/**/*.js', { cwd: __dirname });

[].concat(endpoints, schedules).forEach((file) => {
  const functionName = file.split('/').pop().slice(0, -3); // Strip off '.js'
  if (
    !process.env.FUNCTION_NAME ||
    process.env.FUNCTION_NAME === functionName
  ) {
    exports[functionName] = require(file);
  }
});
