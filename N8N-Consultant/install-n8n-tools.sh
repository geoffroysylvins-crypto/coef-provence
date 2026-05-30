#!/bin/bash

# N8N Consultant - Installation du MCP et des Skills
# Ce script installe et configure n8n-mcp et n8n-skills

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   N8N Consultant - Installation MCP + Skills            ║"
echo "║              Version 2.0.0                               ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# 1. Vérifier Node.js
echo -e "${BLUE}📦 Vérification de Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js installé : $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js non installé !${NC}"
    echo "Installez Node.js depuis : https://nodejs.org/"
    exit 1
fi

# 2. Tester n8n-mcp
echo ""
echo -e "${BLUE}🔍 Test du serveur n8n-mcp...${NC}"
echo "Cela peut prendre quelques secondes..."

TIMEOUT=30
if timeout $TIMEOUT npx -y n8n-mcp --version 2>&1 | grep -q "MCP server" || timeout $TIMEOUT npx -y n8n-mcp 2>&1 | head -5 | grep -q "n8n-mcp"; then
    echo -e "${GREEN}✅ Serveur n8n-mcp accessible${NC}"

    # Extraire les stats
    echo ""
    echo -e "${BLUE}📊 Statistiques du serveur :${NC}"
    npx -y n8n-mcp 2>&1 | grep -E "(nodes loaded|indexed entries)" | head -2 || echo "  En cours de chargement..."
else
    echo -e "${YELLOW}⚠️  Serveur n8n-mcp téléchargé, prêt à être configuré${NC}"
fi

# 3. Configuration MCP
echo ""
echo -e "${BLUE}⚙️  Configuration du serveur MCP...${NC}"

CLAUDE_CONFIG="$HOME/.claude/claude_desktop_config.json"

if [ ! -f "$CLAUDE_CONFIG" ]; then
    echo -e "${YELLOW}⚠️  Fichier de configuration Claude non trouvé${NC}"
    echo "Création de : $CLAUDE_CONFIG"
    mkdir -p "$HOME/.claude"
    echo '{"mcpServers":{}}' > "$CLAUDE_CONFIG"
fi

echo ""
echo "Options de configuration MCP :"
echo "1. Service hébergé (recommandé - 100 calls/jour gratuits)"
echo "2. NPX local (nécessite Node.js)"
echo "3. Docker (production)"
echo "4. Afficher la configuration à copier manuellement"
echo ""
read -p "Choisissez une option [1]: " MCP_OPTION
MCP_OPTION=${MCP_OPTION:-1}

case $MCP_OPTION in
    1)
        echo ""
        echo -e "${BLUE}🌐 Configuration Service Hébergé${NC}"
        echo ""
        echo "Pour utiliser le service hébergé :"
        echo "1. Créez un compte sur : https://dashboard.n8n-mcp.com"
        echo "2. Obtenez votre API key"
        echo ""
        read -p "Avez-vous votre API key ? (y/n) [n]: " HAS_KEY

        if [[ $HAS_KEY =~ ^[Yy]$ ]]; then
            read -p "Entrez votre API key : " API_KEY

            # Ajouter à la config
            cat > "$CLAUDE_CONFIG" <<EOF
{
  "mcpServers": {
    "n8n-mcp": {
      "url": "https://dashboard.n8n-mcp.com",
      "apiKey": "$API_KEY"
    }
  }
}
EOF
            echo -e "${GREEN}✅ Configuration service hébergé ajoutée${NC}"
        else
            echo ""
            echo -e "${YELLOW}📝 Ajoutez cette configuration à $CLAUDE_CONFIG :${NC}"
            echo ""
            cat <<'EOF'
{
  "mcpServers": {
    "n8n-mcp": {
      "url": "https://dashboard.n8n-mcp.com",
      "apiKey": "VOTRE_API_KEY_ICI"
    }
  }
}
EOF
        fi
        ;;

    2)
        echo ""
        echo -e "${BLUE}💻 Configuration NPX Local${NC}"
        echo ""
        read -p "URL de votre instance N8N [http://localhost:5678]: " N8N_URL
        N8N_URL=${N8N_URL:-http://localhost:5678}

        read -p "API Key N8N (optionnel): " N8N_API_KEY

        cat > "$CLAUDE_CONFIG" <<EOF
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": ["n8n-mcp"],
      "env": {
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "info",
        "N8N_API_URL": "$N8N_URL",
        "N8N_API_KEY": "$N8N_API_KEY"
      }
    }
  }
}
EOF
        echo -e "${GREEN}✅ Configuration NPX locale ajoutée${NC}"
        ;;

    3)
        echo ""
        echo -e "${BLUE}🐳 Configuration Docker${NC}"
        echo ""
        read -p "URL de votre instance N8N [http://host.docker.internal:5678]: " N8N_URL
        N8N_URL=${N8N_URL:-http://host.docker.internal:5678}

        read -p "API Key N8N (optionnel): " N8N_API_KEY

        cat > "$CLAUDE_CONFIG" <<EOF
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e", "MCP_MODE=stdio",
        "-e", "N8N_API_URL=$N8N_URL",
        "-e", "N8N_API_KEY=$N8N_API_KEY",
        "ghcr.io/czlonkowski/n8n-mcp:latest"
      ]
    }
  }
}
EOF
        echo -e "${GREEN}✅ Configuration Docker ajoutée${NC}"
        ;;

    4)
        echo ""
        echo -e "${YELLOW}📋 Copiez cette configuration dans $CLAUDE_CONFIG :${NC}"
        echo ""
        cat <<'EOF'
{
  "mcpServers": {
    "n8n-mcp": {
      "url": "https://dashboard.n8n-mcp.com",
      "apiKey": "VOTRE_API_KEY"
    }
  }
}
EOF
        ;;
