# N8N Expert Consultant - Configuration Claude

Ce dossier contient la configuration complète pour transformer Claude en consultant expert N8N utilisant le serveur **n8n-mcp** et les **7 skills n8n-skills**.

## ✨ Nouveauté : Vraies Fonctionnalités N8N

Ce projet utilise maintenant :
- **[n8n-mcp](https://github.com/czlonkowski/n8n-mcp)** : Serveur MCP officiel avec accès à 1,084 nodes
- **[n8n-skills](https://github.com/czlonkowski/n8n-skills)** : 7 skills Claude Code spécialisées
- **2,709 templates** de workflows documentés
- **265 outils AI** avec documentation complète

## 🚀 Installation Rapide

### 1. Installer les Skills N8N

```bash
/plugin install czlonkowski/n8n-skills
```

Cela installe les **7 skills** :
1. 🔤 n8n Expression Syntax
2. 🛠️ n8n MCP Tools Expert ⭐
3. 🏗️ n8n Workflow Patterns
4. ✅ n8n Validation Expert
5. ⚙️ n8n Node Configuration
6. 💻 n8n Code JavaScript
7. 🐍 n8n Code Python

### 2. Configurer le MCP Server N8N

#### Option A : Service Hébergé (Recommandé) 🌟

Le plus simple, zéro configuration :

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "url": "https://dashboard.n8n-mcp.com",
      "apiKey": "votre-api-key"
    }
  }
}
```

**Avantages** :
- ✅ 100 tool calls/jour gratuits
- ✅ Toujours à jour (1,084 nodes)
- ✅ Zéro maintenance

👉 Obtenez votre clé sur [dashboard.n8n-mcp.com](https://dashboard.n8n-mcp.com)

#### Option B : NPX Local

Pour développement local :

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": ["n8n-mcp"],
      "env": {
        "MCP_MODE": "stdio",
        "N8N_API_URL": "http://localhost:5678",
        "N8N_API_KEY": "votre-api-key"
      }
    }
  }
}
```

#### Option C : Docker (Production)

