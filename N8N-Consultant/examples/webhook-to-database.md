# Exemple : Webhook → Traitement → Database

## Description
Ce workflow reçoit des données via webhook, les valide, les transforme et les stocke dans une base de données PostgreSQL.

## Architecture

```
Webhook → Validation → Transformation → PostgreSQL → Success Response
    ↓ (if error)
Error Trigger → Log Error → Slack Notification
```

## Nodes Utilisés

1. **Webhook** (Trigger)
   - Method: POST
   - Path: `/api/leads`
   - Authentication: Header Auth

2. **Function** (Validation)
   ```javascript
   // Valider les données entrantes
   const requiredFields = ['email', 'name', 'phone'];
   const data = $input.item.json;

   for (const field of requiredFields) {
     if (!data[field]) {
       throw new Error(`Missing required field: ${field}`);
     }
   }

   // Valider le format email
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   if (!emailRegex.test(data.email)) {
     throw new Error('Invalid email format');
   }

   return { json: data };
   ```

3. **Function** (Transformation)
   ```javascript
   const data = $input.item.json;

   return {
     json: {
       email: data.email.toLowerCase(),
       name: data.name.trim(),
       phone: data.phone.replace(/\s/g, ''),
       source: data.source || 'website',
       created_at: new Date().toISOString(),
       status: 'new'
     }
   };
   ```

4. **PostgreSQL**
   - Operation: Insert
   - Table: `leads`
   - Columns: Mapping automatique depuis les données transformées

5. **Respond to Webhook**
   - Status Code: 200
   - Response Body:
   ```json
   {
     "success": true,
     "message": "Lead créé avec succès",
     "id": "{{ $json.id }}"
   }
   ```

6. **Error Trigger**
   - Activé en cas d'erreur dans le workflow

7. **HTTP Request** (Log to monitoring service)
   - URL: Service de logging
   - Method: POST
   - Body: Détails de l'erreur

8. **Slack**
   - Channel: #alerts
   - Message: Notification d'erreur avec détails

## Configuration

### Credentials
- **Webhook Auth**: Header avec clé API
- **PostgreSQL**: Connection string avec SSL
- **Slack**: OAuth token

### Variables d'environnement
- `DB_HOST`: Adresse de la base de données
- `DB_NAME`: Nom de la base
- `SLACK_CHANNEL`: Canal de notification

## Best Practices Implémentées

✅ **Validation des données** : Vérification des champs requis et formats
✅ **Transformation cohérente** : Normalisation (lowercase email, trim name)
✅ **Gestion d'erreurs** : Error Trigger avec logging et alertes
✅ **Sécurité** : Authentification webhook, credentials sécurisés
✅ **Logging** : Envoi des erreurs à un service de monitoring
✅ **Notifications** : Alerte Slack pour les erreurs critiques
✅ **Idempotence** : Peut être rejoué sans créer de doublons (avec unique constraint sur email)

## Test

### Test case 1 : Données valides
```json
POST /api/leads
{
  "email": "john.doe@example.com",
  "name": "John Doe",
  "phone": "+33 6 12 34 56 78",
  "source": "landing-page"
}
```

**Résultat attendu** : Lead créé, réponse 200

### Test case 2 : Email invalide
```json
POST /api/leads
{
  "email": "invalid-email",
  "name": "Jane Doe",
  "phone": "+33 6 12 34 56 78"
}
```

**Résultat attendu** : Erreur de validation, alerte Slack

### Test case 3 : Champ manquant
```json
POST /api/leads
{
  "email": "jane@example.com",
  "name": "Jane Doe"
}
```

**Résultat attendu** : Erreur "Missing required field: phone", alerte Slack

## Optimisations Possibles

1. **Déduplication** : Vérifier si le lead existe déjà avant insertion
2. **Rate limiting** : Ajouter un node de rate limiting pour éviter les abus
3. **Enrichissement** : Appeler une API d'enrichissement de données (Clearbit, etc.)
4. **Queue** : Utiliser une queue (Redis) pour gérer les pics de charge
5. **Retry logic** : Ajouter des retry pour les erreurs temporaires (DB connection, etc.)

## Maintenance

- Vérifier régulièrement les logs d'erreurs
- Monitorer le temps d'exécution moyen
- Adapter la validation selon les nouveaux champs
- Mettre à jour les credentials avant expiration
