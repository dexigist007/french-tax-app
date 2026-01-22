
# French Tax Prep (Préparation Fiscale)

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)

Une application **locale, sécurisée et open-source** pour aider les résidents fiscaux français à préparer leur déclaration de revenus. 

Cette application vous permet de suivre vos revenus et dépenses tout au long de l'année, de calculer votre quotient familial en temps réel et d'estimer l'impact de vos frais réels.

**⚠️ Important :** Cette application est un outil d'aide à la décision. Elle ne remplace pas la déclaration officielle sur [impots.gouv.fr](https://www.impots.gouv.fr). Aucune donnée n'est transmise à l'administration fiscale.

## ✨ Fonctionnalités

*   **Gestion des Revenus & Dépenses** : Saisie facile des salaires, pensions, dons, frais de garde, etc.
*   **Calcul du Quotient Familial** : Estimation automatique du nombre de parts fiscales en fonction de la composition de votre foyer (marié, pacsé, enfants, garde alternée, invalidité...).
*   **Simulateur Frais Réels vs Forfait** : Comparez l'intérêt de déclarer vos frais réels (kilométriques, repas) par rapport à l'abattement forfaitaire de 10%.
*   **Confidentialité Totale (Local-First)** : Toutes les données sont stockées **uniquement sur votre appareil** (IndexedDB chiffré). Rien n'est envoyé dans le cloud.
*   **Export PDF & CSV** : Générez un récapitulatif clair pour vous aider lors de la déclaration officielle.
*   **Checklist Déclaration** : Un guide étape par étape pour ne rien oublier le jour J.

## 🚀 Installation

### Windows
Téléchargez la dernière version (`.exe`) depuis la section [Releases](https://github.com/yourusername/french-tax-app/releases).

### MacOS / Linux
Pour l'instant, vous pouvez lancer l'application en mode développement ou la compiler vous-même (voir ci-dessous).

## 🛠️ Développement (Contribuer)

Nous accueillons avec plaisir les contributions ! Voici comment lancer le projet localement.

### Prérequis
*   Node.js (v18 ou supérieur)
*   npm

### Démarrage Rapide

1.  Clonez le dépôt :
    ```bash
    git clone https://github.com/yourusername/french-tax-app.git
    cd french-tax-app
    ```

2.  Installez les dépendances :
    ```bash
    npm install
    ```

3.  Lancez l'application en mode web (pour le développement UI rapide) :
    ```bash
    npm run dev
    ```

4.  Lancez l'application en mode Electron (Desktop) :
    ```bash
    npm run electron:dev
    ```

### Tests
Nous utilisons Vitest pour les tests unitaires.
```bash
npm run test
```

## 🏗️ Architecture

*   **Frontend** : React 19, TypeScript, TailwindCSS
*   **Build Tool** : Vite
*   **Desktop Wrapper** : Electron
*   **Stockage** : IndexedDB (via `idb`) avec chiffrement AES-GCM.
*   **Logique Métier** : Services isolés (`TaxService`, `HouseholdService`) pour garantir la précision des calculs fiscaux français.

## 🔒 Sécurité

La confidentialité est au cœur de ce projet.
*   Les données sensibles (noms, montants) sont chiffrées avant d'être écrites dans la base de données locale du navigateur/application.
*   La clé de chiffrement est dérivée d'un sel unique généré à la première utilisation.

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---
*Fait avec ❤️ pour simplifier la fiscalité française.*
