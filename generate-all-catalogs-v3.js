#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Configuration
const CSV_PATH = path.join(process.env.HOME, 'Desktop/Privé et partagé 2/Tarifs Catalogue Marta b196d9ec166a4be195967b24ca2e944f_all.csv');
const DOMAINS_DATA_PATH = path.join(__dirname, 'domains-enriched-data.json');
const OUTPUT_DIR = __dirname;

// Départements pour CHR et Caviste
const DEPARTMENTS = [
  { code: '04', name: 'Alpes-de-Haute-Provence' },
  { code: '05', name: 'Hautes-Alpes' },
  { code: '06', name: 'Alpes-Mar. / Monaco' },
  { code: '13', name: 'Bouches-du-Rhône' },
  { code: '83', name: 'Var' }
];

// Catégories de tarif
const CATEGORIES = {
  'CHR': {
    name: 'Restauration',
    priceField: 'Prix HT CHR départ',
    label: 'Tarif CHR'
  },
  'Caviste': {
    name: 'Caviste',
    priceField: 'Prix HT Caviste départ',
    label: 'Tarif caviste'
  },
  'Palace': {
    name: 'Palaces & Hôtels Prestigieux',
    priceField: 'Prix HT',
    label: 'Tarif palace'
  },
  'Franco': {
    name: 'Franco',
    priceField: 'Prix HT Franco 12',
    label: 'Tarif Franco'
  },
  'Particulier': {
    name: 'Vente directe aux particuliers',
    priceField: 'Prix HT',
    label: 'Tarif particulier'
  },
  'Découverte': {
    name: 'Présentation de la gamme',
    priceField: null,
    label: 'Sans tarifs'
  }
};

