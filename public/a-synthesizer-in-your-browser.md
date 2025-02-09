<!--
---
lang: fr
---
-->
<!-- .slide: data-background-image="images/home-alone.png" data-background-position="bottom left" data-background-size="contain" -->
# Maman, j'ai développé un synthétiseur dans mon navigateur!<!-- .element: style="margin-left: 20%;" -->



## Introduction
Notes:
- un deux un deux? titre.
- Bref, j'ai fait une clownerie
- aujourd'hui je vais vous parler d'un synthétiseur 
- le KORG MS-20, un modèle mythique, sortie en 1978 qui...
- en vrai je vais surtout vous parlez d'un side-project


### Side-project 
- apprendre 👨‍🎓
- s'amuser 🤡
Notes:
- un side project qui m'a pris beaucoup de temps
- voire même fait m'arracher les cheveux que je n'ai plus
- Un side project, ca devrait pas avoir d'autres d'objectifs sinon apprendre et s'amuser.


### Stack Technique 
- ⚛️ preact (🚥 + signals)
- 🔈 WebAudio
- 🐙 github actions
- ⚡ vite/vitest
Notes:
- faire "propre" quand même
- c'est une excuse pour apprendre
- on peut vouloir utiliser autre chose qu'angular


### Qui-suis,je ?

- Benjamin Legrand
- Tech lead @ onepoint
- @benjilegnard



## Histoire(s)


### Jean-Pierre
<img src="/images/jean-pierre/araignées-malades-dans-la-cave-24.jpg" />
Notes:
- lui, c'est mon oncle Jean-pierre.
- enfin, c'était.
- là, il est dans la cave avec le groupe de mon père,
- et il joue du synthétiseur
- on est en mai 1980 ou quelque chose comme ça


### Les araignées malades

<img src="/images/jean-pierre/araignées-malades-dans-la-somme-12-juste-avant-le-départ-au-73.jpg" />


<img src="/images/jean-pierre/araignées-malades-dans-la-somme-11-la-voiture-des-musiciens.jpg" />

Notes:
- avec mon père, qui prends la photo ici.
- ils ont un groupe et ils jouent dans les caves et quelques balles musettes du nord-pas de calais ou de la somme.



### Le KORG MS-20

<img src="images/korg-official-photo.jpg" />
Notes:
- Le MS-20, sorti en 1978, c'est un synthétiseur, un clavier monophonique (une seule note à la fois)
- extrêmement populaire dans les années 80, grand public par rapport aux Moog et synthés existant
- simple à utiliser



## La musique


### Sans musique, la vie serait une erreur
Nitch, Nietch, Nietsche


### La musique c'est le silence entre les notes
Auteur ?


### Un slide avec du tsx ?

<div id="high-pass"></div>


### Le son (pour un ordinateur)

### Un slide avec du tsx ?

<div id="trigonometry"></div>


### Un slide avec du tsx ?

<div id="sound-test"></div>



## L'api WebAudio
Notes:
- pourquoi "ca colle, entre le synthé et ce projet)


### Historique
- Remember Flash ?
- Draft Spec W3C en 2011
- High-level en JS, impleme en C/Assembleur
Notes:
- avant cette api, il fallait des plugins externes
- Premier brouillons de specs en 2011
- Implémenté par google 


### Rigolo ?

L'API est concue exactement comme on utiliserais un synthétiseur.

```typescript
const context = new AudioContext();
const gain = new GainNode();
```


## Features du MS-20

<abbr title="Read The Fantastic Manual">R.T.F.M.</abbr>


<img src="/images/korg-docs/ms-20-owners-manual-01.png" />


<img src="/images/korg-docs/ms-20-owners-manual-02.png" />


<img src="/images/korg-docs/ms-20-owners-manual-03.png" />


<img src="/images/korg-docs/ms-20-owners-manual-04.png" />


<img src="/images/korg-docs/ms-20-owners-manual-05.png" />


<img src="/images/korg-docs/ms-20-owners-manual-06.png" />


<img src="/images/korg-docs/ms-20-owners-manual-07.png" />


<img src="/images/korg-docs/ms-20-owners-manual-08.png" />


<img src="/images/korg-docs/ms-20-owners-manual-09.png" />


<img src="/images/korg-docs/ms-20-owners-manual-10.png" />


<img src="/images/korg-docs/ms-20-owners-manual-11.png" />


<img src="/images/korg-docs/ms-20-owners-manual-12.png" />


<img src="/images/korg-docs/ms-20-owners-manual-13.png" />


<img src="/images/korg-docs/ms-20-owners-manual-14.png" />


## Conception


### korg + visual interface


### korg + hack du cable panel (on le voit sur le synthé: c'est le meilleur manuel)


### thinking in components : mon plan d'action


### keyboard


