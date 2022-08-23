var library = require('../package.json');

var fs = require('fs');

let version = `module.exports = { raw: '${library.version}' };`;

// write to a new file named 2pac.txt
fs.writeFile('../src/version.js', version, err => {
  // throws an error, you could also catch it here
  if (err) throw err;

  // success case, the file was saved
  console.log('version saved!');
});
