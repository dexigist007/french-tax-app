# Contribuer à French Tax Prep

Merci de votre intérêt pour ce projet ! Nous voulons rendre la préparation fiscale plus simple et plus sûre pour tous.

## Comment Contribuer ?

### 1. Signaler un Bug
Si vous trouvez un bug, ouvrez une **Issue** en décrivant :
*   Les étapes pour reproduire le problème.
*   Le comportement attendu vs le comportement observé.
*   Votre environnement (OS, Navigateur, Version).

### 2. Suggérer une Fonctionnalité
Vous avez une idée pour améliorer l'application ? Ouvrez une **Issue** avec le tag `enhancement` et décrivez votre idée.

### 3. Proposer du Code (Pull Request)
1.  **Forkez** le projet.
2.  Créez une branche pour votre fonctionnalité (`git checkout -b feature/ma-super-feature`).
3.  Assurez-vous que les tests passent (`npm run test`).
4.  Si vous ajoutez une nouvelle logique fiscale, **ajoutez un test correspondant**.
5.  Commitez vos changements (`git commit -m 'feat: ajoute le support des frais de télétravail'`).
6.  Poussez vers votre fork (`git push origin feature/ma-super-feature`).
7.  Ouvrez une **Pull Request**.

## Règles de Développement

*   **TypeScript Strict** : Pas de `any` si possible.
*   **Tests** : Toute nouvelle logique métier (dans `src/features/`) doit être testée.
*   **Clean Code** : Gardez les composants UI petits et déplacez la logique complexe dans des services ou des hooks.
*   **Architecture** : Respectez la séparation `core` (technique), `features` (métier), `ui` (interface).

## Sécurité
Ne commitez jamais de clés API réelles ou de données personnelles. Ce projet est "Local-First", assurez-vous que vos changements ne compromettent pas ce principe (pas d'envoi de données vers des serveurs tiers sans consentement explicite et justifié).

Merci de votre aide !
