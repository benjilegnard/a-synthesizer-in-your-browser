---
lang: fr 
--- 
# Maman, j'ai développé un synthétiseur dans mon navigateur.

Une conférence sur comment j'ai échoué, puis réussi, une lecon de vie ( nan je déconnes, c'est une excuse pour parler de musique )

## Abstract

```markdown
On peut tout faire dans un navigateur web aujourd'hui, même du son !

Il y a quelque mois, je me suis lancé un défi : développer un synthétiseur existant en utilisant l'api WebAudio disponible dans tous les navigateurs modernes.

Dans ce talk, on va parler de musique électronique, et du mythique KORG MS-20, d'oscillateurs, de nœuds, de générateur d'enveloppe, de modulation de fréquence...

Mais aussi de technologies web : d'accessibilité, de composants (p)react, de gestion d'état, de signals et de tests automatisés...
```

## Plan

- introduction
  - de quoi je vais parler
    - répète l'abstract.
      - Notes: avertissement:
      - on va parler de plein de trucs
      - donc accrochez vous
  - objectifs d'un side-project 
    - objectifs
      - apprendre 👨‍🎓
      - s'amuser 🤡
    - stack technique
      - preact + signals
      - api web-audio
      - github actions
      - maths (déso)
      - pas de serveur, local-first / pwa
  - benjilegnard
    - slide whoami

- historique
  - araignées malades
  - tonton jean-pierre (RIP)
  - moi et le ms-20
  - j'en ai un chez moi
  - démo/vidéo 
  - de quoi c'est fait ?
  - let's read the fucking manual
  - blague : je lis le manuel
    - l'important c'est que "ca colle" avec l'api webaudio, et mon side-project prend forme

- la musique (intro à l'api webAudio)
  - la musique c'est le silence entre les notes (nietzche?)
  - c'est quoi le son ?
    - vibrations dans l'air
    - plus ou moins 5 volts (électrique)
  - c'est quoi la musique ?
    - des fréquences
    - qui s'additionnent
    - oscillations, vibrato, modulation
  - c'est quoi le son (pour un ordinateur)
    - pas d'analogique au sens électrique
    - un tableau de chiffres à virgules.
    - notions (rapides) de buffer, bruit, sinusoide

- les features, et pourquoi "ça colle"
  - 1. features de l'api web-audio
  - historique rapide (OSEF)
  - principe, le contexte audio
  - le graphe de noeuds
  - les types de noeuds
  - connection
 
<!-- todo: regrouper avec conception, découpage dessous -->
- 2. features du KORG MS-20
  - oscillateur 
    - une sinusoide
    - types de fréquences
  - filtres
    - high pass filter 
    - low pass filter 
  - enveloppe
    - asdr (passer rapidement, on y reviendra)
  - modulation de fréquence
  - conceptuellement, on a les billes , allonsy let's go

<!-- maximum ici, 10 minutes -->

- conception / découpage en modules
  - korg + visual interface
  - korg + hack du cable panel (on le voit sur le synthé: c'est le meilleur manuel)
  - thinking in components : mon plan d'action
  - keyboard
  - knobs (oscillateurs et filtres)
  - patchboard

- keyboard
  - fréquences en entrée
  - merci wikipedia (todo lien)
  - demi-tons, touches noires-blanches
  - events click
  - décalage d'octave
  - qui a la source de donnée sur la fréquence / la note ?

- oscillators
  - sinusoide / triangle / sawtooth
  - fréquence + modificateurs
  - code api webaudio
  - mixer deux sources (GainNode)
  - j'ai mis en place deux features, et c'est déjà le bordel

- knob
  - trigonométrie
  - problématique de rotation, dans quel sens ?
    - droite => réduire, gauche => augmenter ?
    - ou bien calculer un angle ?
  - ca a l'air simple, mais déjà plein d'events à gérer.
  - machine à états locale au composant
  - comportement-driven-development
  - application sur les filtres
- knob: avancé
  - select vs input/range
  - foutre en l'air sa conception initiale
  - repartir à zéro
  - knob a11y
  - knob select
  - knob range

- gestion d'état
  - découpage statique/dynamique
  - différents types d'état 
    - statique
    - de l'interface
    - du modèle de données (ici mon graphe audio)
    - du serveur
  - signals + computed + effect = win
  - architecture en trois couche au final.
    - interface
    - effects
    - audio-graph
  - state machine (pilot, pas allez trop loin là)
  - interface vs state
  - graphe audio = pas mon ui
  - "paramétrage" = ma donnée
  - dériver l'état vers le graphe audio = effect

- la ci/cd
  - lint & tests
  - github actions
  - pull-request => deploy sur staging
  - tests reports
  - c'est pas parce que c'est un side projet qu'on va se priver de bonne DX

- Envelope generator
  - revenons au schéma
  - ASDR, attack sustain, release delay.
  - filtres ++
  - démo 

- a11y
  - comment rendre ce bazar accessible?
  - solution: tout est backup par des composants du dom
  - démo désactivation CSS
  - label, output, tester 

- modulation de fréquences
  - ici des maths lourds
  - fourier
  - section à supprimer si pas le temps

- le boss final : cable graphe
  - connections
  - moteur physique: parce que pourquoi pas ?
  - matter.js 
  - longueur du cable 
  - machine a états

- démo finale
  - tout connecter!

- bonus: 
  - features non-présentées
    - settings et indexedb/pwa
    - events claviers
    - responsive (lol, faire une blague)
  - reste à faire : 
    - WebMidi ?

- conclusion / lecons
  - L'api webaudio, c'est un gros jouet, peu de cas d'usage en dehors de la synthèse sonore
  - les gens sérieux font du C (ou du zig) dans ce domaine, mais: on est là pour le fun
  - ca empêche pas de 
    - faire du code "inutile"
    - faites de l'art inutile
    - faites de la musique
  - que vous le vous le vouliez ou non, vous aurez toujours besoin d'une librairie de..., ou de patterns de.., ou au minimum de penser à la __gestion d'état__.
  - partir de l'interface finale ( ou des maquettes figma ), c'est le meilleur moyen de foirer vos devs front. Orienter sur la donnée.
  - c'est pas grave si vos side-projects prennent du temps
  - n'obsédez pas sur les détails / minimum viable product
  - postuler à des sujets au conf, ca fout un coup de pression pour finirs ses side-projects.

- merci
  - qrcodes + liens


## Sources / Références

- [Page Wikipédia KORG MS-20](https://en.wikipedia.org/wiki/Korg_MS-20)
- [Le manuel original (PDF)](https://cdn.korg.com/us/support/download/files/9af7ceee94ace953cb8abbea2d113bcd.pdf)
- [L'api WebAudio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Tips and techniques for using the web audio API](https://medium.com/@danielmckemie/tips-and-techniques-for-using-the-web-audio-api-89b8beda6cf2)
- [You don't need a library for state machines (davidkpiano)](https://dev.to/davidkpiano/you-don-t-need-a-library-for-state-machines-k7h)


