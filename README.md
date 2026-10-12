# Fast-Food Coût & Marge

Application **locale, chiffrée et open-source** pour aider les restaurants rapides en France à maîtriser leurs coûts, fixer leurs prix et suivre leur rentabilité. Interface en **français** et **turc** (FR / TR).

## ✨ Fonctionnalités

* **Ingrédients & emballages** — prix d’achat HT par colis, contenance, taux de perte → coût réel par kg / litre / pièce.
* **Fiches techniques** — composition de chaque produit (emballage compris) → coût matière, marge HT, food cost %, coefficient multiplicateur.
* **Prix conseillé TTC** — calculé à partir d’un objectif de food cost et du taux de TVA (10 % sur place / à emporter immédiat, 5,5 %, 20 %), arrondi aux 10 centimes.
* **Menus & formules** — coût, marge et remise client par rapport aux prix à la carte.
* **Compte de résultat mensuel** — ventes, TVA collectée, coût matière, commissions des plateformes de livraison, charges fixes, résultat et **seuil de rentabilité**. Export CSV.
* **Ingénierie de menu** — matrice Kasavana & Smith (Star / Cheval de labour / Énigme / Poids mort) avec recommandations.
* **Tableau de bord** — alertes sur les produits vendus à perte ou au-dessus de leur objectif.
* **Confidentialité** — données stockées uniquement sur l’appareil (IndexedDB chiffré AES-GCM).

Des données d’exemple sont chargées au premier lancement.

> Outil d’aide à la décision : il ne remplace pas votre expert-comptable.

## 🛠️ Développement

Prérequis : Node.js 18+.

```bash
cd french-tax-app
npm install
npm run dev     # application web
npm test        # tests unitaires (calculs de coûts, stockage)
npm run electron:dev   # version bureau
```

Les calculs se trouvent dans `src/features/costing/costing.ts` (fonctions pures, testées).

## Licence

MIT