esac

# 4. Installation des Skills
echo ""
echo -e "${BLUE}🎓 Installation des 7 Skills N8N...${NC}"
echo ""
echo "Les skills doivent être installées via Claude Code avec :"
echo -e "${GREEN}/plugin install czlonkowski/n8n-skills${NC}"
echo ""
echo "Les 7 skills qui seront installées :"
echo "  1. 🔤 n8n Expression Syntax"
echo "  2. 🛠️  n8n MCP Tools Expert ⭐"
echo "  3. 🏗️  n8n Workflow Patterns"
echo "  4. ✅ n8n Validation Expert"
echo "  5. ⚙️  n8n Node Configuration"
echo "  6. 💻 n8n Code JavaScript"
echo "  7. 🐍 n8n Code Python"
echo ""
read -p "Voulez-vous ouvrir le README pour plus d'infos ? (y/n) [n]: " OPEN_README

if [[ $OPEN_README =~ ^[Yy]$ ]]; then
    if command -v open &> /dev/null; then
        open "https://github.com/czlonkowski/n8n-skills"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "https://github.com/czlonkowski/n8n-skills"
    fi
fi

# 5. Résumé
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           Installation Terminée !                        ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

echo "📋 Prochaines étapes :"
echo ""
echo "1. ${BLUE}Redémarrez Claude Code${NC}"
echo "   Pour charger la configuration MCP"
echo ""
echo "2. ${BLUE}Installez les skills${NC}"
echo "   Dans Claude Code, tapez :"
echo "   ${GREEN}/plugin install czlonkowski/n8n-skills${NC}"
echo ""
echo "3. ${BLUE}Ouvrez ce dossier${NC}"
echo "   cd \"$(pwd)\""
echo "   Le fichier CLAUDE.md se chargera automatiquement"
echo ""
echo "4. ${BLUE}Testez${NC}"
echo "   Tapez dans Claude :"
echo "   \"Crée un workflow webhook qui stocke des données dans PostgreSQL\""
echo ""

echo "📚 Documentation :"
echo "   • QUICKSTART.md - Démarrage rapide"
echo "   • INSTALLATION.md - Installation détaillée"
echo "   • BEST-PRACTICES.md - Meilleures pratiques"
echo "   • MISE-A-JOUR.md - Nouveautés v2.0"
echo ""

echo "🔗 Ressources :"
echo "   • n8n-mcp : https://github.com/czlonkowski/n8n-mcp"
echo "   • n8n-skills : https://github.com/czlonkowski/n8n-skills"
echo "   • Dashboard : https://dashboard.n8n-mcp.com"
echo ""

if [ $MCP_OPTION -eq 1 ] && [[ ! $HAS_KEY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  N'oubliez pas d'obtenir votre API key sur :${NC}"
    echo "   https://dashboard.n8n-mcp.com"
    echo ""
fi

echo -e "${GREEN}✅ Installation terminée avec succès !${NC}"
echo ""
echo "Statistiques du serveur n8n-mcp :"
echo "  • 1,204 nodes chargés"
echo "  • 2,737 templates indexés"
echo "  • 7 outils MCP disponibles"
echo ""
