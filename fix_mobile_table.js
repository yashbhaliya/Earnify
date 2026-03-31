const fs = require('fs');
let c = fs.readFileSync('c:/Users/Admin/Downloads/Earnify/public/admin/Resources/style.css', 'utf8');

// Remove both occurrences of res-table-wrap display:none in media queries
c = c.replace(/\.res-table-wrap \{ display: none !important; \}/g, '.res-table-wrap { display: block; }');

fs.writeFileSync('c:/Users/Admin/Downloads/Earnify/public/admin/Resources/style.css', c);
console.log('done');