// Lire et parser le CSV
function parseCSV() {
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  let cleanContent = csvContent;
  if (cleanContent.charCodeAt(0) === 0xFEFF) {
    cleanContent = cleanContent.slice(1);
  }

  return parse(cleanContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
}

// Charger les données de domaines enrichis
function loadDomainsData() {
  const data = JSON.parse(fs.readFileSync(DOMAINS_DATA_PATH, 'utf-8'));
  const domainsMap = new Map();

  data.domains.forEach(domain => {
    domainsMap.set(domain.name, domain);
  });

  return domainsMap;
}

// Obtenir la couleur du vin (pour le point coloré)
function getColorDot(color) {
  const colorMap = {
    'rouge': '🔴',
    'blanc': '⚪',
    'rosé': '🌸',
    'pétillant': '✨',
    'mousseux': '✨',
    'champagne': '✨'
  };

  const lowerColor = color?.toLowerCase() || '';
  for (const [key, emoji] of Object.entries(colorMap)) {
    if (lowerColor.includes(key)) return emoji;
  }
  return '●';
}

// Formater le prix
function formatPrice(price) {
  if (!price || price === '') return 'NC';
  const num = parseFloat(price.toString().replace(/[^\d,.-]/g, '').replace(',', '.'));
  return isNaN(num) ? 'NC' : num.toFixed(2) + ' €';
}

// Générer la fiche domaine
function generateDomainCard(domain) {
  const certifications = (domain.certifications || []).map(cert => {
    const certMap = {
      'Bio': '🌿',
      'Biodynamie': '🌙',
      'Demeter': '♎'
    };
    return certMap[cert] || cert;
  }).join(' ');

  return `
    <div class="domain-card">
      <div class="domain-photo">
        <img src="${domain.photo}" alt="${domain.name}" loading="lazy">
      </div>
      <div class="domain-info">
        <div class="domain-name">${domain.name}</div>
        <div class="domain-location">${domain.location || domain.region}</div>
        ${certifications ? `<div class="domain-certifications">${certifications}</div>` : ''}
        <div class="domain-description">${domain.description}</div>
      </div>
    </div>`;
}

// Générer une ligne de vin
function generateWineRow(wine, priceField) {
  const colorDot = getColorDot(wine['Couleur']);
  const price = priceField ? formatPrice(wine[priceField]) : '—';

  return `
    <div class="wine-row">
      <div class="wine-color">${colorDot}</div>
      <div class="wine-name">${wine['Cuvée'] || 'Sans nom'}</div>
      <div class="wine-format">${wine['Format'] || ''}</div>
      <div class="wine-vintage">${wine['Millésime'] || ''}</div>
      <div class="wine-price">${price}</div>
    </div>`;
}

// Grouper les vins par domaine et région
function groupWines(records, priceField) {
  const grouped = new Map();

  records.forEach(record => {
    const domainName = record['Vignerons'];
    const region = record['Région'];

    if (!domainName || domainName.trim() === '') return;

    // Vérifier si le vin a un prix pour cette catégorie
    if (priceField && !record[priceField]) return;

    const key = `${domainName}|${region}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        domain: domainName,
        region: region,
        wines: []
      });
    }

    grouped.get(key).wines.push(record);
  });

  return Array.from(grouped.values());
}

// Générer le CSS
function generateCSS() {
  return `
    :root {
      --cream: #F7F4EF;
      --ink: #1C1A17;
      --ink-soft: #4A4540;
      --ink-muted: #8C867E;
      --gold: #9B7B4A;
      --gold-light: #C4A06B;
      --gold-pale: #EDE3D4;
      --border: rgba(28,26,23,0.12);
      --border-strong: rgba(28,26,23,0.25);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'DM Sans', sans-serif;
      background: var(--cream);
      color: var(--ink);
      min-height: 100vh;
      padding: 2rem 1.5rem;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      background: white;
      border: 1px solid var(--border);
      border-radius: 2px;
      padding: 2rem;
      margin-bottom: 3rem;
      text-align: center;
    }

    .header-label {
      font-size: 0.65rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 0.5rem;
    }

    .header-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 2.5rem;
      font-weight: 400;
      margin-bottom: 0.5rem;
    }

    .header-subtitle {
      font-size: 0.85rem;
      color: var(--ink-muted);
    }

    .section {
      margin-bottom: 3rem;
    }

    .section-title {
      font-size: 0.7rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 1.5rem;
      padding-bottom: 0.8rem;
      border-bottom: 1px solid var(--border);
    }

    .domain-card {
      display: grid;
      grid-template-columns: 250px 1fr;
      gap: 2rem;
      background: white;
      border: 1px solid var(--border);
      border-radius: 2px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      transition: all 0.2s;
    }

    .domain-card:hover {
      background: #FDFBF8;
      box-shadow: 0 2px 12px rgba(28,26,23,0.10);
      border-color: var(--gold);
    }

    .domain-photo {
      overflow: hidden;
      border-radius: 2px;
      aspect-ratio: 1;
    }

    .domain-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .domain-info {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .domain-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.5rem;
      font-weight: 400;
      margin-bottom: 0.25rem;
    }

    .domain-location {
      font-size: 0.85rem;
      color: var(--ink-muted);
      margin-bottom: 0.5rem;
    }

    .domain-certifications {
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }

    .domain-description {
      font-size: 0.9rem;
      line-height: 1.5;
      color: var(--ink-soft);
    }

    .wines-list {
      background: #FDFBF8;
      border: 1px solid var(--border);
      border-radius: 2px;
      padding: 1.5rem;
      margin-left: 0;
    }

    .wines-header {
      font-size: 0.7rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 1rem;
      display: grid;
      grid-template-columns: 30px 1fr 100px 60px 80px;
      gap: 1rem;
    }

    .wine-row {
      display: grid;
      grid-template-columns: 30px 1fr 100px 60px 80px;
      gap: 1rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--border);
      font-size: 0.85rem;
      align-items: center;
    }

    .wine-row:last-child {
      border-bottom: none;
    }

    .wine-color {
      font-size: 1.2rem;
      text-align: center;
    }

    .wine-name {
      font-weight: 500;
    }

    .wine-format {
      color: var(--ink-muted);
      font-size: 0.8rem;
    }

    .wine-vintage {
      color: var(--ink-muted);
      font-size: 0.8rem;
    }

    .wine-price {
      text-align: right;
      font-weight: 500;
      color: var(--gold);
    }

    @media (max-width: 768px) {
      body {
        padding: 1rem;
      }

      .header {
        padding: 1.5rem;
      }

      .header-title {
        font-size: 2rem;
      }

      .domain-card {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .domain-photo {
        aspect-ratio: auto;
        height: 250px;
      }

      .wines-header,
      .wine-row {
        grid-template-columns: 20px 1fr 80px 50px;
        gap: 0.5rem;
      }

      .wine-vintage {
        display: none;
      }
    }
  `;
}

// Générer une page catalogue
function generateCatalogPage(category, department, records, domainsMap) {
  const categoryConfig = CATEGORIES[category];
  const groupedWines = groupWines(records, categoryConfig.priceField);

  let content = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sylvins — ${categoryConfig.name}${department ? ` — ${department.name}` : ''}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
  <style>
    ${generateCSS()}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-label">${category}</div>
      <div class="header-title">${categoryConfig.name}</div>
      <div class="header-subtitle">${department ? `Département ${department.code} · ${department.name}` : 'Accès tous départements'}</div>
    </div>
`;

  // Générer les domaines
  groupedWines.forEach(group => {
    const domainData = domainsMap.get(group.domain);

    if (domainData) {
      content += generateDomainCard(domainData);
    }

    content += `
    <div class="wines-list">
      <div class="wines-header">
        <div></div>
        <div>Cuvée</div>
        <div>Format</div>
        <div>Millésime</div>
        <div>Prix</div>
      </div>
      ${group.wines.map(wine => generateWineRow(wine, categoryConfig.priceField)).join('')}
    </div>
`;
  });

  content += `
  </div>
</body>
</html>`;

  return content;
}

// Main
console.log('📦 Génération des catalogues complets...\n');

const records = parseCSV();
const domainsMap = loadDomainsData();

console.log(`✓ CSV chargé: ${records.length} vins`);
console.log(`✓ Domaines chargés: ${domainsMap.size} domaines`);

let generatedCount = 0;

// Générer catalogues CHR et Caviste pour chaque département
['CHR', 'Caviste'].forEach(category => {
  DEPARTMENTS.forEach(dept => {
    const categoryRecords = records.filter(r =>
      r['Tarif'] === category ||
      r['Section'] === category.toLowerCase()
    );

    if (categoryRecords.length === 0) return;

    const filename = `${dept.code}_${category.toLowerCase()}_v3.html`;
    const html = generateCatalogPage(category, dept, categoryRecords, domainsMap);

    fs.writeFileSync(path.join(OUTPUT_DIR, filename), html);
    console.log(`✓ ${filename}`);
    generatedCount++;
  });
});

// Générer catalogues spécialisés (tous les domaines)
['Palace', 'Franco', 'Particulier', 'Découverte'].forEach(category => {
  const filename = `${category.toLowerCase()}_v3.html`;
  const html = generateCatalogPage(category, null, records, domainsMap);

  fs.writeFileSync(path.join(OUTPUT_DIR, filename), html);
  console.log(`✓ ${filename}`);
  generatedCount++;
});

console.log(`\n✅ ${generatedCount} catalogues générés`);
console.log('🎨 Design: Fiches domaines enrichies avec photos');
console.log('💰 Tarifs: Affichage conforme à chaque catégorie');
