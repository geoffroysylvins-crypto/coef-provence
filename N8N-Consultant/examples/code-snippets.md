# N8N Code Snippets - Bibliothèque Réutilisable

Collection de snippets de code testés et optimisés pour N8N.

## 📋 Table des Matières

- [Validation de Données](#validation-de-données)
- [Transformation de Données](#transformation-de-données)
- [Gestion des Erreurs](#gestion-des-erreurs)
- [Retry Logic](#retry-logic)
- [API Helpers](#api-helpers)
- [Date & Time](#date--time)
- [String Manipulation](#string-manipulation)
- [Array Operations](#array-operations)

---

## Validation de Données

### Valider les champs requis
```javascript
// Dans un Function node
const data = $input.item.json;
const requiredFields = ['email', 'name', 'phone', 'company'];

const missingFields = requiredFields.filter(field => !data[field]);

if (missingFields.length > 0) {
  throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
}

return { json: data };
```

### Valider le format email
```javascript
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

const email = $input.item.json.email;

if (!isValidEmail(email)) {
  throw new Error(`Invalid email format: ${email}`);
}

return { json: $input.item.json };
```

### Valider un numéro de téléphone
```javascript
function isValidPhone(phone) {
  // Format international : +33612345678
  const regex = /^\+?[1-9]\d{1,14}$/;
  return regex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

const phone = $input.item.json.phone;

if (!isValidPhone(phone)) {
  throw new Error(`Invalid phone number: ${phone}`);
}

return { json: $input.item.json };
```

### Valider une URL
```javascript
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

const url = $input.item.json.website;

if (!isValidUrl(url)) {
  throw new Error(`Invalid URL: ${url}`);
}

return { json: $input.item.json };
```

---

## Transformation de Données

### Nettoyer et normaliser un email
```javascript
const email = $input.item.json.email;

return {
  json: {
    ...$input.item.json,
    email: email.trim().toLowerCase()
  }
};
```

### Formater un numéro de téléphone
```javascript
function formatPhone(phone) {
  // Enlever tous les caractères non-numériques sauf le +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Ajouter +33 si commence par 0 (France)
  if (cleaned.startsWith('0')) {
    return '+33' + cleaned.substring(1);
  }

  // Ajouter + si manquant
  if (!cleaned.startsWith('+')) {
    return '+' + cleaned;
  }

  return cleaned;
}

const phone = $input.item.json.phone;

return {
  json: {
    ...$input.item.json,
    phone: formatPhone(phone)
  }
};
```

### Mapper des données entre deux formats
```javascript
// Source: API A → Destination: API B
const source = $input.item.json;

const mapped = {
  // Mapping simple
  email: source.email_address,
  firstName: source.first_name,
  lastName: source.last_name,

  // Transformation
  fullName: `${source.first_name} ${source.last_name}`,

  // Valeur par défaut
  country: source.country || 'FR',

  // Condition
  status: source.is_active ? 'active' : 'inactive',

  // Nested data
  address: {
    street: source.address?.street,
    city: source.address?.city,
    zipCode: source.address?.zip,
  },

  // Array transformation
  tags: source.categories?.map(cat => cat.name) || [],

  // Date conversion
  createdAt: new Date(source.created_timestamp).toISOString(),
};

return { json: mapped };
```

### Aplatir un objet nested
```javascript
function flattenObject(obj, prefix = '') {
  let result = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}_${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

const nested = $input.item.json;
const flat = flattenObject(nested);

return { json: flat };

// Input:  { user: { name: "John", address: { city: "Paris" } } }
// Output: { user_name: "John", user_address_city: "Paris" }
```

---

## Gestion des Erreurs

### Wrapper d'erreur avec contexte
```javascript
try {
  // Votre logique métier ici
  const result = someOperation($input.item.json);

  return { json: result };

} catch (error) {
  // Enrichir l'erreur avec du contexte
  const enrichedError = {
    message: error.message,
    stack: error.stack,
    input: $input.item.json,
    node: $node.name,
    workflow: $workflow.name,
    executionId: $execution.id,
    timestamp: new Date().toISOString(),
  };

  // Log l'erreur (peut être envoyé à un service externe)
  console.error('Error details:', enrichedError);

  // Relancer l'erreur pour activer l'Error Trigger
  throw new Error(JSON.stringify(enrichedError));
}
```

### Validation avec erreurs détaillées
```javascript
const data = $input.item.json;
const errors = [];

// Valider plusieurs champs
if (!data.email) errors.push('Email is required');
else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
  errors.push('Email format is invalid');
}

if (!data.name) errors.push('Name is required');
else if (data.name.length < 2) {
  errors.push('Name must be at least 2 characters');
}

if (data.age && (data.age < 0 || data.age > 120)) {
  errors.push('Age must be between 0 and 120');
}

// Si erreurs, les retourner
if (errors.length > 0) {
  throw new Error(`Validation failed:\n${errors.join('\n')}`);
}

return { json: data };
```

---

## Retry Logic

### Retry avec exponential backoff
```javascript
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Utilisation avec une requête HTTP
const result = await retryWithBackoff(async () => {
  const response = await $http.get('https://api.example.com/data');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
});

return { json: result };
```

### Retry uniquement pour certaines erreurs
```javascript
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

// Erreurs qui justifient un retry
const RETRYABLE_ERRORS = [
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
  '429', // Rate limit
  '500', // Server error
  '502', // Bad gateway
  '503', // Service unavailable
];

function isRetryable(error) {
  return RETRYABLE_ERRORS.some(code =>
    error.message.includes(code) || error.code === code
  );
}

let lastError;

for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
  try {
    // Votre opération ici
    const result = await performOperation();
    return { json: result };

  } catch (error) {
    lastError = error;

    if (!isRetryable(error)) {
      // Erreur non-retryable, fail immédiatement
      throw error;
    }

    if (attempt < MAX_RETRIES) {
      console.log(`Attempt ${attempt} failed (retryable), waiting ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
}

throw new Error(`All ${MAX_RETRIES} attempts failed: ${lastError.message}`);
```

---

## API Helpers

### Rate Limiting
```javascript
// Dans le workflow context (à stocker globalement)
const RATE_LIMIT = 100; // requêtes par minute
const RATE_WINDOW = 60000; // 1 minute en ms

// Récupérer le compteur depuis le static data
let counter = $static.get('apiCounter') || { count: 0, resetAt: Date.now() + RATE_WINDOW };

// Reset si la fenêtre est expirée
if (Date.now() > counter.resetAt) {
  counter = { count: 0, resetAt: Date.now() + RATE_WINDOW };
}

// Vérifier la limite
if (counter.count >= RATE_LIMIT) {
  const waitTime = counter.resetAt - Date.now();
  throw new Error(`Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)}s`);
}

// Incrémenter
counter.count++;
$static.set('apiCounter', counter);

// Continuer avec l'appel API
return { json: $input.item.json };
```

### Pagination automatique
```javascript
async function fetchAllPages(baseUrl, params = {}) {
  let allResults = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${baseUrl}?${new URLSearchParams({ ...params, page, limit: 100 })}`;
    const response = await $http.get(url);
    const data = await response.json();

    allResults = allResults.concat(data.results);

    // Adapter selon l'API (data.hasMore, data.next, etc.)
    hasMore = data.results.length === 100;
    page++;

    // Protection contre les boucles infinies
    if (page > 1000) {
      throw new Error('Too many pages, possible infinite loop');
    }
  }

  return allResults;
}

const results = await fetchAllPages('https://api.example.com/items');
return results.map(item => ({ json: item }));
```

### Authentification avec token refresh
```javascript
// Stocker les tokens dans Static Data
let tokens = $static.get('apiTokens') || {};

async function getValidToken() {
  // Si pas de token ou expiré
  if (!tokens.access || Date.now() > tokens.expiresAt) {

    // Si refresh token disponible
    if (tokens.refresh) {
      const response = await $http.post('https://api.example.com/auth/refresh', {
        refresh_token: tokens.refresh
      });
      const data = await response.json();

      tokens = {
        access: data.access_token,
        refresh: data.refresh_token,
        expiresAt: Date.now() + (data.expires_in * 1000),
      };
    } else {
      // Sinon, nouvelle authentification
      const response = await $http.post('https://api.example.com/auth/login', {
        client_id: $env.API_CLIENT_ID,
        client_secret: $env.API_CLIENT_SECRET,
      });
      const data = await response.json();

      tokens = {
        access: data.access_token,
        refresh: data.refresh_token || null,
        expiresAt: Date.now() + (data.expires_in * 1000),
      };
    }

    $static.set('apiTokens', tokens);
  }

  return tokens.access;
}

// Utilisation
const token = await getValidToken();
const response = await $http.get('https://api.example.com/data', {
  headers: { Authorization: `Bearer ${token}` }
});

return { json: await response.json() };
```

---

## Date & Time

### Formater une date
```javascript
const timestamp = $input.item.json.created_at;

return {
  json: {
    iso: new Date(timestamp).toISOString(),
    date: new Date(timestamp).toISOString().split('T')[0], // YYYY-MM-DD
    time: new Date(timestamp).toTimeString().split(' ')[0], // HH:MM:SS
    unix: Math.floor(new Date(timestamp).getTime() / 1000),
    human: new Date(timestamp).toLocaleString('fr-FR'),
  }
};
```

### Calculer une différence de dates
```javascript
function dateDiffInDays(date1, date2) {
  const ms = Math.abs(new Date(date2) - new Date(date1));
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

const created = $input.item.json.created_at;
const now = new Date();
const daysAgo = dateDiffInDays(created, now);

return {
  json: {
    ...$input.item.json,
    days_since_creation: daysAgo,
  }
};
```

### Ajouter/soustraire du temps
```javascript
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

const today = new Date();

return {
  json: {
    today: today.toISOString(),
    tomorrow: addDays(today, 1).toISOString(),
    nextWeek: addDays(today, 7).toISOString(),
    lastMonth: addDays(today, -30).toISOString(),
  }
};
```

---

## String Manipulation

### Slugify
```javascript
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/[^\w\s-]/g, '') // Enlever les caractères spéciaux
    .replace(/\s+/g, '-') // Espaces → tirets
    .replace(/--+/g, '-') // Tirets multiples → tiret simple
    .trim();
}

const title = $input.item.json.title;

return {
  json: {
    ...$input.item.json,
    slug: slugify(title),
  }
};

// "Café au Lait!" → "cafe-au-lait"
```

### Extraire un domaine d'un email
```javascript
function getDomainFromEmail(email) {
  return email.split('@')[1];
}

const email = $input.item.json.email;

return {
  json: {
    ...$input.item.json,
    domain: getDomainFromEmail(email),
  }
};

// "john@company.com" → "company.com"
```

### Truncate avec ellipsis
```javascript
function truncate(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

const description = $input.item.json.description;

return {
  json: {
    ...$input.item.json,
    shortDescription: truncate(description, 150),
  }
};
```

---

## Array Operations

### Dédupliquer un array
```javascript
const items = $input.all();

// Dédupliquer par une propriété (ex: email)
const uniqueItems = items.filter((item, index, self) =>
  index === self.findIndex(t => t.json.email === item.json.email)
);

return uniqueItems;
```

### Grouper par propriété
```javascript
const items = $input.all();

// Grouper par catégorie
const grouped = items.reduce((acc, item) => {
  const category = item.json.category;
  if (!acc[category]) acc[category] = [];
  acc[category].push(item.json);
  return acc;
}, {});

return Object.entries(grouped).map(([category, items]) => ({
  json: { category, items, count: items.length }
}));
```

### Trier un array
```javascript
const items = $input.all();

// Trier par date (plus récent en premier)
const sorted = items.sort((a, b) =>
  new Date(b.json.created_at) - new Date(a.json.created_at)
);

return sorted;
```

### Batching
```javascript
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

const items = $input.all();
const batches = chunkArray(items, 50); // Batch de 50

return batches.map((batch, index) => ({
  json: {
    batchNumber: index + 1,
    items: batch,
    count: batch.length,
  }
}));
```

---

## 💡 Tips d'Utilisation

1. **Toujours tester** les snippets avec vos données réelles
2. **Adapter** les validations selon vos besoins métier
3. **Logger** les étapes importantes pour faciliter le debugging
4. **Commenter** le code pour la maintenance future
5. **Utiliser $static** pour stocker des états entre exécutions
6. **Gérer les erreurs** pour éviter les workflows cassés

Ces snippets sont un point de départ. Adaptez-les à vos cas d'usage spécifiques !
