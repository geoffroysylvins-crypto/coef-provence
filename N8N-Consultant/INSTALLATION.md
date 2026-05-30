# Installation du Consultant N8N Expert

Guide d'installation pas à pas pour configurer votre environnement de consultant N8N avec Claude.

## 🎯 Objectif

Transformer Claude en consultant expert N8N capable de :
- Créer des workflows optimisés
- Débugger des problèmes complexes
- Auditer et améliorer des workflows existants
- Fournir des conseils d'architecture

## 📋 Prérequis

### 1. Claude Code
- Version minimale : 0.1.0
- Installation : [claude.com/code](https://claude.com/code)

### 2. Node.js & npm
- Version minimale : Node.js 18+
- Vérifier : `node --version`
- Installation : [nodejs.org](https://nodejs.org/)

### 3. N8N (Optionnel mais recommandé)
Pour tester les workflows :
```bash
npm install -g n8n
# ou
npx n8n
```

## 🚀 Installation

### Étape 1 : Configurer le MCP Server N8N

Le MCP (Model Context Protocol) permet à Claude d'interagir directement avec N8N.

#### Option A : Configuration Globale (Recommandé)

1. Ouvrez votre fichier de configuration Claude :
   ```bash
   # Sur macOS/Linux
   code ~/.claude/claude_desktop_config.json

   # Sur Windows
   code %USERPROFILE%\.claude\claude_desktop_config.json
   ```

2. Ajoutez la configuration du serveur N8N :
   ```json
   {
     "mcpServers": {
       "n8n": {
         "command": "npx",
         "args": ["-y", "@n8n/mcp-server"],
         "env": {
           "N8N_API_URL": "http://localhost:5678/api/v1",
           "N8N_API_KEY": "votre-api-key"
         }
       }
     }
   }
   ```

3. Si vous avez déjà d'autres MCP servers, ajoutez simplement la section `"n8n"` :
   ```json
   {
     "mcpServers": {
       "existing-server": {
         ...
       },
       "n8n": {
         "command": "npx",
         "args": ["-y", "@n8n/mcp-server"],
         "env": {
           "N8N_API_URL": "http://localhost:5678/api/v1",
           "N8N_API_KEY": "votre-api-key"
         }
       }
     }
   }
   ```

#### Option B : Configuration Projet Uniquement

Si vous préférez une configuration locale au projet :

1. Copiez le fichier de configuration :
   ```bash
   cp mcp-config.json ~/.claude/projects/n8n-consultant/config.json
   ```

2. Éditez et ajoutez vos credentials N8N

### Étape 2 : Obtenir une API Key N8N

1. Ouvrez votre instance N8N (ex: `http://localhost:5678`)

2. Allez dans **Settings** → **API**

3. Cliquez sur **Create API Key**

4. Copiez la clé générée

5. Ajoutez-la dans votre configuration MCP :
   ```json
   "env": {
     "N8N_API_URL": "http://localhost:5678/api/v1",
     "N8N_API_KEY": "n8n_api_YOUR_KEY_HERE"
   }
   ```

### Étape 3 : Charger le Projet dans Claude

1. Ouvrez Claude Code

2. Naviguez vers le dossier du projet :
   ```bash
   cd "/Users/GeoffroyBeaucousin/Marta Github N8n Mcp/N8N-Consultant"
   ```

3. Ou ouvrez-le directement depuis Claude Code :
   ```
   File → Open Folder → Sélectionner "N8N-Consultant"
   ```

4. Claude chargera automatiquement le fichier `CLAUDE.md`

### Étape 4 : Tester l'Installation

Une fois configuré, testez la connexion MCP :

```
Demandez à Claude :
"Peux-tu lister mes workflows N8N ?"
```

Si tout est bien configuré, Claude pourra accéder à vos workflows via le MCP server.

## 🧪 Validation de l'Installation

### Test 1 : Vérifier le MCP Server

```bash
# Tester le MCP server manuellement
npx -y @n8n/mcp-server
```

Devrait démarrer sans erreur.

### Test 2 : Vérifier l'API Key N8N

```bash
# Tester l'accès à l'API N8N
curl -H "X-N8N-API-KEY: votre-api-key" \
  http://localhost:5678/api/v1/workflows
```

Devrait retourner la liste de vos workflows (ou `[]` si aucun).

### Test 3 : Utiliser une Skill

Dans Claude Code :
```
/n8n-workflow Je veux automatiser l'envoi d'un email quand je reçois un webhook
```

Claude devrait :
1. Comprendre le besoin
2. Proposer une architecture
3. Créer le workflow via le MCP

## 🛠️ Configuration Avancée

### Connexion à N8N Cloud

Si vous utilisez N8N Cloud au lieu de local :

```json
{
  "env": {
    "N8N_API_URL": "https://your-instance.app.n8n.cloud/api/v1",
    "N8N_API_KEY": "your-cloud-api-key"
  }
}
```

### Plusieurs Instances N8N

Pour gérer plusieurs environnements (dev, staging, prod) :

```json
{
  "mcpServers": {
    "n8n-dev": {
      "command": "npx",
      "args": ["-y", "@n8n/mcp-server"],
      "env": {
        "N8N_API_URL": "http://localhost:5678/api/v1",
        "N8N_API_KEY": "dev-key"
      }
    },
    "n8n-prod": {
      "command": "npx",
      "args": ["-y", "@n8n/mcp-server"],
      "env": {
        "N8N_API_URL": "https://prod.n8n.company.com/api/v1",
        "N8N_API_KEY": "prod-key"
      }
    }
  }
}
```

### Variables d'Environnement

Plutôt que de mettre les clés en dur, utilisez des variables d'environnement :

```json
{
  "env": {
    "N8N_API_URL": "${N8N_API_URL}",
    "N8N_API_KEY": "${N8N_API_KEY}"
  }
}
```

Puis dans votre `.bashrc` ou `.zshrc` :
```bash
export N8N_API_URL="http://localhost:5678/api/v1"
export N8N_API_KEY="your-api-key"
```

## 📚 Ressources Incluses

Une fois installé, vous avez accès à :

### Documentation
- [`CLAUDE.md`](CLAUDE.md) - Configuration et skills du consultant
- [`README.md`](README.md) - Vue d'ensemble du projet
- [`BEST-PRACTICES.md`](BEST-PRACTICES.md) - Guide des meilleures pratiques
- [`INSTALLATION.md`](INSTALLATION.md) - Ce fichier

### Exemples
- [`examples/webhook-to-database.md`](examples/webhook-to-database.md) - Workflow webhook complet
- [`examples/shopify-order-automation.md`](examples/shopify-order-automation.md) - Automatisation e-commerce
- [`examples/code-snippets.md`](examples/code-snippets.md) - Bibliothèque de code réutilisable

### Skills Disponibles
- `/n8n-workflow` - Créer un nouveau workflow
- `/n8n-optimize` - Optimiser un workflow existant
- `/n8n-debug` - Débugger un problème
- `/n8n-integration` - Créer une intégration
- `/n8n-best-practices` - Auditer un workflow

## 🔧 Dépannage

### Problème : "MCP Server not found"

**Solution** :
1. Vérifier que Node.js est installé : `node --version`
2. Tester manuellement : `npx -y @n8n/mcp-server`
3. Vérifier les permissions : `which npx`

### Problème : "Cannot connect to N8N API"

**Solution** :
1. Vérifier que N8N est démarré : `http://localhost:5678`
2. Tester l'API key avec curl (voir Test 2)
3. Vérifier les CORS si N8N est sur un autre domaine

### Problème : "Skill not recognized"

**Solution** :
1. Vérifier que `CLAUDE.md` est bien dans le dossier
2. Recharger le projet dans Claude Code
3. Les skills dans `CLAUDE.md` sont des descriptions, pas des commandes exécutables

### Problème : "MCP Server timeout"

**Solution** :
1. Augmenter le timeout dans la config :
   ```json
   {
     "timeout": 30000
   }
   ```
2. Vérifier la latence réseau vers l'API N8N
3. Optimiser les requêtes N8N (indexation DB, etc.)

## 🔒 Sécurité

### ⚠️ API Keys

- Ne jamais commit les API keys dans Git
- Utiliser des variables d'environnement
- Créer des API keys avec permissions minimales
- Renouveler régulièrement les clés

### 🔐 Credentials

- Stocker les credentials dans le système de credentials N8N
- Ne jamais hardcoder dans les workflows
- Utiliser des vaults (HashiCorp Vault, AWS Secrets Manager)

## 📞 Support

### Documentation Officielle
- [N8N Docs](https://docs.n8n.io/)
- [N8N MCP Server](https://github.com/n8n-io/mcp-server)
- [Claude Code](https://claude.com/code)

### Communauté
- [N8N Community Forum](https://community.n8n.io/)
- [N8N Discord](https://discord.gg/n8n)

### Issues
Pour les problèmes spécifiques à ce projet, ouvrez une issue sur GitHub.

---

## ✅ Checklist d'Installation

- [ ] Node.js installé (v18+)
- [ ] N8N installé et démarré
- [ ] API Key N8N créée
- [ ] MCP Server configuré dans `claude_desktop_config.json`
- [ ] Projet N8N-Consultant ouvert dans Claude Code
- [ ] Test de connexion réussi
- [ ] Skill testée (`/n8n-workflow`)

**Félicitations ! Vous êtes maintenant prêt à créer des workflows N8N de niveau expert ! 🎉**
