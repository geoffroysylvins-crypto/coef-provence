#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Configuration
const CSV_PATH = path.join(process.env.HOME, 'Desktop/Privé et partagé 2/Tarifs Catalogue Marta b196d9ec166a4be195967b24ca2e944f_all.csv');
const DOMAINS_DATA_PATH = path.join(__dirname, 'domains-enriched-data.json');
const OUTPUT_DIR = __dirname;

// Départements
const DEPARTMENTS = [
  { code: '04', name: 'Alpes-de-Haute-Provence' },
  { code: '05', name: 'Hautes-Alpes' },
  { code: '06', name: 'Alpes-Mar. / Monaco' },
  { code: '13', name: 'Bouches-du-Rhône' },
  { code: '83', name: 'Var' }
];

// Catégories
const CATEGORIES = {
  'CHR': { name: 'Restauration CHR', priceField: 'Prix HT CHR départ' },
  'Caviste': { name: 'Caviste', priceField: 'Prix HT Caviste départ' },
  'Palace': { name: 'Palaces & Hôtels Prestigieux', priceField: 'Prix HT', allDepts: true },
  'Franco': { name: 'Franco', priceField: 'Prix HT Franco 12', allDepts: true },
  'Particulier': { name: 'Vente directe aux particuliers', priceField: 'Prix HT', allDepts: true },
  'Découverte': { name: 'Présentation de la gamme', priceField: null, allDepts: true }
};

// Parser CSV
function parseCSV() {
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  let cleanContent = csvContent;
  if (cleanContent.charCodeAt(0) === 0xFEFF) {
    cleanContent = cleanContent.slice(1);
  }
  return parse(cleanContent, { columns: true, skip_empty_lines: true, trim: true });
}

// Charger domaines
function loadDomainsData() {
  const data = JSON.parse(fs.readFileSync(DOMAINS_DATA_PATH, 'utf-8'));
  const domainsMap = new Map();
  data.domains.forEach(domain => {
    domainsMap.set(domain.name, domain);
  });
  return domainsMap;
}

// Couleur du vin
function getColorDot(color) {
  const colorMap = { 'rouge': '🔴', 'blanc': '⚪', 'rosé': '🌸', 'pétillant': '✨', 'mousseux': '✨', 'champagne': '✨' };
  const lowerColor = color?.toLowerCase() || '';
  for (const [key, emoji] of Object.entries(colorMap)) {
    if (lowerColor.includes(key)) return emoji;
  }
  return '●';
}

// Formater prix
function formatPrice(price) {
  if (!price || price === '') return 'NC';
  const num = parseFloat(price.toString().replace(/[^\d,.-]/g, '').replace(',', '.'));
  return isNaN(num) ? 'NC' : num.toFixed(2) + ' €';
}

// Grouper vins
function groupWines(records, priceField) {
  const grouped = new Map();
  records.forEach(record => {
    const domainName = record['Vignerons'];
    const region = record['Région'];
    if (!domainName || domainName.trim() === '') return;
    const hasPrice = !priceField || (record[priceField] && record[priceField].toString().trim() !== '');
    if (!hasPrice && priceField) return;
    const key = `${domainName}|${region}`;
    if (!grouped.has(key)) {
      grouped.set(key, { domain: domainName, region: region, wines: [] });
    }
    grouped.get(key).wines.push(record);
  });
  return Array.from(grouped.values());
}

