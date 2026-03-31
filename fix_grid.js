const fs = require('fs');
let c = fs.readFileSync('c:/Users/Admin/Downloads/Earnify/public/admin/app.js', 'utf8');
const lines = c.split('\n');

lines[431] = `          grid.innerHTML = '<div class="res-grid">' + resources.map(r => { const badge = {pdf:'res-badge-pdf',excel:'res-badge-excel',exam:'res-badge-exam',freelance:'res-badge-freelance'}[r.type]||''; const imgSrc = '/file/' + (r.type === 'freelance' ? 'service' : r.type) + '.jpg'; return '<div class="res-card"><div class="res-card-top"><img src="' + imgSrc + '" class="res-card-img" alt="' + r.type + '"><span class="res-badge ' + badge + '">' + r.type + '</span></div><div class="res-card-body"><div class="res-card-title">' + r.title + '</div><div class="res-card-desc">' + r.description + '</div><div class="res-card-price">&#8377;' + r.price + '</div></div><div class="res-card-actions"><button onclick="openFile(' + r.id + ')" class="btn-view">Open</button><button onclick="editResource(' + r.id + ')" class="btn-edit">Edit</button><button onclick="deleteResource(' + r.id + ')" class="btn-delete">Delete</button></div></div>'; }).join('') + '</div>';`;

fs.writeFileSync('c:/Users/Admin/Downloads/Earnify/public/admin/app.js', lines.join('\n'));
console.log('done');
