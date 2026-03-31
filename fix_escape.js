const fs = require('fs');
let c = fs.readFileSync('c:/Users/Admin/Downloads/Earnify/public/admin/app.js', 'utf8');

const start = c.indexOf('res-title') - 5;  // back to class=
const end   = c.indexOf("+ '</td><td><strong>", start);

const oldSeg = c.substring(start, end);
console.log('OLD:', JSON.stringify(oldSeg));

// Correct replacement: plain double quotes inside the JS string (which is single-quoted)
const newSeg = `'<td><div class="res-title">' + r.title + '</div><div class="res-desc">' + r.description + '</div>'`;

console.log('NEW:', JSON.stringify(newSeg));

c = c.substring(0, start) + newSeg + ' ' + c.substring(end);
fs.writeFileSync('c:/Users/Admin/Downloads/Earnify/public/admin/app.js', c);
console.log('done');
