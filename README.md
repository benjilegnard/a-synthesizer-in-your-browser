---
lang: fr 
--- 
# Maman, j'ai développé un synthétiseur dans mon navigateur.

Une conférence sur comment j'ai échoué, puis réussi, une lecon de vie (nan je décpnnes, c'est une )

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
  - side-project 
    - objectifs
      - apprendre 👨‍🎓
      - s'amuser 🤡
    - stack technique
      - preact
      - api web-audio
      - github
    - parler de M.A.O.
  - benjilegnard slide whoami
- historique
  - le ms-20 
  - KORG 
  - moi et le ms-20
  - tonton jean-pierre (RIP)
  - j'en ai un chez moi
  - démo/vidéo 
  - de quoi c'est fait?
- la musique (découpage du korg en modules)
  - la musique c'est le silence entre les notes (nietzche?)
  - c'est quoi le son ?
    - vibrations
    - plus ou moins 5 volts
    - 
  - c'est quoi la musique ?
    - des fréquences

  - c'est quoi le son (pour un ordinateur)

- l'api web-audio
  - historique rapide
  - principe
  - 
- features du KORG MS-20
  - oscilateur 
  - filtres
  - enveloppe
  - 
- conception / découpage
  - korg + visual interface
  - korg + hack du cable panel (on voit sur le synthé
  - thinking in components
  - knob
  - keyboard
  - 

- keyboard
  - fréquence 
  - merci wikipedia (todo lien)
  - events click
  - décalage d'octave

- oscillators
  - sinusoide / triangle / sawtooth
  - 
  - code api webaudio

- gestion d'état
  - découpage statique/dynamique
  - signal

- filters
  - high pass filter 
  - low pass filter 

- Envelope

- la ci/cd
  - lint & tests
  - github actions
  - pull-request staging
  - tests reports

- Envelope generator
  - ASDR, attack sustain, release delay.

- knob
  - trigonométrie
  - knob select
  - knob range
  - knob a11y
  - problématique rotation
  - machine à états

- a11y
  - tout est backup par des composants du dom
  - démo désactivation CSS

- la gestion d'états
  - interface vs state
  - graphe audio = pas mon ui
  - "paramétrage" = ma donnée
  - dériver l'état vers le graphe audio

- le boss final : cable graphe
  - connections
  - moteur physique

- démo finale
  - tout connecter!
  - events clavier
  - matter.js 
  - longueur du cable 
  - machine a états

- bonus: settings et indexedb/pwa


- conclusion
  - faites de l'art inutile
  - faites de la musique
  - c'est pas grave si vos side-projects prennent du temps
  - postuler des sujets au conf, ca fout un coup de pression pour les finirs 

- merci
  - qrcodes + liens
