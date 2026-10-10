# Installer Élan avec GitHub Pages et Firebase

Le projet est adapté à GitHub Pages. Firebase Authentication gère les comptes ; Cloud Firestore conserve les packs, les profils, les pesées et les accès administrateur.

La compilation locale est réussie. La configuration Web du projet Firebase elan-fd2cb est déjà intégrée. L’application réelle ne sera utilisable qu’après configuration de votre projet Firebase, publication des règles et hébergement. Les tests de sécurité de Firestore sont fournis et exécutés par GitHub Actions avant publication. Ils n’ont pas été exécutés localement faute de Java et d’émulateur ; aucune connexion à votre Firebase réel n’a encore été testée.

## 1. Créer Firebase

1. Ouvrir https://console.firebase.google.com/ et se connecter.
2. Créer un projet, par exemple `elan-suivi`. Google Analytics est facultatif.
3. Dans la page d’accueil du projet, cliquer sur Ajouter une application puis sur l’icône Web `</>`.
4. Nommer l’application `Élan`. Firebase Hosting n’est pas nécessaire puisque le site sera sur GitHub Pages.
5. Enregistrer l’application. Copier le bloc `firebaseConfig`. Il est également accessible dans Paramètres du projet → Général → Vos applications → Configuration SDK.
6. La configuration de elan-fd2cb est déjà intégrée dans public/firebase-config.json. Il s’agit de la configuration publique Web, pas d’une clé privée de compte de service.

## 2. Activer les comptes

1. Ouvrir Authentication et cliquer sur Commencer.
2. Dans Méthode de connexion / Sign-in method, activer E-mail/Mot de passe, puis Enregistrer.
3. Le site propose inscription, connexion, vérification de l’adresse et réinitialisation du mot de passe.
4. Ne communiquez jamais votre mot de passe à Codex. Le mot de passe choisi pour l’application peut être différent de celui de votre messagerie.

## 3. Créer la base et publier les règles

1. Dans Firestore Database, cliquer sur Créer une base de données.
2. Choisir l’édition Standard et le mode production. Choisir soigneusement l’emplacement de la base, par exemple en Europe.
3. Dans l’onglet Règles, remplacer les règles existantes par le contenu entier de `firestore.rules` fourni dans ce projet.
4. Cliquer sur Publier.
5. Il n’est pas nécessaire de créer les collections manuellement. L’application crée les documents quand vous ajoutez des packs et quand les clientes créent leurs profils.

Les règles limitent les clientes à leur propre profil et leurs pesées, exigent une adresse vérifiée, empêchent une cliente de s’attribuer un rôle administrateur et réservent la gestion des packs et des administrateurs aux comptes autorisés. Le compte principal est `ballay.brian@gmail.com`.

## 4. Créer le dépôt GitHub

1. Le dépôt est déjà créé : https://github.com/ballaybrian/elan-suivi . Utiliser sa branche principale `main`.
2. Décompresser l’archive du projet.
3. Ajouter à la racine du dépôt les fichiers et dossiers du projet. Le fichier `package.json` doit être directement à la racine. Inclure le dossier `.github` avec `.github/workflows/deploy.yml`.
4. Ne pas importer `node_modules`. Le dossier `dist` fourni est une copie compilée ; GitHub Actions le reconstruit automatiquement.
5. Après importation, ouvrir Settings → Pages → Build and deployment → Source, et choisir GitHub Actions.
6. Ouvrir l’onglet Actions. Le workflow « Publier Élan sur GitHub Pages » teste les règles avec des données fictives, construit l’application puis la publie. S’il a été exécuté avant l’activation de Pages, relancer le workflow.
7. Le lien final est indiqué dans Settings → Pages et dans le résultat du workflow. Il aura en général la forme `https://ballaybrian.github.io/elan-suivi/`.

Tous les liens vers les fichiers sont relatifs : l’application fonctionne également sous le chemin du dépôt. Si vous utilisez une branche différente, adapter `branches: [main]` dans le workflow.

## 5. Autoriser le domaine et créer le compte principal

1. Dans Firebase → Authentication → Settings → Authorized domains, ajouter `ballaybrian.github.io` (sans `https://`, sans le chemin `/elan-suivi/`).
2. Ouvrir le site et cliquer sur Créer un compte.
3. Utiliser `ballay.brian@gmail.com` et choisir un mot de passe propre à l’application.
4. Ouvrir l’e-mail de vérification, puis revenir sur le site et cliquer sur J’ai vérifié mon e-mail.
5. Vous aurez accès à l’espace administrateur. Ajouter vos véritables packs dans Packs de produits.
6. Dans Administrateurs, ajouter les adresses des autres personnes autorisées. Chacune doit créer son compte avec l’adresse ajoutée et vérifier cet e-mail.

## 6. Vérifier avant d’inviter vos clientes

Créer un compte cliente de test avec une seconde adresse que vous contrôlez, la vérifier, choisir un pack et créer un profil. Ajouter une pesée puis vérifier qu’elle apparaît dans le tableau administrateur. Le compte cliente ne doit pas voir les menus d’administration. La saisie d’un nouveau poids dans la même semaine remplace l’ancienne pesée. Un pack retiré reste visible sur les anciens suivis et disparaît du menu de sélection.

L’aperçu accessible depuis la page de connexion utilise uniquement des données fictives ; aucune modification n’y est enregistrée.

## Pour un développeur

- `npm ci` : installation des dépendances.
- `npm run build` : vérification TypeScript et compilation dans `dist/`.
- `npm run preview` : aperçu local à http://127.0.0.1:4173 après compilation.
- `npx --yes firebase-tools@15.33.0 emulators:exec --only firestore --project demo-elan "npm run test:rules"` : tests de sécurité avec Java 21 et l’émulateur Firestore.
- Les règles Firebase doivent être publiées dans la console après chaque changement de `firestore.rules`. GitHub Actions teste les règles, mais ne les publie pas dans votre Firebase.
- Aucune clé privée ni identifiant de compte de service n’est nécessaire au déploiement GitHub Pages.

Documentation officielle :
- Configuration Firebase Web : https://firebase.google.com/docs/web/setup
- Comptes par e-mail : https://firebase.google.com/docs/auth/web/password-auth
- Création de Firestore : https://firebase.google.com/docs/firestore/quickstart
- Hébergement GitHub Pages : https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

