# Jouer à Kamer Rush

**La ville t’appartient.** Explore les rues, prends le guidon ou le volant et construis ta réputation au fil des missions.

## Démarrer

Dans le dossier du projet :

```sh
npm ci
npm run dev
```

Ouvre l'adresse locale affichée, normalement `http://127.0.0.1:5173`, choisis éventuellement une mission de départ, puis **Entrer dans la ville**. Node.js 20.15+ et un navigateur avec WebGL sont nécessaires. Aucun compte ni clé n'est demandé. Le jeu reste local.

## Explorer et changer de véhicule

Le vélo, la moto et le taxi jaune sont à disposition près du premier point de départ. Tu peux explorer toute la zone avant de prendre un client : le chrono n'a pas encore commencé.

- Z/W/flèche haut : avancer ; S/flèche bas : reculer.
- Q/A/flèche gauche et D/flèche droite : tourner.
- Espace : freiner le véhicule.
- **F** : une fois complètement arrêté, garer et descendre ; à pied, approcher le véhicule souhaité et appuyer sur F pour monter.
- **M** : carte complète ; **P/Échap** : pause ; **C** : recentrer la caméra.

Les boutons à icônes offrent les mêmes commandes sur écran tactile. Maintiens les pédales et les flèches. Le bouton de véhicule apparaît quand l'action est possible. En marchant, tu dois contourner les voitures et les bâtiments. Une sortie cherche un emplacement libre ; si aucun n'est disponible, déplace d'abord le véhicule.

Tu ne peux pas quitter ton véhicule pendant qu'un client est à bord. La plage des Rives possède un accès entre Z=90 et Z=150, rive est au sud du centre. À pied, entre dans l’eau pour nager entre les bouées. Reviens vers le sable pour sortir ; R ou le bouton de retour ramène à la plage. Les véhicules restent bloqués avant l’eau. Pas de bateau. Les camions de livraison appartiennent au décor/trafic ; ils ne sont pas pilotables. Les véhicules garés gardent leur position pendant la partie. Recommencer ou passer à la mission suivante les replace près du nouveau départ.

## Accompagner un client

Le point jaune sur la minicarte indique le client, puis la destination après sa prise. Arrête-toi à moins de 6 mètres et appuie sur **E** ou sur le bouton contextuel. Le compteur de temps commence alors.

Les six missions ont des délais et des seuils de confort différents. Les chocs enlèvent 22 points de confort. Un gros freinage à vitesse élevée en enlève 4 ; freiner doucement à l'approche d'un client ne coûte rien. Une arrivée à temps et confortable donne une meilleure note. Le montant affiché en F est une monnaie fictive du jeu.

En cas d'échec, **Réessayer** repart de la prise du client. Après une réussite, **Mission suivante** (bouton « Course suivante » dans cette version) passe au trajet suivant. Les missions de passagers se font en moto ou en taxi ; à pied ou à vélo, tu peux explorer et changer de véhicule. Le vélo ne transporte pas de client.

## Carte, réglages et sauvegarde

La minicarte rectangulaire suit la position et l'orientation du personnage ou du véhicule ; le N indique le nord pendant sa rotation. Routes, îlots et objectifs proviennent du même monde que la scène 3D. Le bouton de carte permet de voir les cinq secteurs fictifs et les six repères.

Le son est désactivé au départ. L'icône haut-parleur l'active ; les sons sont synthétisés localement. La qualité se règle à l'accueil : Auto, Légère ou Haute. Auto peut réduire la résolution et couper les ombres après observation des premières images de jeu.

Les totaux de progression restent dans ce navigateur, pour cette adresse et ce port. La position des véhicules et une mission en cours ne sont pas sauvegardées après fermeture/rechargement. Pour remettre les totaux à zéro, efface uniquement la clé `kamer-rush-v1` du stockage local de cette adresse via les outils du navigateur. Cela supprime la progression de ce prototype ; les autres données du navigateur ne sont pas nécessaires à effacer.

## Ce que cette version ne promet pas

La ville est une création fictive, pas une reproduction complète de Douala. La conduite et les collisions sont simplifiées. Les transferts montée/descente et prise/dépose sont des transitions immédiates à des positions contrôlées, sans animation complète d'ouverture de porte ou d'enjambement. Les tests réels sur téléphone physique restent à faire. Voir la [matrice de vérification](testing.md).

## Course, réglages et voix

Maintiens Maj pour courir, nager plus vite, pédaler plus fort ou accélérer. Sur écran tactile, maintiens éclair avec avancer. H déclenche le klaxon moto/taxi. Les montées/descentes et prises/déposes sont animées ; attends leur fin avant une nouvelle action.

Les réglages proposent qualité, volumes séparés et sous-titres. Les listes acceptent flèches, Entrée, Échap, Tab et recherche par lettres. Active le son par le bouton haut-parleur. 40 répliques de synthèse sont présentes ; seules celles correspondant aux événements implémentés se déclenchent. Les accents ne sont pas certifiés camerounais. La musique attend des droits compatibles ; aucun morceau inclus. Crédits via accueil/réglages ou [page dédiée](../credits.html).
