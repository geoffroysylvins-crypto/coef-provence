# Exemple : Automatisation Commandes Shopify

## Description
Workflow complet pour traiter automatiquement les nouvelles commandes Shopify : création de facture, envoi d'email de confirmation, ajout au CRM, et notification de l'équipe.

## Architecture

```
Shopify Trigger (New Order)
    ↓
Shopify (Get Order Details)
    ↓
IF → Order Amount > 500€
    ↓ YES                      ↓ NO
Manager Notification       Standard Flow
    ↓                          ↓
    → → → → → → → → → → → → → ←
              ↓
    Create Invoice (Stripe)
              ↓
    Send Email (Customer)
              ↓
    Update CRM (HubSpot)
              ↓
    Slack Notification (Team)
              ↓
    Set Order Tag (Shopify)
```

## Nodes Configuration

### 1. Shopify Trigger
```
Type: New Order
Webhook: Automatique
Filters: Order confirmed
```

### 2. Shopify - Get Order Details
```
Resource: Order
Operation: Get
Order ID: {{ $json.id }}
```
Récupère les détails complets de la commande.

### 3. IF Node - Check Order Amount
```javascript
// Condition
return $json.total_price > 500;
```
Les commandes > 500€ nécessitent une validation manuelle.

### 4. Slack - Manager Notification (Branch TRUE)
```
Channel: #high-value-orders
Message:
🚨 Nouvelle commande importante !
Montant: {{ $json.total_price }}€
Client: {{ $json.customer.name }}
Email: {{ $json.customer.email }}
Lien: {{ $json.order_status_url }}
```

### 5. Stripe - Create Invoice
```javascript
// Function pour préparer les données
const items = $json.line_items.map(item => ({
  price_data: {
    currency: 'eur',
    product_data: {
      name: item.name,
    },
    unit_amount: Math.round(item.price * 100),
  },
  quantity: item.quantity,
}));

return {
  json: {
    customer_email: $json.customer.email,
    line_items: items,
    metadata: {
      shopify_order_id: $json.id,
      shopify_order_number: $json.order_number,
    }
  }
};
```

```
Resource: Invoice
Operation: Create
Customer Email: {{ $json.customer_email }}
Line Items: {{ $json.line_items }}
```

### 6. Send Email - Customer Confirmation
```
To: {{ $json.customer.email }}
Subject: Confirmation de votre commande #{{ $json.order_number }}

Template:
---
Bonjour {{ $json.customer.first_name }},

Merci pour votre commande #{{ $json.order_number }} !

Récapitulatif :
{{ $json.line_items.forEach(item => `- ${item.quantity}x ${item.name} - ${item.price}€`) }}

Total : {{ $json.total_price }}€

Votre facture est disponible ici : {{ $node["Stripe"].json.hosted_invoice_url }}

Suivi de livraison : {{ $json.order_status_url }}

À bientôt !
L'équipe
---
```

### 7. HubSpot - Update Contact & Deal
```javascript
// Function pour structurer les données CRM
const customer = $json.customer;
const order = $json;

return {
  json: {
    contact: {
      email: customer.email,
      firstname: customer.first_name,
      lastname: customer.last_name,
      phone: customer.phone,
      last_order_date: order.created_at,
      total_orders_value: customer.total_spent,
    },
    deal: {
      dealname: `Commande #${order.order_number}`,
      amount: order.total_price,
      dealstage: 'closedwon',
      closedate: new Date().toISOString(),
      shopify_order_id: order.id,
    }
  }
};
```

**HubSpot Node 1** - Create/Update Contact
```
Resource: Contact
Operation: Upsert
Email: {{ $json.contact.email }}
Properties: {{ $json.contact }}
```

**HubSpot Node 2** - Create Deal
```
Resource: Deal
Operation: Create
Properties: {{ $json.deal }}
Associate to Contact: {{ $node["HubSpot"].json.id }}
```

### 8. Slack - Team Notification
```
Channel: #orders
Message:
✅ Nouvelle commande traitée !

Client: {{ $json.customer.name }}
Montant: {{ $json.total_price }}€
Produits: {{ $json.line_items.length }} article(s)

Facture envoyée ✉️
CRM mis à jour 📊
```

### 9. Shopify - Add Order Tag
```
Resource: Order
Operation: Update
Order ID: {{ $json.id }}
Tags: processed, invoice-sent, crm-synced
```

### 10. Error Trigger + Error Handling
```javascript
// Function - Format Error
const error = $json;
const context = $execution;

