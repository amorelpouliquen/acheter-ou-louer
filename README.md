# Acheter ou louer

Simulateur immobilier en React pour comparer, sur plusieurs horizons de temps, le coût net réel d'un achat de résidence principale face à une location.

L'application met en regard les deux options avec une approche patrimoniale simple et lisible: crédit, apport, frais d'acquisition, charges, inflation des loyers, valorisation du bien et rendement alternatif du capital.

## Ce que fait l'application

- Compare achat et location sur l'horizon de votre choix.
- Accepte une saisie au prix total ou au prix au m².
- Calcule les frais d'agence et de notaire.
- Intègre mensualité de crédit, intérêts payés et capital restant dû.
- Prend en compte taxe foncière, entretien et charges.
- Modélise l'inflation des loyers et la valorisation du bien.
- Estime le coût d'opportunité de l'apport non investi ailleurs.
- Permet de sauvegarder plusieurs scénarios dans le navigateur.
- Affiche un comparatif multi-scénarios et une courbe de coût net jusqu'à 25 ans.

## Aperçu de la logique

Le simulateur ne cherche pas à répondre à la question "combien je paie par mois ?", mais à la question "quelle option me laisse dans la meilleure situation nette au bout de X années ?".

### Côté achat

Le coût net achat additionne notamment:

- Les frais d'acquisition.
- Les intérêts versés à la banque.
- Les charges de propriétaire.
- Le coût d'opportunité de l'apport.

Puis il retranche le patrimoine récupérable en fin d'horizon:

- Valeur projetée du bien.
- Moins le capital restant dû.

### Côté location

Le coût net location additionne:

- Les loyers payés.
- Les charges locatives.

Puis il retranche:

- Le gain estimé sur le capital resté investi au lieu d'être mobilisé dans l'achat.

## Fonctionnalités principales

### Paramètres modifiables

- Nom du scénario.
- Surface.
- Horizon de détention.
- Prix d'achat ou prix au m².
- Loyer mensuel ou loyer au m².
- Apport.
- Taux et durée du crédit.
- Frais d'agence et frais de notaire.
- Taxe foncière.
- Budget entretien.
- Charges propriétaire et charges locataire.
- Inflation annuelle des loyers.
- Valorisation annuelle du bien.
- Rendement alternatif du capital.

### Restitution

- Verdict instantané: acheter ou louer.
- Coût net achat.
- Coût net location.
- Mensualité de crédit.
- Décomposition détaillée de chaque scénario.
- Tableau comparatif entre brouillon courant et scénarios sauvegardés.
- Courbe d'évolution annuelle des deux options avec année de croisement si elle existe.

### Persistance locale

Les scénarios sont sauvegardés côté navigateur:

- IndexedDB en stockage principal.
- `localStorage` en secours si nécessaire.

Aucune base de données distante n'est requise pour utiliser l'application.

## Stack technique

- React 19
- Vite
- Tailwind CSS v4
- ESLint

## Démarrage local

### Pré-requis

- Node.js 20+ recommandé
- npm

### Installation

```bash
npm install
```

### Lancer le serveur de développement

```bash
npm run dev
```

Par défaut, Vite démarre sur `http://localhost:8090`.

### Construire pour la production

```bash
npm run build
```

### Vérifier le lint

```bash
npm run lint
```

### Prévisualiser le build

```bash
npm run preview
```

## Structure du projet

```text
.
|-- public/
|-- src/
|   |-- App.jsx
|   |-- index.css
|   `-- main.jsx
|-- index.html
|-- package.json
`-- vite.config.js
```

## Limites du simulateur

Ce projet est volontairement pédagogique. Il ne remplace ni un conseil financier, ni une modélisation notariale ou bancaire exhaustive.

Exemples de points non couverts ou simplifiés:

- Fiscalité détaillée de placements alternatifs.
- Frais de revente du bien.
- Travaux exceptionnels lourds.
- Assurance emprunteur détaillée.
- Vacance locative ou arbitrages d'investissement plus complexes.
- Variations de taux ou renégociation de crédit en cours de vie.

## Publication du projet

Le dépôt est pensé pour être partagé publiquement:

- README orienté usage et compréhension métier.
- Fichiers de template inutiles supprimés.
- Métadonnées du package alignées avec le nom du projet.

## Crédits

Merci à Chicago Boy, [@ChicagoBoyFR](https://x.com/ChicagoBoyFR), pour l'inspiration.

## Avertissement

Les résultats fournis sont des estimations. Ils dépendent entièrement des hypothèses saisies et doivent être relus avec esprit critique avant toute décision patrimoniale.