### knobs (oscillateurs et filtres)


### patchboard



## Le clavier

Notes:
- la partie la plus importante


###  fréquences en entrée


###  merci wikipedia (todo lien)


###  demi-tons, touches noires-blanches


###  events click


###  décalage d'octave


###  qui a la source de donnée sur la fréquence / la note ?



## Oscillateurs


###  sinusoide / triangle / sawtooth


###  fréquence + modificateurs


###  code api webaudio


###  mixer deux sources (GainNode)


###  j'ai mis en place deux features, et c'est déjà le bordel



## knob (potentiomètre)


###  trigonométrie


###  problématique de rotation, dans quel sens ?
    - droite => réduire, gauche => augmenter ?
    - ou bien calculer un angle ?


###  ca a l'air simple, mais déjà plein d'events à gérer.


###  machine à états locale au composant


###  comportement-driven-development


###  application sur les filtres


## knob: avancé


###  select vs input/range


###  foutre en l'air sa conception initiale


###  repartir à zéro


###  knob a11y


###  knob select


###  knob range



## gestion d'état


###  découpage statique/dynamique


###  différents types d'état 
    - statique
    - de l'interface
    - du modèle de données (ici mon graphe audio)
    - du serveur


###  signals + computed + effect = win


###  architecture en trois couche au final.
    - interface
    - effects
    - audio-graph


###  state machine (pilot, pas allez trop loin là)


###  interface vs state


###  graphe audio = pas mon ui


###  "paramétrage" = ma donnée


###  dériver l'état vers le graphe audio = effect



## Filtres


### Passe haut


### Passe bas


### Nodes


### peaks



## la ci/cd


###  lint & tests


###  github actions


###  pull-request => deploy sur staging


###  tests reports


###  c'est pas parce que c'est un side projet qu'on va se priver de bonne DX



## Envelope generator


###  revenons au schéma


###  ASDR, attack sustain, release delay.


###  filtres ++


###  démo 



## Accessibilité


###  comment rendre ce bazar accessible?


###  solution: tout est backup par des composants du dom


###  démo désactivation CSS


###  label, output, tester 



## modulation de fréquences


###  ici des maths lourds


###  fourier


###  section à supprimer si pas le temps



## le boss final : cable graphe


###  connections


###  moteur physique: parce que pourquoi pas ?


###  matter.js 


###  longueur du cable 


###  machine a états



## démo finale


###  tout connecter!



## bonus: 


###  features non-présentées
- settings et indexedb/pwa
- events claviers
- responsive (lol, faire une blague)


###  reste à faire : 
- WebMidi ?



## conclusion / leçons
Notes:
- Comme dans plein de chose, il y a des lecons à tirer de cette avanture


###  L'api webaudio
Notes:
- c'est un gros jouet, peu de cas d'usage en dehors de la synthèse sonore
- Vraiment bizarre


###  les gens sérieux
- font du C (ou du zig) dans ce domaine
- mais: on est là pour le fun
Notes: 
- pour des raisons de latence
- javascript est assez versatile pour que ça passe


### Ça n'empêche pas de 
- faire du code "inutile"
- faites de l'art inutile
- faites de la musique


### Gestion d'état
- que vous le vous le vouliez ou non, vous aurez toujours besoin d'une librairie de..., ou de patterns de.., ou au minimum de penser à la __gestion d'état__.


### Sens de réalisation

- partir de l'interface finale ( ou des maquettes figma ), c'est le meilleur moyen de foirer vos devs front. Orienter sur la donnée.


### Ce n'est pas grave
- si vos side-projects prennent du temps
- si ça n'avance pas


### MVP
- n'obsédez pas sur les détails
- minimum viable product


### Build in public
- postuler à des sujets au conf, ca fout un coup de pression pour finirs ses side-projects.


### Side project
- C'est pas grave si ça prends du temps
- Ne peignez pas (trop) la girafe. (yack-shaving)
- Postuler à des confs.


### Les sujets de niche
- L'informatique c'est super-large
- Tous les sujets sont "tech-isables"
- Les portes sont ouvertes, il faut juste foncer dedans.

### Échecs
- les knobs
- pas fini dans les temps
Notes:
- C'est la meta-loi


### Succès ?
- ce talk.
- j'ai appris des trucs
Notes:
- peut-être que ca me servira jamais


### Jean-Pierre Legrand (1956-2020)
<img src="/images/jean-pierre/araignées-malades-dans-la-cave-09-jean-pierre.jpg" />
Notes:
- Pour finir, je voudrais dédicacer ce talk à Jean-Pierre
- Merci de m'avoir légué ce synthé


### Le bon coin
// TODO image vente
Notes:
- si jamais ca vous intéresse d'avoir un gros synthé chez vous, je le revends.



## Merci

// TODO qrcodes et slide de fin
