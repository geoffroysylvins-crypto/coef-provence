#!/bin/bash

# N8N Consultant Setup Script
# Ce script facilite l'installation et la configuration du projet

set -e  # Exit on error

# Couleurs pour l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Bannière
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════╗"
echo "║   N8N Expert Consultant - Setup Script    ║"
echo "║              Version 1.0.0                 ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# 1. Vérifier Node.js
log_info "Vérification de Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    log_success "Node.js installé : $NODE_VERSION"

    # Vérifier la version (minimum 18)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$MAJOR_VERSION" -lt 18 ]; then
        log_warning "Node.js $NODE_VERSION détecté. Version 18+ recommandée."
        read -p "Continuer quand même ? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
else
    log_error "Node.js n'est pas installé !"
    log_info "Installez Node.js depuis : https://nodejs.org/"
    exit 1
fi

# 2. Vérifier npx
log_info "Vérification de npx..."
if command -v npx &> /dev/null; then
    log_success "npx disponible"
else
    log_error "npx n'est pas disponible !"
    exit 1
fi

# 3. Tester le MCP Server N8N
log_info "Test du MCP Server N8N..."
if npx -y @n8n/mcp-server --version &> /dev/null; then
    log_success "MCP Server N8N accessible"
else
    log_warning "Impossible de télécharger le MCP Server N8N"
    log_info "Vérifiez votre connexion internet"
fi

# 4. Détecter le fichier de configuration Claude
log_info "Recherche du fichier de configuration Claude..."

CLAUDE_CONFIG_PATH=""

# Chemins possibles
POSSIBLE_PATHS=(
    "$HOME/.claude/claude_desktop_config.json"
    "$HOME/Library/Application Support/Claude/claude_desktop_config.json"
    "$APPDATA/Claude/claude_desktop_config.json"
)

for path in "${POSSIBLE_PATHS[@]}"; do
    if [ -f "$path" ]; then
        CLAUDE_CONFIG_PATH="$path"
        log_success "Configuration Claude trouvée : $CLAUDE_CONFIG_PATH"
        break
    fi
done

if [ -z "$CLAUDE_CONFIG_PATH" ]; then
    log_warning "Fichier de configuration Claude non trouvé"
    log_info "Créez-le manuellement ou lancez Claude Code une première fois"
    CLAUDE_CONFIG_PATH="$HOME/.claude/claude_desktop_config.json"
fi

# 5. Configuration du MCP Server
log_info "Configuration du MCP Server N8N..."

echo ""
echo "Pour configurer le MCP Server, nous avons besoin de :"
echo "1. L'URL de votre instance N8N (ex: http://localhost:5678)"
echo "2. Votre API Key N8N"
echo ""

# Demander l'URL N8N
read -p "URL de votre instance N8N [http://localhost:5678]: " N8N_URL
N8N_URL=${N8N_URL:-http://localhost:5678}

# Vérifier que l'URL se termine sans slash
N8N_URL=${N8N_URL%/}

# Demander l'API Key
read -p "Votre API Key N8N (laissez vide pour configurer plus tard): " N8N_API_KEY

# Construire la configuration MCP
MCP_CONFIG=$(cat <<EOF
{
  "mcpServers": {
    "n8n": {
      "command": "npx",
      "args": ["-y", "@n8n/mcp-server"],
      "env": {
        "N8N_API_URL": "${N8N_URL}/api/v1",
        "N8N_API_KEY": "${N8N_API_KEY}"
      }
    }
  }
}
EOF
)

# 6. Sauvegarder la configuration
echo ""
log_info "Options de configuration :"
echo "1. Écrire dans le fichier de configuration Claude (recommandé)"
echo "2. Afficher la configuration à copier manuellement"
echo "3. Sauvegarder dans un fichier local"
echo ""
read -p "Votre choix [1]: " CONFIG_CHOICE
CONFIG_CHOICE=${CONFIG_CHOICE:-1}

case $CONFIG_CHOICE in
    1)
        # Créer le dossier si nécessaire
        mkdir -p "$(dirname "$CLAUDE_CONFIG_PATH")"

        # Sauvegarder
        echo "$MCP_CONFIG" > "$CLAUDE_CONFIG_PATH"
        log_success "Configuration écrite dans : $CLAUDE_CONFIG_PATH"
        log_info "Redémarrez Claude Code pour appliquer les changements"
        ;;
    2)
        echo ""
        log_info "Copiez cette configuration dans votre fichier Claude :"
        echo ""
        echo "$MCP_CONFIG"
        echo ""
        ;;
    3)
        echo "$MCP_CONFIG" > "mcp-config-generated.json"
        log_success "Configuration sauvegardée dans : mcp-config-generated.json"
        ;;
esac

# 7. Vérifier N8N
echo ""
log_info "Vérification de la connexion à N8N..."

if [ ! -z "$N8N_API_KEY" ]; then
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "X-N8N-API-KEY: $N8N_API_KEY" \
        "${N8N_URL}/api/v1/workflows" 2>/dev/null || echo "000")

    if [ "$RESPONSE" == "200" ]; then
        log_success "Connexion à N8N réussie !"
    elif [ "$RESPONSE" == "000" ]; then
        log_warning "Impossible de se connecter à $N8N_URL"
        log_info "Vérifiez que N8N est démarré : n8n start"
    elif [ "$RESPONSE" == "401" ]; then
        log_error "API Key invalide"
    else
        log_warning "Réponse HTTP inattendue : $RESPONSE"
    fi
else
    log_warning "API Key non fournie, test de connexion ignoré"
fi

# 8. Récapitulatif
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          Installation Terminée !           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""

echo "📋 Prochaines étapes :"
echo ""
echo "1. Redémarrez Claude Code pour charger la configuration MCP"
echo "2. Ouvrez ce dossier dans Claude Code :"
echo "   cd \"$(pwd)\""
echo "3. Testez avec : /n8n-workflow"
echo ""

echo "📚 Documentation :"
echo "   • Installation complète : INSTALLATION.md"
echo "   • Best practices : BEST-PRACTICES.md"
echo "   • Exemples : examples/"
echo ""

echo "🔑 Configuration :"
echo "   • N8N URL : $N8N_URL"
echo "   • Config Claude : $CLAUDE_CONFIG_PATH"
echo ""

if [ -z "$N8N_API_KEY" ]; then
    echo -e "${YELLOW}⚠️  N'oubliez pas d'ajouter votre API Key N8N !${NC}"
    echo ""
fi

log_success "Setup terminé avec succès ! 🎉"
