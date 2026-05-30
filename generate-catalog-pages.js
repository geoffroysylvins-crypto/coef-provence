const fs = require('fs');
const path = require('path');

// Load the parsed data
const catalogData = JSON.parse(fs.readFileSync('catalog-data.json', 'utf-8'));
const { winesByCategory } = catalogData;

// Department information
const departments = [
    { code: 83, name: 'Var' },
    { code: 13, name: 'Bouches-du-Rhône' },
    { code: 6, name: 'Alpes-Maritimes' },
    { code: 4, name: 'Alpes-de-Haute-Provence' },
    { code: 5, name: 'Hautes-Alpes' }
];

const categories = ['chr', 'caviste'];

// Color mapping for wine colors
const colorMap = {
    'Rouge': '#8B4513',
    'Blanc': '#D4AF37',
    'Rosé': '#E75480'
};

// Generate catalog pages
categories.forEach(category => {
    const winesByDomain = winesByCategory[category];
    
    departments.forEach(dept => {
        const deptCode = String(dept.code).padStart(2, '0');
        const filename = `${deptCode}_${category}.html`;
        
        // All domains available in this category
        const domains = Object.keys(winesByDomain).sort();
        
        // Organize wines by region
        const winesByRegion = {};
        domains.forEach(domain => {
            Object.entries(winesByDomain[domain]).forEach(([region, wines]) => {
                if (!winesByRegion[region]) {
                    winesByRegion[region] = [];
                }
                wines.forEach(wine => {
                    winesByRegion[region].push({
                        domain,
                        ...wine
                    });
                });
            });
        });

        // Generate HTML
        const html = generateCatalogHTML(
            deptCode,
            dept.name,
            category,
            winesByRegion
        );

        fs.writeFileSync(filename, html);
        console.log('Generated ' + filename);
    });
});

function generateCatalogHTML(deptCode, deptName, category, winesByRegion) {
    const categoryLabel = category === 'chr' ? 'CHR — Restauration' : 'Caviste';

    const regionOrder = ['Provence', 'Vallée du Rhône', 'Bourgogne', 'Champagne', 'Loire', 'Beaujolais', 'Liban'];
    const sortedRegions = regionOrder.filter(r => winesByRegion[r]);

    let regionsSectionHTML = '';
    
    sortedRegions.forEach(region => {
        const wines = winesByRegion[region];
        let winesCardsHTML = '';
        
        wines.forEach(wine => {
            const colorCode = colorMap[wine.couleur] || '#999';
            const colorSpan = '<span class="wine-color" style="background-color: ' + colorCode + '"></span>';
            const metaInfo = (wine.millesime ? wine.millesime + ' · ' : '') + wine.format;
            
            let pricingHTML = '';
            if (wine.prxCHR) {
                pricingHTML += '<div class="price-line"><span class="price-label">CHR départ:</span><span class="price-value">' + wine.prxCHR + '€</span></div>';
            }
            if (wine.prxCaviste) {
                pricingHTML += '<div class="price-line"><span class="price-label">Caviste départ:</span><span class="price-value">' + wine.prxCaviste + '€</span></div>';
            }
            
            winesCardsHTML += `
                <div class="wine-card">
                    <div class="wine-domain">${wine.domain}</div>
                    <div class="wine-name">${wine.cuvee}</div>
                    <div class="wine-meta">
                        ${colorSpan}
                        ${metaInfo}
                    </div>
                    <div class="wine-pricing">
                        ${pricingHTML}
                    </div>
                </div>
            `;
        });
        
        regionsSectionHTML += `
        <div class="region-section">
            <div class="region-title">${region}</div>
            <div class="wines-grid">
                ${winesCardsHTML}
            </div>
        </div>
        `;
    });

    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${deptCode} — ${deptName} — ${categoryLabel}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root {
            --cream: #F7F4EF;
            --ink: #1C1A17;
            --ink-soft: #4A4540;
            --ink-muted: #8C867E;
            --gold: #9B7B4A;
            --gold-light: #C4A06B;
            --border: rgba(28,26,23,0.12);
        }

        *, *::before, *::after {
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
            padding: 2rem;
            margin-bottom: 3rem;
            text-align: center;
        }

        .header-back {
            font-size: 0.7rem;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: var(--gold);
            margin-bottom: 1rem;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
        }

        .header-back:hover {
            text-decoration: underline;
        }

        .header-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 2rem;
            font-weight: 400;
            margin-bottom: 0.5rem;
        }

        .header-subtitle {
            font-size: 0.85rem;
            color: var(--ink-muted);
        }

        .region-section {
            margin-bottom: 3rem;
        }

        .region-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 1.3rem;
            font-weight: 400;
            padding-bottom: 0.8rem;
            border-bottom: 1px solid var(--border);
            margin-bottom: 1.5rem;
            text-transform: capitalize;
        }

        .wines-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 2rem;
        }

        .wine-card {
            background: white;
            border: 1px solid var(--border);
            padding: 1.5rem;
            border-radius: 2px;
        }

        .wine-card:hover {
            box-shadow: 0 2px 12px rgba(28,26,23,0.10);
            border-color: var(--gold);
        }

        .wine-domain {
            font-size: 0.65rem;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: var(--gold);
            margin-bottom: 0.5rem;
        }

        .wine-name {
            font-family: 'Cormorant Garamond', serif;
            font-size: 1.1rem;
            font-weight: 400;
            margin-bottom: 0.3rem;
        }

        .wine-meta {
            font-size: 0.8rem;
            color: var(--ink-muted);
            margin-bottom: 0.8rem;
        }

        .wine-color {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 0.4rem;
            vertical-align: middle;
        }

        .wine-pricing {
            border-top: 1px solid var(--border);
            padding-top: 0.8rem;
            margin-top: 0.8rem;
            font-size: 0.85rem;
        }

        .price-line {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.4rem;
        }

        .price-label {
            color: var(--ink-muted);
        }

        .price-value {
            font-weight: 500;
        }

        @media (max-width: 768px) {
            .wines-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <a href="index.html" class="header-back">← Retour au portail</a>
            <div class="header-title">${deptCode} — ${deptName}</div>
            <div class="header-subtitle">Catalogue ${categoryLabel}</div>
        </div>

        ${regionsSectionHTML}
    </div>
</body>
</html>`;
}