// CSS
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
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--ink); min-height: 100vh; padding: 2rem 1.5rem; }
    .container { max-width: 1200px; margin: 0 auto; }
    .header { background: white; border: 1px solid var(--border); border-radius: 2px; padding: 2rem; margin-bottom: 1.5rem; text-align: center; }
    .header-label { font-size: 0.65rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--gold); margin-bottom: 0.5rem; }
    .header-title { font-family: 'Cormorant Garamond', serif; font-size: 2.5rem; font-weight: 400; margin-bottom: 0.5rem; }
    .header-subtitle { font-size: 0.85rem; color: var(--ink-muted); }

    /* MODE TOGGLE */
    .mode-toggle { background: white; border: 1px solid var(--border); border-radius: 2px; padding: 1rem 1.5rem; margin-bottom: 2rem; display: flex; align-items: center; justify-content: center; gap: 1.5rem; }
    .mode-label { font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-muted); }
    .toggle-buttons { display: flex; gap: 0.5rem; border: 1px solid var(--border); border-radius: 2px; background: #FDFBF8; padding: 0.25rem; }
    .toggle-btn { padding: 0.5rem 1.5rem; border: none; background: transparent; color: var(--ink-muted); font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s; border-radius: 1px; }
    .toggle-btn.active { background: white; color: var(--gold); border: 1px solid var(--gold-pale); }
    .toggle-btn:hover { color: var(--gold); }

    /* MODES */
    .mode-catalogue.hidden { display: none; }
    .mode-vignette { display: none; }
    .mode-vignette.active { display: block; }

    .section { margin-bottom: 3rem; }
    .section-title { font-size: 0.7rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--gold); margin-bottom: 1.5rem; padding-bottom: 0.8rem; border-bottom: 1px solid var(--border); }

    /* CATALOGUE MODE */
    .domain-card { display: grid; grid-template-columns: 250px 1fr; gap: 2rem; background: white; border: 1px solid var(--border); border-radius: 2px; padding: 1.5rem; margin-bottom: 2rem; transition: all 0.2s; }
    .domain-card:hover { background: #FDFBF8; box-shadow: 0 2px 12px rgba(28,26,23,0.10); border-color: var(--gold); }
    .domain-photo { overflow: hidden; border-radius: 2px; aspect-ratio: 1; }
    .domain-photo img { width: 100%; height: 100%; object-fit: cover; }
    .domain-info { display: flex; flex-direction: column; justify-content: space-between; }
    .domain-name { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; font-weight: 400; margin-bottom: 0.25rem; }
    .domain-location { font-size: 0.85rem; color: var(--ink-muted); margin-bottom: 0.5rem; }
    .domain-certifications { font-size: 1.2rem; margin-bottom: 1rem; }
    .domain-description { font-size: 0.9rem; line-height: 1.5; color: var(--ink-soft); }
    .wines-list { background: #FDFBF8; border: 1px solid var(--border); border-radius: 2px; padding: 1.5rem; margin-left: 0; }
    .wines-header { font-size: 0.7rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--gold); margin-bottom: 1rem; display: grid; grid-template-columns: 30px 1fr 100px 60px 80px; gap: 1rem; }
    .wine-row { display: grid; grid-template-columns: 30px 1fr 100px 60px 80px; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid var(--border); font-size: 0.85rem; align-items: center; }
    .wine-row:last-child { border-bottom: none; }
    .wine-color { font-size: 1.2rem; text-align: center; }
    .wine-name { font-weight: 500; }
    .wine-format { color: var(--ink-muted); font-size: 0.8rem; }
    .wine-vintage { color: var(--ink-muted); font-size: 0.8rem; }
    .wine-price { text-align: right; font-weight: 500; color: var(--gold); }

    /* VIGNETTE MODE */
    .vignette-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; }
    .vignette-card { background: white; border: 1px solid var(--border); border-radius: 2px; overflow: hidden; transition: all 0.2s; cursor: pointer; }
    .vignette-card:hover { box-shadow: 0 4px 16px rgba(28,26,23,0.15); border-color: var(--gold); transform: translateY(-2px); }
    .vignette-photo { overflow: hidden; aspect-ratio: 1; }
    .vignette-photo img { width: 100%; height: 100%; object-fit: cover; }
    .vignette-content { padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
    .vignette-name { font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; font-weight: 400; line-height: 1.2; }
    .vignette-region { font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gold); }
    .vignette-icons { font-size: 1rem; }
    .vignette-buttons { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .btn-drive, .btn-conditions { padding: 0.4rem 0.8rem; font-size: 0.75rem; border-radius: 2px; cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-block; text-align: center; border: none; font-weight: 500; }
    .btn-drive { background: var(--gold-light); color: white; }
    .btn-drive:hover { background: var(--gold); }
    .btn-drive:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-conditions { background: white; color: var(--ink); border: 1px solid var(--gold-pale); }
    .btn-conditions:hover { background: var(--gold-pale); }
    .btn-conditions:disabled { opacity: 0.4; cursor: not-allowed; }

    @media (max-width: 768px) {
      body { padding: 1rem; }
      .header { padding: 1.5rem; }
      .header-title { font-size: 2rem; }
      .domain-card { grid-template-columns: 1fr; gap: 1.5rem; }
      .domain-photo { aspect-ratio: auto; height: 250px; }
      .wines-header, .wine-row { grid-template-columns: 20px 1fr 80px 50px; gap: 0.5rem; }
      .wine-vintage { display: none; }
    }
  `;
}

// Générer fiche domaine
function generateDomainCard(domain) {
  const certifications = (domain.certifications || []).map(cert => {
    const certMap = { 'Bio': '🌿', 'Biodynamie': '🌙', 'Demeter': '♎' };
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

// Générer ligne vin
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

// Générer vignette
function generateVignette(domain) {
  const certifications = (domain.certifications || []).map(cert => {
    const certMap = { 'Bio': '🌿', 'Biodynamie': '🌙', 'Demeter': '♎' };
    return certMap[cert] || cert;
  }).join(' ');

  const driveDisabled = !domain.drive_url ? ' disabled' : '';
  const conditionsDisabled = !domain.conditions_url ? ' disabled' : '';

  return `
    <div class="vignette-card">
      <div class="vignette-photo">
        <img src="${domain.photo}" alt="${domain.name}" loading="lazy">
      </div>
      <div class="vignette-content">
        <div class="vignette-name">${domain.name}</div>
        <div class="vignette-region">${domain.region}</div>
        ${certifications ? `<div class="vignette-icons">${certifications}</div>` : ''}
        <div class="vignette-buttons">
          <a href="${domain.drive_url || '#'}" class="btn-drive" ${driveDisabled ? 'onclick="return false;"' : 'target="_blank"'}>📁 Drive</a>
          <a href="${domain.conditions_url || '#'}" class="btn-conditions" ${conditionsDisabled ? 'onclick="return false;"' : 'target="_blank"'}>📋 Conditions</a>
        </div>
      </div>
    </div>`;
}

// Page catalogue
function generateCatalogPage(category, department, records, domainsMap) {
  const categoryConfig = CATEGORIES[category];
  const groupedWines = groupWines(records, categoryConfig.priceField);

  if (groupedWines.length === 0) {
    return null;
  }

  const deptStr = department ? ` — ${department.name}` : '';
  const deptSubtitle = department ? `Département ${department.code} · ${department.name}` : 'Accès tous départements';

  let html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sylvins — ${categoryConfig.name}${deptStr}</title>
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
      <div class="header-subtitle">${deptSubtitle}</div>
    </div>

    <div class="mode-toggle">
      <span class="mode-label">Affichage</span>
      <div class="toggle-buttons">
        <button class="toggle-btn active" onclick="switchMode('catalogue')">📚 Catalogue</button>
        <button class="toggle-btn" onclick="switchMode('vignette')">🎨 Vignettes</button>
      </div>
    </div>

    <!-- MODE CATALOGUE -->
    <div class="mode-catalogue">
`;

  groupedWines.forEach(group => {
    const domainData = domainsMap.get(group.domain);
    if (domainData) {
      html += generateDomainCard(domainData);
    }
    html += `
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

  html += `
    </div>

    <!-- MODE VIGNETTE -->
    <div class="mode-vignette">
      <div class="vignette-grid">
`;

  const vignettesDomains = new Set();
  groupedWines.forEach(group => {
    vignettesDomains.add(group.domain);
  });

  vignettesDomains.forEach(domainName => {
    const domainData = domainsMap.get(domainName);
    if (domainData) {
      html += generateVignette(domainData);
    }
  });

  html += `
      </div>
    </div>
  </div>

  <script>
    function switchMode(mode) {
      document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
      const catalogue = document.querySelector('.mode-catalogue');
      const vignette = document.querySelector('.mode-vignette');
      if (mode === 'catalogue') {
        catalogue.classList.remove('hidden');
        vignette.classList.remove('active');
      } else {
        catalogue.classList.add('hidden');
        vignette.classList.add('active');
      }
      localStorage.setItem('catalogMode', mode);
    }
    window.addEventListener('load', () => {
      const savedMode = localStorage.getItem('catalogMode') || 'catalogue';
      const btnIndex = savedMode === 'catalogue' ? 0 : 1;
      document.querySelectorAll('.toggle-btn')[btnIndex].click();
    });
  </script>
</body>
</html>`;

  return html;
}

// Main
console.log('📦 Génération des catalogues bimodaux...\n');

const records = parseCSV();
const domainsMap = loadDomainsData();

console.log(`✓ CSV chargé: ${records.length} vins`);
console.log(`✓ Domaines chargés: ${domainsMap.size} domaines\n`);

let generatedCount = 0;

// CHR et Caviste
['CHR', 'Caviste'].forEach(category => {
  DEPARTMENTS.forEach(dept => {
    const filename = `${dept.code}_${category.toLowerCase()}_v4.html`;
    const html = generateCatalogPage(category, dept, records, domainsMap);
    if (html) {
      fs.writeFileSync(path.join(OUTPUT_DIR, filename), html);
      console.log(`✓ ${filename}`);
      generatedCount++;
    } else {
      console.log(`⊘ ${filename} (aucun vin)`);
    }
  });
});

// Spécialisés
['Palace', 'Franco', 'Particulier', 'Découverte'].forEach(category => {
  const filename = `${category.toLowerCase()}_v4.html`;
  const html = generateCatalogPage(category, null, records, domainsMap);
  if (html) {
    fs.writeFileSync(path.join(OUTPUT_DIR, filename), html);
    console.log(`✓ ${filename}`);
    generatedCount++;
  } else {
    console.log(`⊘ ${filename} (aucun vin)`);
  }
});

console.log(`\n✅ ${generatedCount} catalogues bimodaux générés`);
console.log('🎨 Design: Mode catalogue (fiches) + Mode vignette (grille)');
console.log('💾 Stockage: Préférences sauvegardées via localStorage');