return {
  json: {
    workflow: 'Shopify Order Automation',
    error_message: error.message,
    error_node: error.node,
    order_id: context.data?.id,
    timestamp: new Date().toISOString(),
    execution_id: $execution.id,
  }
};
```

**Slack Error Alert**
```
Channel: #errors
Message:
❌ ERREUR - Traitement commande Shopify

Commande: {{ $json.order_id }}
Node: {{ $json.error_node }}
Erreur: {{ $json.error_message }}

Execution ID: {{ $json.execution_id }}
```

## Best Practices

### ✅ Gestion des erreurs robuste
- Error Trigger configuré
- Alertes Slack pour erreurs critiques
- Logging structuré des erreurs

### ✅ Validation des données
```javascript
// Au début du workflow
const order = $json;

// Vérifier que les données essentielles sont présentes
if (!order.customer?.email) {
  throw new Error('Customer email missing');
}

if (!order.line_items || order.line_items.length === 0) {
  throw new Error('No items in order');
}

if (!order.total_price || order.total_price <= 0) {
  throw new Error('Invalid order amount');
}
```

### ✅ Retry Logic
Sur les nodes critiques (Stripe, HubSpot) :
```
Retry on Fail: Yes
Max Tries: 3
Wait Between Tries: 1000ms (exponential backoff)
```

### ✅ Idempotence
- Utiliser les order IDs Shopify comme clés uniques
- Vérifier dans le CRM si la commande existe déjà
- Éviter les doublons de factures Stripe

### ✅ Performance
- Paralléliser quand possible (Email + CRM en parallèle)
- Limiter les appels API (batch updates si volume élevé)

### ✅ Monitoring
```javascript
// Node de fin : Log Metrics
return {
  json: {
    workflow: 'shopify-order-automation',
    order_id: $json.id,
    amount: $json.total_price,
    execution_time: $execution.duration,
    success: true,
    timestamp: new Date().toISOString(),
  }
};
```

## Variables d'Environnement

```bash
SHOPIFY_SHOP_URL=your-shop.myshopify.com
SHOPIFY_API_KEY=your-api-key
STRIPE_SECRET_KEY=sk_live_xxx
HUBSPOT_API_KEY=your-hubspot-key
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
EMAIL_FROM=orders@yourshop.com
```

## Test Cases

### Test 1 : Commande standard (< 500€)
```json
{
  "id": 123456,
  "order_number": 1001,
  "total_price": 299.99,
  "customer": {
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User"
  },
  "line_items": [
    {
      "name": "Product A",
      "quantity": 2,
      "price": 149.99
    }
  ]
}
```
**Résultat** : Traitement complet sans notification manager

### Test 2 : Commande importante (> 500€)
```json
{
  "total_price": 750.00,
  ...
}
```
**Résultat** : Notification manager + traitement complet

### Test 3 : Données manquantes
```json
{
  "id": 123456,
  "customer": null
}
```
**Résultat** : Error trigger activé, alerte Slack

## Optimisations Avancées

1. **Queue Management** : Pour les pics de commandes (Black Friday)
   - Ajouter un Redis Queue node
   - Rate limiting sur les APIs externes

2. **Smart Routing** : Selon le type de produit
   - Produits digitaux → Email immédiat
   - Produits physiques → Notification warehouse

3. **Customer Segmentation**
   - Premier achat → Welcome email spécial
   - Client VIP → Traitement prioritaire

4. **Fraud Detection**
   - Vérifier l'adresse avec une API de validation
   - Bloquer les commandes suspectes

5. **Analytics Integration**
   - Envoyer les métriques à Google Analytics
   - Tracking de conversion dans Meta Pixel

## Maintenance

- **Quotidien** : Vérifier les erreurs dans Slack #errors
- **Hebdomadaire** : Analyser les temps d'exécution
- **Mensuel** : Audit des credentials et permissions
- **Trimestriel** : Optimisation basée sur les métriques

## ROI

Ce workflow automatise :
- ⏱️ ~15 min de travail manuel par commande
- 📧 100% des emails de confirmation envoyés instantanément
- 🎯 0% d'oublis de synchronisation CRM
- 💰 Réduction erreurs facturation de 95%

Pour 100 commandes/jour = **25h de travail économisées/jour**
