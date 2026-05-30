const fs = require('fs');
const csv = require('csv-parse/sync');

const csvPath = '/Users/GeoffroyBeaucousin/Desktop/Privé et partagé 2/Tarifs Catalogue Marta b196d9ec166a4be195967b24ca2e944f.csv';
const csvContent = fs.readFileSync(csvPath, 'utf-8');

const records = csv.parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
});

console.log('Total records:', records.length);
console.log('Field names:', Object.keys(records[0] || {}));
console.log('\nFirst record:');
if (records[0]) {
    Object.entries(records[0]).forEach(([key, val]) => {
        console.log(`  ${key}: "${val}"`);
    });
}

