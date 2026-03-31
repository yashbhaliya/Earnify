const fs = require('fs');
let c = fs.readFileSync('c:/Users/Admin/Downloads/Earnify/public/admin/Resources/style.css', 'utf8');

c = c.replace(
`.res-desc {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px;
}`,
`.res-desc {
  font-size: 12px;
  color: #94a3b8;
  white-space: normal;
  word-break: break-word;
}`
);

fs.writeFileSync('c:/Users/Admin/Downloads/Earnify/public/admin/Resources/style.css', c);
console.log('done');
