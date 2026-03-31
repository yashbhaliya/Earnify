const fs = require('fs');
let c = fs.readFileSync('c:/Users/Admin/Downloads/Earnify/public/admin/app.js', 'utf8');

// Find the exact segment to replace
const marker = "r.type + '</span></td><td>' + r.title + '</td><td class=";
const start = c.indexOf(marker) + marker.length - "'</span></td><td>' + r.title + '</td><td class=".length;

// Find end of the description cell
const descEnd = c.indexOf("+ '</td><td><strong>", start);

const oldSeg = c.substring(start, descEnd);
console.log('OLD:', JSON.stringify(oldSeg));

const newSeg = `'</span></td><td><div class=\\"res-title\\">' + r.title + '</div><div class=\\"res-desc\\">' + r.description + '</div>`;
console.log('NEW:', JSON.stringify(newSeg));

c = c.substring(0, start) + newSeg + c.substring(descEnd);
fs.writeFileSync('c:/Users/Admin/Downloads/Earnify/public/admin/app.js', c);
console.log('done');
