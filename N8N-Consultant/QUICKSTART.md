# 🚀 Quick Start - N8N Consultant Expert

Démarrage rapide en 5 minutes pour utiliser votre consultant N8N expert.

## ⚡ Installation Express

### Option 1 : Script Automatique (Recommandé)

```bash
cd N8N-Consultant
./setup.sh
```

Le script va :
- ✅ Vérifier les prérequis (Node.js, npx)
- ✅ Télécharger le MCP Server N8N
- ✅ Configurer Claude automatiquement
- ✅ Tester la connexion à N8N

### Option 2 : Installation Manuelle (5 min)

1. **Obtenez votre API Key N8N**
   - Ouvrez N8N : `http://localhost:5678`
   - Settings → API → Create API Key

2. **Configurez le MCP Server**

   Éditez `~/.claude/claude_desktop_config.json` :
   ```json
   {
     "mcpServers": {
       "n8n": {
         "command": "npx",
         "args": ["-y", "@n8n/mcp-server"],
         "env": {
           "N8N_API_URL": "http://localhost:5678/api/v1",
           "N8N_API_KEY": "votre-api-key-ici"
         }
       }
     }
   }
   ```

3. **Redémarrez Claude Code**

4. **Ouvrez ce dossier dans Claude**

✅ C'est tout ! Vous êtes prêt.

---

## 🎯 Premiers Pas

### 1. Créer votre premier workflow

Dans Claude, tapez :
```
/n8n-workflow Je veux recevoir un webhook et enregistrer les données dans PostgreSQL
```

Claude va :
- 🧠 Analyser votre besoin
- 📐 Concevoir l'architecture
- ⚙️ Créer le workflow avec les best practices
- 📝 Documenter la solution

### 2. Optimiser un workflow existant

```
/n8n-optimize Mon workflow "Process Orders" prend trop de temps
```

Claude va :
- 🔍 Analyser le workflow actuel
- 🎯 Identifier les goulots d'étranglement
- 💡 Proposer des optimisations
- 🚀 Implémenter les améliorations

### 3. Débugger un problème

```
/n8n-debug Mon workflow échoue à l'étape Stripe avec une erreur 401
```

Claude va :
- 🔎 Examiner le workflow
- 📊 Analyser les logs
- 🐛 Diagnostiquer la cause
- 🔧 Proposer et implémenter la solution

---

## 💡 Exemples de Prompts

### Créer une automatisation complète

```
Crée-moi un workflow qui :
1. Reçoit les nouvelles commandes Shopify
2. Crée une facture dans Stripe
3. Envoie un email de confirmation au client
4. Ajoute le client dans HubSpot
5. Notifie l'équipe sur Slack
```

### Intégration entre services

```
/n8n-integration Formulaire Typeform → Google Sheets + Slack notification
```

### Audit de qualité

```
/n8n-best-practices workflow-id-123
```

Claude va auditer :
- ✅ Gestion des erreurs
- ✅ Performance
- ✅ Sécurité
- ✅ Documentation
- ✅ Best practices N8N

---

## 📚 Ressources Essentielles

### Documentation
- **[CLAUDE.md](CLAUDE.md)** - Configuration complète et skills
- **[BEST-PRACTICES.md](BEST-PRACTICES.md)** - Guide des meilleures pratiques
- **[INSTALLATION.md](INSTALLATION.md)** - Installation détaillée

### Exemples Pratiques
- **[Webhook → Database](examples/webhook-to-database.md)** - Pipeline complet avec validation
- **[Shopify Automation](examples/shopify-order-automation.md)** - E-commerce automation avancée
- **[Code Snippets](examples/code-snippets.md)** - Bibliothèque de code réutilisable

---

## 🎓 Cas d'Usage Typiques

### 🛒 E-commerce
```
Automatiser le traitement des commandes de A à Z
- Shopify → Stripe → Email → CRM → Slack
```

### 📊 Data Pipeline
```
Synchroniser des données entre systèmes
- API → Transform → Database → Analytics
```

### 🤖 Support Client
```
Automatiser les réponses et le routing
- Email → Classify → Assign → Notify
```

### 📧 Marketing
```
Campagnes automatisées
- Form Submit → Enrich → CRM → Email Sequence
```

---

## 🔥 Tips Pro

### 1. Soyez précis dans vos demandes
❌ "Fais un workflow"
✅ "Crée un workflow qui reçoit un webhook Stripe, valide le payment, et envoie un email de confirmation"

### 2. Mentionnez les contraintes
```
Je veux un workflow qui synchronise Airtable → Notion
MAIS : Airtable a une limite de 5 req/sec
```

### 3. Demandez des explications
```
Explique-moi pourquoi tu utilises un Split In Batches ici
```

### 4. Itérez sur les solutions
```
C'est bien, mais peux-tu ajouter un retry en cas d'erreur API ?
```

---

## ⚙️ Configuration Avancée

### N8N Cloud
```json
"env": {
  "N8N_API_URL": "https://your-instance.app.n8n.cloud/api/v1",
  "N8N_API_KEY": "your-cloud-key"
}
```

### Plusieurs Environnements
```json
"mcpServers": {
  "n8n-dev": { ... },
  "n8n-staging": { ... },
  "n8n-prod": { ... }
}
```

---

## 🐛 Dépannage Express

### "MCP Server not found"
```bash
# Tester le server
npx -y @n8n/mcp-server
```

### "Cannot connect to N8N"
```bash
# Vérifier N8N
curl http://localhost:5678/healthz

# Tester l'API
curl -H "X-N8N-API-KEY: your-key" \
  http://localhost:5678/api/v1/workflows
```

### "Skill not working"
- Vérifier que `CLAUDE.md` est chargé
- Redémarrer Claude Code
- Ouvrir ce dossier dans Claude

---

## 📈 Prochaines Étapes

Une fois familiarisé avec les bases :

1. **Explorez les exemples** dans le dossier `examples/`
2. **Lisez les best practices** dans `BEST-PRACTICES.md`
3. **Créez vos propres workflows** complexes
4. **Optimisez vos workflows** existants
5. **Partagez vos créations** avec la communauté

---

## 💬 Support

### Questions ?
- 📖 Consultez [INSTALLATION.md](INSTALLATION.md) pour plus de détails
- 🌐 Communauté N8N : [community.n8n.io](https://community.n8n.io/)
- 💬 Discord N8N : [discord.gg/n8n](https://discord.gg/n8n)

### Problème technique ?
1. Vérifiez les logs Claude Code
2. Testez la connexion N8N manuellement
3. Consultez la section Dépannage dans [INSTALLATION.md](INSTALLATION.md)

---

## ✅ Checklist de Démarrage

- [ ] Node.js installé (v18+)
- [ ] N8N démarré
- [ ] API Key obtenue
- [ ] MCP configuré
- [ ] Claude Code redémarré
- [ ] Projet ouvert dans Claude
- [ ] Premier workflow créé avec `/n8n-workflow`

**Vous êtes prêt à automatiser ! 🎉**

---

## 🎁 Bonus : Workflow Templates

### Template 1 : Webhook Simple
```
Webhook → Validate → Database → Response
```

### Template 2 : API Sync
```
Schedule → API Fetch → Transform → Database → Notify
```

### Template 3 : Event Processing
```
Webhook → IF (Event Type)
  ├─ TypeA → Action A
  ├─ TypeB → Action B
  └─ TypeC → Action C
```

### Template 4 : Enrichment Pipeline
```
Input → Enrich API 1 → Enrich API 2 → Enrich API 3 → Output
```

Demandez à Claude de créer n'importe lequel de ces templates !

---

**Bon workflow ! 🚀**
