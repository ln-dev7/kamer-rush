# Vérification locale — Kamer Rush — 28 octobre 2026

Prototype local : cinq secteurs connectés, six missions, marche/course/nage, moto/taxi/vélo, minicarte rectangulaire, identité originale et 40 voix de synthèse locales.

## Vérifications exécutées

- macOS, Node 20.15.0 / npm 10.7.0. TypeScript strict réussi ; build Vite réussi ; 27 tests réussis. L’avertissement du chunk Three.js supérieur à 500 Ko reste visible, sans masquer la limite.
- Tests : missions/progression, dimensions et collisions, sélection de véhicule/sortie sûre ; sweep échantillonné à vitesse maximale, glissement piéton, cove et hystérésis nage, boost, IK à longueurs fixes, échelle humaine conservée, navigation des listes, intégrité des 40 voix et arbitrage sans superposition.
- Les 40 MP3 ont une empreinte conforme au casting, une URL locale HTTP 200 audio et un décodage ffprobe réussi : 63,06 s cumulées. Lecture navigateur réelle confirmée (readyState 4, paused false, temps média avançant). Aucune certification auditive d’accent camerounais ni transcription intégrale revendiquée.
- Nouvelle passe jouée au navigateur sur 5176 : première mission moto réussie à 96 % de confort ; première mission taxi complète réussie à 96 %, 51 s restantes, gain 640 F et une seule récompense. Double E pendant dépose ignoré. Pause pendant embarquement puis reprise fonctionnelle. Capture propre : evidence/polish-taxi-success.jpg.
- Cycles descente moto, marche/course, montée/roulage/sortie taxi, montée/pédalage/freinage/descente vélo exercés. Taxi garé bloquant le piéton, contournement nécessaire. Véhicules conservant leur position en session.
- Plage atteinte en courant : entrée eau, nage, sortie vers sable en reculant, nouvelle entrée, R répété et retour plage vérifiés. Véhicules interdits dans l’eau par limites distinctes. Les bouées bornent la zone de nage.
- Réglages custom au clavier (flèches/Entrée), sons activés, sous-titres et crédits présents. Accueil/HUD portrait 390×844 inspectés ; sous-titres repositionnés pour dégager la minicarte. Paysage et maintien des boutons tactiles avaient été inspectés au cours de l’implémentation ; téléphone physique et vrai multitouch non testés.
- Aucun message erreur/alerte console sur la session taxi finale. Pas de stress test longue durée.
- Logo transparent et bannière promotionnelle IA inspectés ; originaux préservés, exports dont OG 1200×630. Ce n’est pas une capture du jeu. Les captures de référence privées sont exclues du projet distribué.
- Documentation de l’architecture, axes/unités, collisions, extensions, commandes, sauvegarde, qualité, audio, branding, contributions et publication préparée. Liens relatifs contrôlés : aucun lien local cassé.

## Limites précises

Les cinq longues missions ne sont pas toutes terminées au navigateur. Le timeout n’a pas été attendu jusqu’à expiration complète. Pas de certification Safari/Firefox, lecteur d’écran, FPS sur téléphone physique ou vrai multitouch. Physique arcade, collisions conservatrices et sweep échantillonné ; pas de solveur rigide exact. Transitions procédurales visibles et portes animées, sans contacts mains/pieds parfaits ni enjambement capturé. Approche client locale sans navmesh ; circulation sur boucles pouvant se bloquer. Vingt répliques sont reliées à des événements implémentés ; les autres restent disponibles sans faux déclencheurs.

Aucune musique camerounaise incluse faute de droits compatibles vérifiés. Droits ElevenLabs séparés du code et à revoir avant redistribution publique. Licence originale à choisir ; aucun MIT implicite. Aucun déploiement, publication, achat ou nouveau compte effectué par cette tâche.

La reconnexion a nécessité de relancer les serveurs locaux ; les processus précédents ne tournaient plus. La copie finale préserve les fichiers remplacés dans une sauvegarde privée du workspace de travail et ne supprime aucun fichier utilisateur additionnel.

## Livraison après reconnexion

Le dossier demandé a reçu les sources et assets, puis `npm ci --offline --no-audit`, build, 27 tests et formatage ont réussi dans ce dossier. Aucun fichier additionnel supprimé ; versions remplacées préservées dans `.local/pre-polish-delivery` du workspace de travail. Le dépôt Git existant n’a pas reçu de commit ni de distant.

Production locale vérifiée sur http://127.0.0.1:5174/ : jeu/credits.html/logo/OG/catalogue HTTP 200, 40 MP3 servis avec les mêmes empreintes. Lecture de salutation réelle en production (readyState 4, temps avançant). Build de travail et livré identiques. Accueil, réglages et crédits vus ; portrait 390×844 et paysage 844×390 inspectés. Maintien accélérateur/frein au pointeur testé ; correction du chevauchement confort/minicarte en paysage confirmée. Aucune erreur/alerte console observée. Viewport remis à sa taille normale, jeu laissé à l’accueil. Captures `evidence/polish-production-*.jpg` et `polish-taxi-success.jpg`.

## Public source preparation

For the authorized GitHub push, the tracked catalog now contains null audio paths and unconfirmed public redistribution status. All 40 recordings and the approved local catalog remain on this Mac, ignored by Git, activated through ignored `.env.local`. Public-clone mode uses subtitles/effects without requesting missing MP3s. Previously documented recording playback checks refer to the authorized local installation, not files included in the public Git tree. A new portable catalog test and optional local integrity test replace the mandatory MP3 test.