Image optimisée (82% plus petite) :

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "MCP_MODE=stdio",
        "-e", "N8N_API_URL=http://host.docker.internal:5678",
        "-e", "N8N_API_KEY=votre-api-key",
        "ghcr.io/czlonkowski/n8n-mcp:latest"
      ]
    }
  }
}
```

### 3. Charger le Projet

1. Ouvrez Claude Code dans ce dossier
2. Le fichier `CLAUDE.md` se charge automatiquement
3. Claude devient un expert N8N avec accès à 1,084 nodes !

## 🎯 Ce Qui Change

### Avant (Théorique)
- Configuration générique
- Pas d'accès réel aux nodes
- Skills hypothétiques

### Maintenant (Réel) ✅
- **1,084 nodes** documentés (537 core + 547 community)
- **2,709 templates** de workflows réels
- **7 skills** spécialisées par czlonkowski
- **265 outils AI** documentés
- **Validation** de workflows avant déploiement
- **Exemples** extraits de 2,646 configurations

## 🛠️ Les 7 Skills N8N

### 🔤 n8n Expression Syntax
Maîtrise des expressions `{{}}`, variables `$json`, `$node`, `$now`, `$env`

**CRITICAL** : Webhook data est dans `$json.body` !

### 🛠️ n8n MCP Tools Expert ⭐ (PRIORITAIRE)
Guide l'utilisation des outils MCP :
- `search_nodes` : Recherche dans 1,084 nodes
- `get_node_info` : Propriétés détaillées
- `validate_workflow` : Validation avant déploiement
- `search_templates` : 2,709 templates

### 🏗️ n8n Workflow Patterns
5 patterns d'architecture éprouvés :
1. Webhook Processing
2. HTTP API
3. Database
4. AI (265 tools)
5. Scheduled

### ✅ n8n Validation Expert
Interprète et résout les erreurs de validation

### ⚙️ n8n Node Configuration
Configuration experte node par node

### 💻 n8n Code JavaScript
10 patterns de production pour Code nodes

### 🐍 n8n Code Python
Guide Python (mais "utilisez JavaScript pour 95% des cas")

## 📋 Prérequis

- **Claude Code** installé
- **Node.js** (pour npx) OU accès au service hébergé
- **N8N** (optionnel - uniquement pour créer/modifier des workflows)

## 🎯 Utilisation

### Exemples de Prompts

#### Créer un Workflow
```
Crée un workflow webhook qui reçoit des données Stripe,
les valide, les stocke dans PostgreSQL et envoie une
notification Slack
```

Claude va :
1. 🔍 Rechercher les nodes appropriés (Webhook, PostgreSQL, Slack)
2. 🏗️ Appliquer le pattern "Webhook Processing"
3. ⚙️ Configurer chaque node correctement
4. 💻 Écrire le code JavaScript avec `$json.body`
5. ✅ Valider le workflow avant déploiement

#### Débugger un Workflow
```
Mon workflow échoue avec l'erreur "Cannot read property 'email'
of undefined" dans le Code node
```

Claude va :
1. 🔍 Analyser le problème (probablement `$json` au lieu de `$json.body`)
2. 🛠️ Identifier la correction nécessaire
3. ✅ Valider la configuration
4. 📝 Expliquer le gotcha pour éviter à l'avenir

#### Optimiser un Workflow
```
Mon workflow Shopify prend 5 minutes pour 100 commandes
```

Claude va :
1. 📊 Analyser les goulots d'étranglement
2. 💡 Proposer batch operations
3. ⚡ Implémenter Split In Batches
4. ✅ Mesurer l'amélioration

## 🔍 Capacités Réelles du Consultant

Grâce au serveur n8n-mcp et aux 7 skills :

### Accès à la Documentation
- ✅ **1,084 nodes** : 537 core + 547 community (301 vérifiés)
- ✅ **2,709 templates** : Workflows réels avec configurations
- ✅ **265 outils AI** : OpenAI, Anthropic, Google, etc.
- ✅ **87% documentation** : Docs officielles N8N
- ✅ **99% propriétés** : Schémas complets des nodes

### Expertise Technique
- ✅ Maîtrise des **5 patterns** d'architecture
- ✅ Expressions N8N (`$json.body`, `$node`, etc.)
- ✅ **10 patterns JavaScript** de production
- ✅ Validation avec **3 profils** (strict, normal, lenient)
- ✅ Gestion d'erreurs robuste

### Gestion de Workflows (si API configurée)
- ✅ Créer de nouveaux workflows
- ✅ Modifier des workflows existants
- ✅ Consulter l'historique d'exécution
- ✅ Valider avant déploiement

## 📚 Ressources

### Documentation Officielle
- **n8n-mcp** : [github.com/czlonkowski/n8n-mcp](https://github.com/czlonkowski/n8n-mcp)
- **n8n-skills** : [github.com/czlonkowski/n8n-skills](https://github.com/czlonkowski/n8n-skills)
- **N8N Docs** : [docs.n8n.io](https://docs.n8n.io/)
- **N8N Community** : [community.n8n.io](https://community.n8n.io/)

### Service Hébergé
- **Dashboard** : [dashboard.n8n-mcp.com](https://dashboard.n8n-mcp.com)
- **Website** : [www.n8n-skills.com](https://www.n8n-skills.com/)

### Documentation Locale
- **[QUICKSTART.md](QUICKSTART.md)** : Démarrage en 5 minutes
- **[INSTALLATION.md](INSTALLATION.md)** : Guide d'installation détaillé
- **[BEST-PRACTICES.md](BEST-PRACTICES.md)** : Meilleures pratiques complètes
- **[examples/](examples/)** : Workflows documentés avec code

## 💡 Exemples de Cas d'Usage

### 1. E-commerce Automation
**Pattern** : Webhook Processing + AI
```
Shopify Order → Validate → Stripe Invoice → Email → HubSpot → Slack
```
📖 Voir : [examples/shopify-order-automation.md](examples/shopify-order-automation.md)

### 2. Data Pipeline
**Pattern** : Scheduled + Database
```
Cron → API Fetch → Transform (Code JS) → PostgreSQL → Report
```
📖 Voir : [examples/webhook-to-database.md](examples/webhook-to-database.md)

### 3. AI Processing
**Pattern** : AI (265 tools disponibles)
```
Trigger → Prepare Prompt → OpenAI/Anthropic → Parse → Action
```

### 4. Webhook API
**Pattern** : HTTP API
```
Webhook → Validate ($json.body!) → Process → Respond
```

### 5. Monitoring & Alerting
**Pattern** : Scheduled + Branching
```
Cron → Check API → IF Error → PagerDuty + Slack
```

## 📊 Statistiques de Couverture

| Catégorie | Couverture |
|-----------|------------|
| Nodes disponibles | 1,084 (537 core + 547 community) |
| Templates documentés | 2,709 workflows |
| Configurations extraites | 2,646 exemples |
| Outils AI | 265 tools |
| Documentation officielle | 87% |
| Propriétés de nodes | 99% |
| Opérations | 63.6% |

## ⚠️ Points Critiques N8N

### 🚨 Webhook Data
```javascript
// ❌ INCORRECT
const email = $json.email;

// ✅ CORRECT
const email = $json.body.email;
```

### 🚨 Return Format
```javascript
// ❌ INCORRECT
return data;

// ✅ CORRECT
return { json: data };
```

### 🚨 Sécurité Production
**JAMAIS** éditer directement les workflows de production avec AI !
- ✅ Toujours faire des copies
- ✅ Tester en dev d'abord
- ✅ Valider avec `validate_workflow`
- ✅ Exporter des backups

---

**Note** : Ce projet utilise le **vrai** serveur MCP n8n-mcp de czlonkowski, donnant à Claude un accès complet à l'écosystème N8N avec 1,084 nodes, 2,709 templates et 7 skills spécialisées.
