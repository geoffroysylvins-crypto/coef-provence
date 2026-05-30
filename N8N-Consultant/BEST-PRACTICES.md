# N8N Best Practices & Architecture Patterns

Guide complet des meilleures pratiques pour créer des workflows N8N professionnels, robustes et maintenables.

## 📚 Table des Matières

1. [Principes Fondamentaux](#principes-fondamentaux)
2. [Architecture des Workflows](#architecture-des-workflows)
3. [Gestion des Erreurs](#gestion-des-erreurs)
4. [Performance & Optimisation](#performance--optimisation)
5. [Sécurité](#sécurité)
6. [Testing & Debugging](#testing--debugging)
7. [Documentation](#documentation)
8. [Patterns Courants](#patterns-courants)

---

## Principes Fondamentaux

### ✅ KISS - Keep It Simple, Stupid

**Mauvais** ❌
```
Webhook → Function (100 lignes) → Function (150 lignes) → HTTP Request
```

**Bon** ✅
```
Webhook → Validation → Transformation → HTTP Request
```

- Décomposer la logique complexe en nodes simples
- Un node = une responsabilité claire
- Éviter les mega-functions de 500 lignes

### ✅ DRY - Don't Repeat Yourself

Au lieu de répéter la même logique :
```javascript
// Dans plusieurs nodes
const email = data.email.trim().toLowerCase();
```

Créer un node réutilisable ou utiliser des sub-workflows.

### ✅ Fail Fast

Valider les données dès le début du workflow :
```
Trigger → VALIDATION → Processing → Output
         ↓ (if invalid)
      Error Response
```

Ne pas attendre 10 nodes avant de détecter un email invalide.

### ✅ Idempotence

Un workflow doit produire le même résultat s'il est exécuté plusieurs fois :
- Utiliser des clés uniques (IDs, timestamps)
- Vérifier l'existence avant d'insérer
- Gérer les doublons gracieusement

---

## Architecture des Workflows

### Pattern 1 : Pipeline Linéaire

**Usage** : Transformation simple de données

```
Input → Validate → Transform → Enrich → Output
```

**Exemple** : Webhook → Validation → Database Insert → Email

**Avantages** :
- Simple à comprendre
- Facile à débugger
- Prévisible

**Inconvénients** :
- Pas flexible
- Difficile à paralléliser

### Pattern 2 : Branching Conditionnel

**Usage** : Logique métier avec conditions

```
Input → IF
        ├─ TRUE → Action A → Merge
        └─ FALSE → Action B → Merge
                              ↓
                          Continue
```

**Exemple** : Commande > 500€ → Validation manuelle, sinon auto-approve

**Best Practices** :
- Toujours merger les branches
- Documenter les conditions
- Éviter les branches trop profondes (max 3 niveaux)

### Pattern 3 : Fan-Out / Fan-In

**Usage** : Opérations parallèles

```
Input → Split
        ├─ API A ─┐
        ├─ API B ─┤
        └─ API C ─┘
               ↓
            Merge → Aggregate
```

**Exemple** : Enrichir un contact depuis 3 sources (Clearbit, LinkedIn, Hunter)

**Avantages** :
- Performance (parallélisation)
- Résilience (une API échoue, les autres continuent)

**Best Practices** :
- Toujours merger après le split
- Gérer les erreurs individuellement
- Timeout pour éviter les blocages

### Pattern 4 : Event-Driven

**Usage** : Réaction à des événements

```
Trigger (Event) → IF (Event Type)
                  ├─ Type A → Workflow A
                  ├─ Type B → Workflow B
                  └─ Type C → Workflow C
```

**Exemple** : Webhook Stripe → IF (invoice.paid, subscription.created, etc.)

**Best Practices** :
- Un workflow par type d'événement (séparation)
- Logger tous les événements
- Gérer les événements inconnus

### Pattern 5 : Saga Pattern (Long-Running)

**Usage** : Opérations longues avec compensation

```
Step 1 → Step 2 → Step 3 → Success
  ↓        ↓        ↓
 Undo 1 ← Undo 2 ← Undo 3 ← Failure
```

**Exemple** : Commande → Payment → Inventory → Shipping
- Si Shipping échoue → Rollback Inventory → Refund Payment

**Best Practices** :
- Définir une stratégie de compensation pour chaque étape
- Logger l'état à chaque step
- Utiliser des transactions quand possible

---

## Gestion des Erreurs

### Niveau 1 : Node-Level Error Handling

```javascript
try {
  const result = performOperation($input.item.json);
  return { json: result };
} catch (error) {
  // Log l'erreur
  console.error('Operation failed:', error);

  // Retourner une erreur structurée
  throw new Error(JSON.stringify({
    code: 'OPERATION_FAILED',
    message: error.message,
    input: $input.item.json,
  }));
}
```

### Niveau 2 : Workflow-Level Error Handling

```
Main Flow
   ↓
[Error Trigger] → Format Error → Notify Team → Log to Service
```

**Configuration du node** :
- Continue On Fail: No (par défaut)
- Retry On Fail: Yes (pour nodes critiques)
- Max Tries: 3
- Wait Between Tries: 1000ms

### Niveau 3 : Global Error Handling

Créer un workflow dédié aux erreurs :

```
Error Webhook (from all workflows)
   ↓
Classify Error (Critical, Warning, Info)
   ↓
IF Critical
   ├─ TRUE → PagerDuty + Slack #critical
   └─ FALSE → Log + Slack #errors
```

### Best Practices

1. **Erreurs attendues vs inattendues**
   - Attendues : Validation, 404, etc. → Gérer gracieusement
   - Inattendues : 500, timeout, etc. → Alerter l'équipe

2. **Ne pas masquer les erreurs**
   ```javascript
   // ❌ MAUVAIS
   try {
     doSomething();
   } catch {
     // Silent fail - JAMAIS ÇA !
   }

   // ✅ BON
   try {
     doSomething();
   } catch (error) {
     console.error('Error:', error);
     throw error; // ou gérer explicitement
   }
   ```

3. **Contexte dans les erreurs**
   ```javascript
   throw new Error(`Failed to create user: ${email} - ${error.message}`);
   ```

4. **Différencier les erreurs**
   ```javascript
   class ValidationError extends Error {
     constructor(message) {
       super(message);
       this.name = 'ValidationError';
     }
   }

   class ApiError extends Error {
     constructor(message, statusCode) {
       super(message);
       this.name = 'ApiError';
       this.statusCode = statusCode;
     }
   }
   ```

---

## Performance & Optimisation

### 1. Minimiser les Appels API

**Mauvais** ❌
```
For Each Item (100 items)
  → HTTP Request (API)
```
= 100 requêtes !

**Bon** ✅
```
Batch Items (50 per batch)
  → HTTP Request (Bulk API)
```
= 2 requêtes !

### 2. Utiliser la Pagination

```javascript
async function fetchAllPages(url) {
  let allData = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await $http.get(`${url}?page=${page}&limit=100`);
    const data = await response.json();

    allData = allData.concat(data.results);
    hasMore = data.results.length === 100;
    page++;
  }

  return allData;
}
```

### 3. Caching

```javascript
// Utiliser $static pour cacher des données
const cacheKey = 'user_list';
const cacheDuration = 5 * 60 * 1000; // 5 minutes

let cached = $static.get(cacheKey);

if (cached && Date.now() < cached.expiresAt) {
  return { json: cached.data };
}

// Fetch fresh data
const data = await fetchUsers();

$static.set(cacheKey, {
  data,
  expiresAt: Date.now() + cacheDuration,
});

return { json: data };
```

### 4. Parallélisation

```
Split In Batches (10 parallel)
  → HTTP Request
Merge
```

Au lieu de :
```
Loop Over Items (sequential)
  → HTTP Request
```

### 5. Éviter les Boucles Infinies

```javascript
const MAX_ITERATIONS = 1000;
let iterations = 0;

while (condition) {
  iterations++;

  if (iterations > MAX_ITERATIONS) {
    throw new Error('Max iterations exceeded, possible infinite loop');
  }

  // ... logique
}
```

### 6. Rate Limiting

```javascript
// Respect des limites API
const REQUESTS_PER_MINUTE = 60;
const delay = 60000 / REQUESTS_PER_MINUTE;

// Attendre entre les requêtes
await new Promise(resolve => setTimeout(resolve, delay));
```

---

## Sécurité

### 1. Jamais de Credentials en Dur

**Mauvais** ❌
```javascript
const apiKey = 'sk_live_123456789';
```

**Bon** ✅
```javascript
const apiKey = $credentials.api.key;
// ou
const apiKey = $env.API_KEY;
```

### 2. Validation des Inputs

```javascript
// Sanitize user input
function sanitize(input) {
  return input
    .replace(/[<>]/g, '') // XSS basique
    .trim()
    .substring(0, 1000); // Limite de longueur
}

const userInput = sanitize($input.item.json.comment);
```

### 3. Authentification Webhook

```javascript
// Vérifier la signature
const signature = $node.params.headers['x-webhook-signature'];
const payload = JSON.stringify($input.item.json);
const secret = $env.WEBHOOK_SECRET;

const expectedSignature = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');

if (signature !== expectedSignature) {
  throw new Error('Invalid webhook signature');
}
```

### 4. Principle of Least Privilege

- Utiliser des API keys avec permissions minimales
- Read-only quand possible
- Scoped tokens (ex: Stripe restricted keys)

### 5. Données Sensibles

```javascript
// Ne jamais logger des données sensibles
const user = $input.item.json;

console.log({
  id: user.id,
  email: user.email,
  // ❌ NE PAS logger : password, credit_card, ssn, etc.
});

// Si nécessaire, masquer
const maskedCard = user.credit_card.replace(/\d(?=\d{4})/g, '*');
```

---

## Testing & Debugging

### 1. Test avec des Données Réelles

Créer un node "Test Data" :
```javascript
return [
  { json: { id: 1, email: 'test1@example.com' } },
  { json: { id: 2, email: 'test2@example.com' } },
  { json: { id: 3, email: 'invalid-email' } }, // Edge case
];
```

### 2. Logging Stratégique

```javascript
// Au début
console.log('=== Starting workflow ===');
console.log('Input:', $input.item.json);

// Points clés
console.log('After validation:', validatedData);
console.log('API Response:', response);

// À la fin
console.log('=== Workflow completed ===');
console.log('Output:', result);
```

### 3. Assertions

```javascript
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

const user = $input.item.json;
assert(user.email, 'Email is required');
assert(user.id > 0, 'ID must be positive');
```

### 4. Debug Mode

```javascript
const DEBUG = $env.DEBUG === 'true';

if (DEBUG) {
  console.log('Debug - Full context:', {
    input: $input.all(),
    node: $node,
    workflow: $workflow,
    execution: $execution,
  });
}
```

### 5. Dry Run

```javascript
const DRY_RUN = $env.DRY_RUN === 'true';

if (!DRY_RUN) {
  // Exécuter l'opération réelle
  await createInvoice(data);
} else {
  console.log('DRY RUN - Would create invoice:', data);
}

return { json: { ...data, dryRun: DRY_RUN } };
```

---

## Documentation

### 1. Nommage des Nodes

**Mauvais** ❌
- HTTP Request
- HTTP Request 1
- Function

**Bon** ✅
- Fetch User from API
- Validate Email Format
- Transform to CRM Format

### 2. Notes sur les Nodes

Chaque node complexe doit avoir une note expliquant :
- **Quoi** : Que fait ce node ?
- **Pourquoi** : Pourquoi cette approche ?
- **Attention** : Points d'attention (rate limits, coûts, etc.)

```
📝 Note :
Fetches user data from HubSpot API.
Rate limit: 100 req/10s.
Retry enabled (3x) for transient errors.
```

### 3. Description du Workflow

En haut du workflow, ajouter un node "Sticky Note" :

```
🎯 OBJECTIF
Synchroniser les commandes Shopify vers le CRM quotidiennement.

📋 PRÉREQUIS
- Credentials: Shopify, HubSpot, Slack
- Env vars: SHOPIFY_SHOP_URL, HUBSPOT_API_KEY

⚙️ CONFIGURATION
- Schedule: Tous les jours à 2h du matin
- Batch size: 100 commandes par run

🔍 MONITORING
- Slack notifications: #sales-sync
- Logs: CloudWatch logs/n8n/shopify-sync

📊 MÉTRIQUES
- Durée moyenne: 5 min
- Commandes/jour: ~200
- Taux d'erreur: < 1%
```

### 4. Changelog

Tenir un changelog dans les notes du workflow :

```
📅 CHANGELOG

2026-02-08 - v1.2.0
- Ajout gestion des commandes > 500€
- Optimisation: batch API calls

2026-01-15 - v1.1.0
- Ajout notifications Slack
- Fix: doublons CRM

2025-12-01 - v1.0.0
- Version initiale
```

---

## Patterns Courants

### Pattern : Deduplication

```
Fetch Items
  ↓
Function (Remove Duplicates)
  ↓
Process Unique Items
```

```javascript
const items = $input.all();
const seen = new Set();

return items.filter(item => {
  const key = item.json.email; // ou item.json.id
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});
```

### Pattern : Upsert (Insert or Update)

```
Check if Exists
  ↓
IF Exists
  ├─ TRUE → Update
  └─ FALSE → Insert
```

```javascript
// Dans un Function node
const email = $input.item.json.email;

// Check in database
const exists = await checkIfUserExists(email);

return {
  json: {
    ...$input.item.json,
    operation: exists ? 'update' : 'insert',
    userId: exists ? exists.id : null,
  }
};
```

### Pattern : Enrichment Pipeline

```
Base Data
  ↓
Enrich from API A (add field X)
  ↓
Enrich from API B (add field Y)
  ↓
Enrich from API C (add field Z)
  ↓
Complete Data
```

### Pattern : Webhook + Queue

```
Webhook → Validate → Add to Queue (Redis/RabbitMQ)
                          ↓
              [Separate Workflow]
                  Process Queue
                      ↓
                  Do Heavy Work
```

**Avantages** :
- Réponse immédiate au webhook
- Pas de timeout
- Retry facile
- Backpressure handling

### Pattern : Aggregation

```
Trigger (Schedule - Daily)
  ↓
Fetch All Orders (Last 24h)
  ↓
Aggregate (Group by Product)
  ↓
Generate Report
  ↓
Send Email
```

---

## Checklist Finale

Avant de mettre en production un workflow :

- [ ] **Fonctionnel**
  - [ ] Testé avec données réelles
  - [ ] Edge cases gérés
  - [ ] Erreurs gérées proprement

- [ ] **Performance**
  - [ ] Appels API optimisés (batch, cache)
  - [ ] Pas de boucles infinies possibles
  - [ ] Timeout configurés

- [ ] **Sécurité**
  - [ ] Pas de credentials en dur
  - [ ] Inputs validés
  - [ ] Webhook authentifié

- [ ] **Monitoring**
  - [ ] Logs appropriés
  - [ ] Alertes configurées
  - [ ] Métriques collectées

- [ ] **Documentation**
  - [ ] Nodes nommés clairement
  - [ ] Notes sur logique complexe
  - [ ] README workflow

- [ ] **Maintenance**
  - [ ] Credentials documentés
  - [ ] Env vars documentées
  - [ ] Contact responsable défini

---

**En suivant ces best practices, vous créerez des workflows N8N robustes, maintenables et professionnels ! 🚀**
