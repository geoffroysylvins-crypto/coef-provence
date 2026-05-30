const fs = require('fs');
const path = require('path');

// Load data
const catalogData = JSON.parse(fs.readFileSync('catalog-data.json', 'utf-8'));
const domainsData = JSON.parse(fs.readFileSync('domains-data.json', 'utf-8'));
const { winesByCategory } = catalogData;
const domains = domainsData.domains;

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

// Certification icons
const certificationIcons = {
    'Bio': '🌿',
    'Biodynamie': '🌙',
    'Demeter': '♎'
};

// Generate enriched catalog pages
categories.forEach(category => {
    const winesByDomain = winesByCategory[category];
    
    departments.forEach(dept => {
        const deptCode = String(dept.code).padStart(2, '0');
        const filename = `${deptCode}_${category}_v2.html`;
        
        // All domains available in this category
        const allDomains = Object.keys(winesByDomain).sort();
        
        // Organize wines by domain first, then by region
        const winesByDomainAndRegion = {};
        allDomains.forEach(domain => {
            winesByDomainAndRegion[domain] = winesByDomain[domain] || {};
        });

        // Generate HTML
        const html = generateEnrichedCatalogHTML(
            deptCode,
            dept.name,
            category,
            winesByDomainAndRegion,
            allDomains,
            domains
        );

        fs.writeFileSync(filename, html);
        console.log('Generated ' + filename);
    });
});

function generateEnrichedCatalogHTML(deptCode, deptName, category, winesByDomainAndRegion, allDomains, domains) {
    const categoryLabel = category === 'chr' ? 'CHR — Restauration' : 'Caviste';

    let domainsHTML = '';
    
    allDomains.forEach(domainName => {
        const regionWines = winesByDomainAndRegion[domainName];
        const domainInfo = domains[domainName] || {};
        
        // Only show domains that have wines in this category
        if (!regionWines || Object.keys(regionWines).length === 0) return;
        
        let winesHTML = '';
        let totalWines = 0;
        
        Object.entries(regionWines).forEach(([region, wines]) => {
            wines.forEach(wine => {
                totalWines++;
                const colorCode = colorMap[wine.couleur] || '#999';
                const metaInfo = (wine.millesime ? wine.millesime + ' · ' : '') + wine.format;
                
                let pricingHTML = '';
                if (wine.prxCHR) {
                    pricingHTML += '<div class="price-line"><span class="price-label">CHR:</span><span class="price-value">' + wine.prxCHR + '€</span></div>';
                }
                if (wine.prxCaviste) {
                    pricingHTML += '<div class="price-line"><span class="price-label">Caviste:</span><span class="price-value">' + wine.prxCaviste + '€</span></div>';
                }
                
                winesHTML += `
                    <div class="wine-item">
                        <div class="wine-color" style="background-color: ${colorCode}"></div>
                        <div class="wine-info">
                            <div class="wine-name">${wine.cuvee}</div>
                            <div class="wine-meta">${metaInfo}</div>
                        </div>
                        <div class="wine-price">${wine.prxCHR || wine.prxCaviste || '-'}€</div>
                    </div>
                `;
            });
        });
        
        if (totalWines === 0) return;
        
        // Certifications HTML
        let certificationsHTML = '';
        if (domainInfo.certifications && domainInfo.certifications.length > 0) {
            certificationsHTML = '<div class="certifications">' + 
                domainInfo.certifications.map(cert => 
                    '<span class="cert-badge" title="' + cert + '">' + certificationIcons[cert] + ' ' + cert + '</span>'
                ).join('') + 
                '</div>';
        }
        
        domainsHTML += `
        <div class="domain-section">
            <div class="domain-card">
                <img src="${domainInfo.photo || 'https://via.placeholder.com/400x300'}" alt="${domainName}" class="domain-photo">
                <div class="domain-info">
                    <div class="domain-name">${domainName}</div>
                    <div class="domain-location">${domainInfo.location || ''}</div>
                    ${certificationsHTML}
                    <p class="domain-description">${domainInfo.description || ''}</p>
                </div>
            </div>
            <div class="wines-list">
                <div class="wines-count">${totalWines} cuvée${totalWines > 1 ? 's' : ''}</div>
                ${winesHTML}
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

        .domain-section {
            margin-bottom: 3rem;
            border-bottom: 1px solid var(--border);
            padding-bottom: 2rem;
        }

        .domain-card {
            display: grid;
            grid-template-columns: 250px 1fr;
            gap: 2rem;
            margin-bottom: 1.5rem;
            background: white;
            border: 1px solid var(--border);
            border-radius: 2px;
            overflow: hidden;
        }

        .domain-photo {
            width: 100%;
            height: 200px;
            object-fit: cover;
        }

        .domain-info {
            padding: 1.5rem;
        }

        .domain-name {
            font-family: 'Cormorant Garamond', serif;
            font-size: 1.3rem;
            font-weight: 400;
            margin-bottom: 0.3rem;
        }

        .domain-location {
            font-size: 0.75rem;
            color: var(--gold);
            letter-spacing: 0.1em;
            text-transform: uppercase;
            margin-bottom: 0.8rem;
        }

        .certifications {
            margin-bottom: 0.8rem;
        }

        .cert-badge {
            display: inline-block;
            background: #f0f0f0;
            border: 1px solid var(--border);
            padding: 0.3rem 0.6rem;
            border-radius: 2px;
            font-size: 0.75rem;
            margin-right: 0.4rem;
            margin-bottom: 0.3rem;
        }

        .domain-description {
            font-size: 0.85rem;
            line-height: 1.5;
            color: var(--ink-soft);
        }

        .wines-list {
            background: white;
            border: 1px solid var(--border);
            border-top: none;
        }

        .wines-count {
            font-size: 0.7rem;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: var(--gold);
            padding: 0.8rem 1.5rem;
            border-bottom: 1px solid var(--border);
            background: #fafafa;
        }

        .wine-item {
            display: grid;
            grid-template-columns: 12px 1fr 80px;
            gap: 1rem;
            align-items: center;
            padding: 0.8rem 1.5rem;
            border-bottom: 1px solid var(--border);
        }

        .wine-item:last-child {
            border-bottom: none;
        }

        .wine-color {
            width: 12px;
            height: 12px;
            border-radius: 50%;
        }

        .wine-name {
            font-size: 0.9rem;
            font-weight: 500;
        }

        .wine-meta {
            font-size: 0.75rem;
            color: var(--ink-muted);
        }

        .wine-price {
            text-align: right;
            font-weight: 600;
            font-size: 0.9rem;
        }

        @media (max-width: 768px) {
            .domain-card {
                grid-template-columns: 1fr;
            }

            .domain-photo {
                height: 250px;
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

        ${domainsHTML}
    </div>
</body>
</html>`;
}

