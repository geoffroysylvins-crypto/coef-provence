# 🚀 Guide d'Installation N8N Consultant

Installation rapide du serveur MCP n8n-mcp et des skills n8n-skills.

## ⚡ Installation Automatique (Recommandée)

Lancez le script d'installation :

```bash
cd "N8N-Consultant"
./install-n8n-tools.sh
```

Le script va :
- ✅ Vérifier Node.js
- ✅ Tester le serveur n8n-mcp
- ✅ Configurer le MCP dans Claude
- ✅ Vous guider pour installer les skills

## 📋 Installation Manuelle

### Étape 1 : Vérifier les Prérequis

```bash
node --version  # Devrait afficher v18+ (vous avez v24.13.0 ✅)
npm --version   # Devrait afficher 8+ (vous avez 11.6.2 ✅)
```

### Étape 2 : Tester n8n-mcp

```bash
npx n8n-mcp
```

Devrait afficher :
```
✅ 1,204 nodes chargés
✅ 2,737 templates indexés
✅ 7 outils MCP disponibles
```

### Étape 3 : Configurer le MCP

#### Option A : Service Hébergé (Recommandé) 🌟

1. Créez un compte sur [dashboard.n8n-mcp.com](https://dashboard.n8n-mcp.com)
2. Obtenez votre API key
3. Ajoutez à `~/.claude/claude_desktop_config.json` :

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
- ✅ 1,204 nodes toujours à jour
- ✅ Zéro maintenance
- ✅ Pas besoin de Node.js installé

#### Option B : NPX Local

Pour développement local avec accès API N8N :

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": ["n8n-mcp"],
      "env": {
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "info",
        "N8N_API_URL": "http://localhost:5678",
        "N8N_API_KEY": "votre-api-key-n8n"
      }
    }
  }
}
```

#### Option C : Docker

Pour production :

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

### Étape 4 : Installer les Skills

1. Redémarrez Claude Code
2. Dans Claude Code, tapez :

```
/plugin install czlonkowski/n8n-skills
```

Les **7 skills** seront installées :
1. 🔤 n8n Expression Syntax
2. 🛠️ n8n MCP Tools Expert ⭐
3. 🏗️ n8n Workflow Patterns
4. ✅ n8n Validation Expert
5. ⚙️ n8n Node Configuration
6. 💻 n8n Code JavaScript
7. 🐍 n8n Code Python

### Étape 5 : Charger le Projet

1. Ouvrez ce dossier dans Claude Code
2. Le fichier `CLAUDE.md` se charge automatiquement
3. Claude devient un expert N8N !

## ✅ Vérifier l'Installation

### Test 1 : MCP Server

Dans Claude Code, tapez :
```
Liste les nodes N8N disponibles pour PostgreSQL
```

Claude devrait rechercher dans les 1,204 nodes et vous montrer les options.

### Test 2 : Skills

Tapez :
```
Crée un workflow webhook qui valide des données et les stocke dans PostgreSQL
```

Claude devrait :
1. 🔍 Utiliser `search_nodes` du MCP
2. 🏗️ Appliquer le pattern "Webhook Processing"
3. 💻 Écrire du code JavaScript avec `$json.body`
4. ✅ Valider le workflow

### Test 3 : Expression Syntax

Tapez :
```
Comment accéder aux données d'un webhook dans N8N ?
```

Claude devrait vous expliquer le gotcha critique : `$json.body` !

## 🔧 Dépannage

### Problème : MCP Server not found

**Solution** :
```bash
# Vérifier Node.js
node --version

# Tester manuellement
npx n8n-mcp
```

### Problème : Skills not found

**Solution** :
```bash
# Dans Claude Code
/plugin install czlonkowski/n8n-skills

# Vérifier l'installation
/plugin list
```

### Problème : Configuration not loaded

**Solution** :
1. Vérifier le chemin : `~/.claude/claude_desktop_config.json`
2. Vérifier le JSON (pas d'erreurs de syntaxe)
3. Redémarrer Claude Code

### Problème : Telemetry

Pour désactiver la télémétrie anonyme :
```bash
npx n8n-mcp telemetry disable
```

## 📊 Statistiques de Votre Installation

Une fois installé, vous aurez accès à :

| Ressource | Quantité |
|-----------|----------|
| Nodes N8N | 1,204 |
| Templates | 2,737 |
| Outils MCP | 7 |
| Outils AI | 265 |
| Skills | 7 |

## 🎓 Commandes Utiles

### MCP Server

```bash
# Version
npx n8n-mcp --version

# Désactiver télémétrie
npx n8n-mcp telemetry disable

# Avec variables d'environnement
MCP_MODE=stdio LOG_LEVEL=debug npx n8n-mcp
```

### Skills

```bash
# Installer
/plugin install czlonkowski/n8n-skills

# Lister les plugins
/plugin list

# Mettre à jour
/plugin update czlonkowski/n8n-skills

# Désinstaller
/plugin uninstall czlonkowski/n8n-skills
```

## 🔗 Fichiers de Configuration

### Configuration MCP
- **Template** : `.claude-config.json` (dans ce dossier)
- **Configuration Claude** : `~/.claude/claude_desktop_config.json`
- **Options** : 3 (hosted, npx, docker)

### Configuration du Projet
- **CLAUDE.md** : Chargé automatiquement
- **mcp-config.json** : Templates de configuration
- **Exemples** : `examples/` avec workflows documentés

## 📚 Documentation Complète

- **[QUICKSTART.md](QUICKSTART.md)** - Démarrage en 5 minutes
- **[INSTALLATION.md](INSTALLATION.md)** - Guide détaillé
- **[BEST-PRACTICES.md](BEST-PRACTICES.md)** - Meilleures pratiques
- **[MISE-A-JOUR.md](MISE-A-JOUR.md)** - Nouveautés v2.0

## 🌐 Ressources Externes

### Documentation Officielle
- **n8n-mcp** : https://github.com/czlonkowski/n8n-mcp
- **n8n-skills** : https://github.com/czlonkowski/n8n-skills
- **Dashboard** : https://dashboard.n8n-mcp.com
- **Website** : https://www.n8n-skills.com

### N8N
- **Documentation** : https://docs.n8n.io
- **Community** : https://community.n8n.io

## 🎬 Prochaines Étapes

1. ✅ **Installer** le MCP et les skills
2. ✅ **Redémarrer** Claude Code
3. ✅ **Tester** avec un workflow simple
4. 📖 **Lire** BEST-PRACTICES.md
5. 🚀 **Créer** vos premiers workflows !

---

**Version** : 2.0.0
**Date** : 2026-02-08

**Installation vérifiée** :
- ✅ Node.js v24.13.0
- ✅ npm 11.6.2
- ✅ n8n-mcp 2.34.5
- ✅ 1,204 nodes chargés
- ✅ 2,737 templates indexés

**Bon workflow ! 🎉**
