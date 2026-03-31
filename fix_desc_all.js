const fs = require('fs');
let c = fs.readFileSync('c:/Users/Admin/Downloads/Earnify/public/admin/Resources/style.css', 'utf8');

// Fix all variants of res-desc with truncation
c = c.replace(/\.res-desc\s*\{[^}]*white-space:\s*nowrap[^}]*\}/g,
  `.res-desc { white-space: normal; word-break: break-word; color: #94a3b8; font-size: 12px; }`
);

fs.writeFileSync('c:/Users/Admin/Downloads/Earnify/public/admin/Resources/style.css', c);
console.log('done');
