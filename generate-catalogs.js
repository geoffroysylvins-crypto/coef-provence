const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');

// Read the pricing CSV
const csvPath = '/Users/GeoffroyBeaucousin/Desktop/Privé et partagé 2/Tarifs Catalogue Marta b196d9ec166a4be195967b24ca2e944f.csv';
let csvContent = fs.readFileSync(csvPath, 'utf-8');

// Remove BOM if present
if (csvContent.charCodeAt(0) === 0xFEFF) {
    csvContent = csvContent.slice(1);
}

// Parse CSV with proper handling
const records = csv.parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
});

console.log(`✓ Loaded ${records.length} wine records`);

// Group wines by domain, region, and pricing category
const winesByDomain = {};
const winesByCategory = { chr: {}, caviste: {}, societe: {} };
const allRegions = new Set();

records.forEach((record) => {
    const domain = record['Vignerons']?.trim() || '';
    const wineRegion = record['Région']?.trim() || '';
    const cuvee = record['Cuvée']?.trim() || '';
    const couleur = record['Couleur']?.trim() || '';
    const millesime = record['Millésime']?.trim() || '';
    const format = record['Format']?.trim() || '';
    const prxCHR = record['Prix HT CHR départ']?.trim() || '';
    const prxCaviste = record['Prix HT Caviste départ']?.trim() || '';
    const prxSociete = record['Traif Societe']?.trim() || '';
    const statut = record['Statut']?.trim() || '';

    if (!domain || !wineRegion || !cuvee) return;

    allRegions.add(wineRegion);

    const wine = {
        cuvee,
        couleur,
        millesime,
        format,
        prxCHR,
        prxCaviste,
        prxSociete,
        statut
    };

    // Group by domain
    if (!winesByDomain[domain]) {
        winesByDomain[domain] = {};
    }
    if (!winesByDomain[domain][wineRegion]) {
        winesByDomain[domain][wineRegion] = [];
    }
    winesByDomain[domain][wineRegion].push(wine);

    // Group by category
    if (prxCHR) {
        if (!winesByCategory.chr[domain]) {
            winesByCategory.chr[domain] = {};
        }
        if (!winesByCategory.chr[domain][wineRegion]) {
            winesByCategory.chr[domain][wineRegion] = [];
        }
        winesByCategory.chr[domain][wineRegion].push(wine);
    }

    if (prxCaviste) {
        if (!winesByCategory.caviste[domain]) {
            winesByCategory.caviste[domain] = {};
        }
        if (!winesByCategory.caviste[domain][wineRegion]) {
            winesByCategory.caviste[domain][wineRegion] = [];
        }
        winesByCategory.caviste[domain][wineRegion].push(wine);
    }

    if (prxSociete) {
        if (!winesByCategory.societe[domain]) {
            winesByCategory.societe[domain] = {};
        }
        if (!winesByCategory.societe[domain][wineRegion]) {
            winesByCategory.societe[domain][wineRegion] = [];
        }
        winesByCategory.societe[domain][wineRegion].push(wine);
    }
});

console.log(`✓ Found ${Object.keys(winesByDomain).length} unique domains`);
console.log(`✓ Found ${allRegions.size} wine regions`);

console.log('\n=== DONNÉES CHARGÉES ===');
console.log(`CHR: ${Object.keys(winesByCategory.chr).length} domains`);
console.log(`Caviste: ${Object.keys(winesByCategory.caviste).length} domains`);
console.log(`Societe: ${Object.keys(winesByCategory.societe).length} domains`);

console.log('\nDomaines uniques:');
Object.keys(winesByDomain).sort().slice(0, 10).forEach(d => console.log(`  - ${d}`));

console.log('\nRégions des vins:');
Array.from(allRegions).sort().forEach(r => console.log(`  - ${r}`));

// Save data for use in catalog generation
fs.writeFileSync(
    path.join(__dirname, 'catalog-data.json'),
    JSON.stringify({ winesByDomain, winesByCategory }, null, 2)
);

console.log('\n✓ Data saved to catalog-data.json');

