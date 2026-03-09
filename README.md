# Louer ou acheter

Simulateur immobilier en React pour comparer le coût net d'un achat de résidence principale face à une location, sur un horizon de 1 à 25 ans.

L'application ne cherche pas seulement à comparer une mensualité de crédit avec un loyer. Elle reconstruit une situation nette projetée en tenant compte du crédit, des frais d'acquisition, des charges, de la valorisation du bien et du rendement alternatif du capital.

## Ce que fait l'application

- Compare achat et location avec un verdict immédiat.
- Accepte une saisie au prix total ou au prix au m².
- Propose deux parcours d'entrée:
  - le simulateur complet sur `/`
  - le questionnaire guidé sur `/form`
- Calcule mensualité, intérêts, principal remboursé et capital restant dû.
- Intègre apport, frais d'agence, frais de notaire, taxe foncière, entretien et charges.
- Modélise l'inflation annuelle des loyers et la valorisation annuelle du bien.
- Intègre le coût d'opportunité de l'apport.
- Intègre aussi le rendement de l'épargne reconstituée après la fin du crédit.
- Affiche une courbe sur 25 ans avec année de croisement si elle existe.
- Ajoute une lecture de sensibilité du scénario avec `rendement alternatif +1 %` et `-1 %`.
- Permet de sauvegarder des scénarios dans le navigateur, de les recharger, de les supprimer et d'en comparer jusqu'à 4 en parallèle.

## Parcours utilisateur

### 1. Simulateur principal

Le parcours principal regroupe l'application en 4 sections:

- `Paramètres`: formulaire condensé avec parcours essentiel puis hypothèses de financement et avancées.
- `Résultats`: lecture rapide achat/location, indicateurs clés et décomposition détaillée.
- `Comparer`: comparaison du brouillon courant avec les scénarios sauvegardés.
- `Scénarios`: bibliothèque locale des simulations sauvegardées.

Sur mobile, l'interface n'affiche qu'une section à la fois et ajoute une barre fixe en bas pour basculer rapidement entre modification et résultats.

### 2. Questionnaire guidé

Le parcours `/form` découpe la simulation en étapes courtes:

1. Nom du scénario
2. Mode de saisie des prix
3. Surface
4. Coût côté achat
5. Coût côté location
6. Apport
7. Financement
8. Rendement alternatif
9. Horizon de détention

Ce flux sert à préparer rapidement un brouillon exploitable puis à le réinjecter dans le simulateur principal.

## Modèle de calcul

Le simulateur répond à la question: quelle option laisse la meilleure situation nette au bout de `X` années ?

### Côté achat

Le calcul prend notamment en compte:

- le prix du bien
- les frais d'acquisition
- les intérêts payés
- les charges propriétaire
- le coût d'opportunité de l'apport
- le capital restant dû à l'horizon choisi
- la valeur projetée du bien
- le gain de l'épargne de mensualités une fois le crédit terminé

La logique est la suivante:

`coût net achat = coûts achat + apport mobilisé - patrimoine récupéré - gain d'épargne post-crédit`

Avec:

- `patrimoine récupéré = valeur projetée du bien - capital restant dû`
- `coûts achat = frais + intérêts + charges + coût d'opportunité`

### Côté location

Le calcul prend notamment en compte:

- les loyers cumulés avec inflation
- les charges locataire
- le rendement du capital resté investi au lieu d'être mobilisé dans l'achat

La logique est la suivante:

`coût net location = loyers + charges locataire - gain du capital investi`

### Timeline et sensibilité

Pour chaque scénario, l'application calcule:

- une timeline annuelle de 1 à 25 ans
- l'année de croisement achat/location si le signe de l'avantage s'inverse
- deux courbes de sensibilité en faisant varier le rendement alternatif de `+1 %` et `-1 %`

La courbe peut être affichée en mode `coût net` ou `gain net`.

## Paramètres disponibles

### Données essentielles

- nom du scénario
- surface
- horizon
- prix d'achat ou prix d'achat au m²
- loyer mensuel ou loyer au m²
- charges propriétaire
- charges locataire

### Financement

- apport
- durée du crédit
- taux du crédit
- frais d'agence
- frais de notaire

### Hypothèses avancées

- taxe foncière
- budget entretien
- inflation annuelle des loyers
- valorisation annuelle du bien
- rendement alternatif du capital

## Restitution

Le panneau de résultats expose:

