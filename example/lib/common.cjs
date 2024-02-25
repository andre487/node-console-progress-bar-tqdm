const colors = require('colors');

exports.logTitle = function logTitle(title) {
    console.log(colors.bold(colors.cyan(`==> ${title}`)));
};
