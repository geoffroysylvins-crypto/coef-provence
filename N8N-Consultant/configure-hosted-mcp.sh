#!/bin/bash

# Configuration Service Hébergé n8n-mcp
# Script pour configurer automatiquement le MCP avec le service hébergé

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║   Configuration Service Hébergé n8n-mcp               ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Fichier de configuration Claude
CLAUDE_CONFIG="$HOME/.claude/claude_desktop_config.json"

# Vérifier si le fichier existe
if [ ! -f "$CLAUDE_CONFIG" ]; then
    echo -e "${YELLOW}⚠️  Fichier de configuration Claude non trouvé${NC}"
    echo "Création de : $CLAUDE_CONFIG"
    mkdir -p "$HOME/.claude"
    echo '{}' > "$CLAUDE_CONFIG"
fi

echo ""
echo -e "${BLUE}🌐 Configuration du Service Hébergé${NC}"
echo ""
echo "Le service hébergé offre :"
echo "  ✅ 100 tool calls/jour gratuits"
echo "  ✅ 1,204 nodes toujours à jour"
echo "  ✅ Zéro maintenance"
echo "  ✅ Pas besoin de Node.js"
echo ""
echo "Pour obtenir votre API key :"
echo "  1. Allez sur : ${GREEN}https://dashboard.n8n-mcp.com${NC}"
echo "  2. Créez un compte (gratuit)"
echo "  3. Copiez votre API key"
echo ""

# Demander l'API key
read -p "Avez-vous votre API key ? (y/n) [y]: " HAS_KEY
HAS_KEY=${HAS_KEY:-y}

if [[ ! $HAS_KEY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}📝 Pas de problème !${NC}"
    echo ""
    echo "Voici ce que vous devez ajouter à $CLAUDE_CONFIG :"
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
    echo ""
    echo -e "${BLUE}Une fois que vous avez votre API key :${NC}"
    echo "1. Relancez ce script : ./configure-hosted-mcp.sh"
    echo "2. Ou éditez manuellement : $CLAUDE_CONFIG"
    echo ""
    exit 0
fi

# Demander l'API key
echo ""
read -p "Entrez votre API key : " API_KEY

if [ -z "$API_KEY" ]; then
    echo -e "${RED}❌ API key vide !${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}💾 Sauvegarde de la configuration...${NC}"

# Backup de la config existante
if [ -f "$CLAUDE_CONFIG" ]; then
    BACKUP="$CLAUDE_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$CLAUDE_CONFIG" "$BACKUP"
    echo -e "${GREEN}✅ Backup créé : $BACKUP${NC}"
fi

# Vérifier si c'est un JSON vide ou valide
CURRENT_CONFIG=$(cat "$CLAUDE_CONFIG")

if [ "$CURRENT_CONFIG" = "{}" ] || [ "$CURRENT_CONFIG" = "" ]; then
    # Configuration vide, on crée une nouvelle config
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
else
    # Config existante, on essaie de merger
    echo -e "${YELLOW}⚠️  Configuration existante détectée${NC}"
    echo ""
    echo "Options :"
    echo "1. Remplacer complètement (recommandé si seul MCP)"
    echo "2. Afficher la configuration à ajouter manuellement"
    echo ""
    read -p "Votre choix [1]: " MERGE_CHOICE
    MERGE_CHOICE=${MERGE_CHOICE:-1}

    if [ "$MERGE_CHOICE" = "1" ]; then
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
    else
        echo ""
        echo -e "${YELLOW}📋 Ajoutez cette section à votre fichier :${NC}"
        echo ""
        cat <<EOF
"n8n-mcp": {
  "url": "https://dashboard.n8n-mcp.com",
  "apiKey": "$API_KEY"
}
EOF
        echo ""
        echo "Dans la section 'mcpServers' de : $CLAUDE_CONFIG"
        echo ""
        exit 0
    fi
fi

echo -e "${GREEN}✅ Configuration sauvegardée !${NC}"
echo ""

# Afficher la configuration
echo -e "${BLUE}📄 Configuration actuelle :${NC}"
cat "$CLAUDE_CONFIG"
echo ""

# Instructions finales
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         Configuration Terminée !                       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

echo "📋 Prochaines étapes :"
echo ""
echo "1. ${BLUE}Redémarrez Claude Code${NC}"
echo "   Pour charger la nouvelle configuration MCP"
echo ""
echo "2. ${BLUE}Installez les skills${NC}"
echo "   Dans Claude Code, tapez :"
echo "   ${GREEN}/plugin install czlonkowski/n8n-skills${NC}"
echo ""
echo "3. ${BLUE}Ouvrez ce dossier${NC}"
echo "   Le fichier CLAUDE.md se charge automatiquement"
echo ""
echo "4. ${BLUE}Testez${NC}"
echo "   Tapez dans Claude :"
echo "   \"Liste les nodes N8N disponibles pour PostgreSQL\""
echo ""

echo "🔗 Ressources :"
echo "   • Dashboard : https://dashboard.n8n-mcp.com"
echo "   • Documentation : $(pwd)/INSTALL-GUIDE.md"
echo ""

echo -e "${GREEN}✅ Tout est prêt !${NC}"
echo ""
