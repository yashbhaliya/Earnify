const fs = require('fs');
const path = 'c:\\Users\\Admin\\Downloads\\Earnify\\public\\admin\\Resources\\style.css';
let c = fs.readFileSync(path, 'utf8');

// Fix MATCH 3 - the .button-container line that still has overflow-x auto
c = c.replace(
  `.add-buttons-group, .resource-tabs {\n  flex-wrap: nowrap !important;\n  overflow-x: auto !important;\n  -webkit-overflow-scrolling: touch !important;\n}`,
  `.add-buttons-group, .resource-tabs {\n  flex-wrap: wrap;\n}`
);

// Also catch any remaining overflow-x on add-buttons-group anywhere
c = c.replace(/\.add-buttons-group([^{]*)\{([^}]*?)overflow-x\s*:\s*auto[^;]*;/g, '.add-buttons-group$1{$2');
c = c.replace(/\.add-buttons-group([^{]*)\{([^}]*?)-webkit-overflow-scrolling\s*:\s*touch[^;]*;/g, '.add-buttons-group$1{$2');
c = c.replace(/\.add-buttons-group([^{]*)\{([^}]*?)scrollbar-width\s*:\s*thin[^;]*;/g, '.add-buttons-group$1{$2');
c = c.replace(/\.add-buttons-group([^{]*)\{([^}]*?)flex-wrap\s*:\s*nowrap[^;]*;/g, '.add-buttons-group$1{$2flex-wrap: wrap;');

fs.writeFileSync(path, c, 'utf8');
console.log('Done');