- le verdict `Acheter` ou `Louer`
- l'écart estimé entre les deux options
- le coût net achat
- le coût net location
- la mensualité de crédit
- la valeur finale du bien
- le capital placé côté location
- une lecture détaillée des postes de coûts et de gains
- une courbe d'évolution sur 25 ans

Les postes détaillés incluent notamment:

- prix du bien
- frais d'acquisition
- intérêts payés
- charges et entretien
- coût d'opportunité
- rendement d'épargne post-crédit
- capital restant dû
- loyers versés
- charges locataire
- gain du capital investi

## Sauvegarde et comparaison

Les scénarios sont stockés côté navigateur:

- `IndexedDB` en stockage principal
- `localStorage` comme sauvegarde de secours

Chaque scénario sauvegardé peut:

- être rechargé dans le brouillon
- être supprimé
- être ajouté ou retiré du comparatif

Le comparatif affiche toujours:

- le brouillon courant
- jusqu'à 3 scénarios sauvegardés supplémentaires

Soit un maximum de 4 colonnes ou cartes de comparaison.

## Stack technique

- React 19
- Vite 7
- Tailwind CSS v4
- ESLint 9
- Cloudflare Workers + static assets via Wrangler

## Structure du projet

```text
.
|-- public/
|-- src/
|   |-- components/
|   |   |-- ComparisonCards.jsx
|   |   |-- HeaderSummary.jsx
|   |   |-- QuestionnaireRoute.jsx
|   |   |-- ResultsSummary.jsx
|   |   |-- ScenarioForm.jsx
|   |   `-- ScenarioLibrary.jsx
|   |-- App.jsx
|   |-- baseUrl.js
|   |-- index.css
|   `-- main.jsx
|-- worker/
|   `-- index.js
|-- index.html
|-- vite.config.js
|-- wrangler.toml
`-- package.json
```

## Démarrage local

### Pré-requis

- Node.js 20+
- npm

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

Le serveur Vite démarre sur [http://localhost:8090](http://localhost:8090).

### Lint

```bash
npm run lint
```

### Build

```bash
npm run build
```

### Prévisualisation

```bash
npm run preview
```

## Déploiement Cloudflare

Le projet est prévu pour être servi comme SPA statique derrière un Worker Cloudflare.

### Configuration actuelle

- les assets produits par Vite sont servis depuis `dist`
- `worker/index.js` laisse fonctionner la SPA et réécrit `/form` vers les assets attendus
- `wrangler.toml` expose actuellement deux domaines personnalisés:
  - `acheter-ou-louer.morelpouliquen.com`
  - `louer-ou-acheter.morelpouliquen.com`

### Commandes utiles

Vérifier le compte Cloudflare configuré:

```bash
npm run cf:whoami
```

Déploiement manuel:

```bash
npm run deploy
```

Test de déploiement sans publication:

```bash
npm run deploy:dry-run
```

## Routage

L'application fonctionne avec deux entrées utilisateur:

- `#/` pour le simulateur principal
- `#/form` pour le questionnaire guidé

Le Worker gère aussi la compatibilité avec un accès direct à `/form` en réécrivant la requête vers les assets SPA.

## Limites du simulateur

Le projet reste volontairement pédagogique. Il ne remplace ni un conseil financier, ni une étude notariale, ni une simulation bancaire exhaustive.

Points simplifiés ou non couverts:

- fiscalité détaillée des placements
- frais de revente
- assurance emprunteur détaillée
- travaux exceptionnels lourds
- vacance locative
- renégociation de prêt ou changement de taux en cours de vie
- cas patrimoniaux complexes ou multi-actifs

## Changements récents reflétés dans ce README

- ajout d'un questionnaire guidé distinct du simulateur principal
- stabilisation du routage `/form` avec compatibilité Cloudflare
- refonte du formulaire principal en blocs plus compacts
- amélioration des champs numériques avec formatage FR et stepper sur les taux
- nouvelle bibliothèque de scénarios avec chargement, suppression et ajout à la comparaison
- comparatif brouillon + scénarios sauvegardés jusqu'à 4 entrées
- nouvelle restitution détaillée achat/location
- ajout d'une courbe en mode coût net ou gain net
- ajout d'une lecture de sensibilité sur le rendement alternatif
- ajout d'une barre récapitulative mobile

## Crédits

Merci à Chicago Boy, [@ChicagoBoyFR](https://x.com/ChicagoBoyFR), pour l'inspiration initiale.

## Avertissement

Les résultats fournis sont des estimations dépendantes des hypothèses saisies. Ils doivent être relus avec esprit critique avant toute décision patrimoniale.
