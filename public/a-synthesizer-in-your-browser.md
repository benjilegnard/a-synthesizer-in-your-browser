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


### Mon oncle Jean-Pierre

<img src="images/jean-pierre/araignées-malades-jean-pierre.jpg" />

Notes:
- lui, c'est mon oncle Jean-pierre.
- enfin, c'était.
- là, il est dans la cave avec le groupe de mon père,
- et il joue du synthétiseur
- on est en mai 1980 ou quelque chose comme ça


### Les araignées malades

<img src="images/jean-pierre/araignées-malades-combined.jpg" />

Notes:
- avec mon père, qui prends la photo ici.
- ils ont un groupe et ils jouent dans les caves et quelques balles musettes du nord-pas de calais ou de la somme.
- Stan Kogut-Kubiak à la basse
- Daniel Wasilewski à la batterie


### Le KORG MS-20

<img src="images/korg-official-photo.jpg" />
Notes:
- Le MS-20, sorti en 1978, c'est un synthétiseur, un clavier monophonique (une seule note à la fois)
- extrêmement populaire dans les années 80, grand public par rapport aux Moog et synthés existant
- simple à utiliser


### Vidéo?

// TODO


### Idée bizarre ou idée de  génie ?
Notes:
- Du coup je me lance dans ce projet bizarre.
- D'implémenter ce synthétiseur spécifiquement.
- Et donc la première question, c'est comment on fait de la musique avec un ordinateur.



## La musique


### Sans musique, la vie serait une erreur
<span class="fragment">Frédéric <span class="fragment strike">Nitch</span></span>
<span class="fragment"><span class="fragment strike">, Nietche</span></span>
<span class="fragment"><span class="fragment strike">, Nietsche</span></span>
<br/>
<span class="fragment">Friedrich Nietzsche</span>


### La musique c'est le silence entre les notes
Claude Debussy

Notes:
- En vrai, il l'avait piqué à mozart


### Physiquement

<img src="images/memes/sound-system-ryan-dunn.gif" style="width: 1280px"/>

Notes:
- Vibration dans l'air => Vos Tympans


### Source:

<img src="images/memes/sound-system-ryan-dunn-2.gif" style="width: 1280px"/>

Notes:
- sourcez tout.


### La musique, c'est des maths

<img src="images/memes/functions-describe-the-world.png"/>

Notes:
- Moi après trois bière
- Si vous connaissez pas cette vid elle est trop bien
- Tout peut être décrit par une fonction mathématique


### Le son, pour un ordinateur

C'est un `Array<number>`.
```typescript
[0.52, 0.5, 0.3]
```

Notes:
- todo
- on va plutôt utiliser des structures toutes faites pour ça. (Buffer)


### C'est un peu vague
<img src="schemas/trigonometry.svg" />
<!-- <div id="trigonometry" class="graphics"></div>-->
Notes:
- Pour faire une belle onde sonore,
- dans ce talk on va parler de maths un peu donc les bases


### Un slide avec du tsx ?

<div id="sound-test-sine" class="graphics"></div>
Notes:
- tout mes examples là dans mes slides, ils utilisent une API qui est disponible dans mes navigateurs


### Faites du bruit

Si je remplis un tableau de valeur aléatoires

```typescript
context = new AudioContext();
const bufferSize = 2 * context.sampleRate;
const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
const output = noiseBuffer.getChannelData(0);
for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
}
```
Notes:
- Math.random() emphasize.


### Faites du bruit (2)

<div id="sound-test-noise" class="graphics"></div>
Notes:
- parlons donc un peu de cette API.



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
- codepen vers 2015 / 2016


### Example de base.

```typescript[|2-3|4|5|6|7]
if (window.AudioContext) {
    context = new AudioContext();
    oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = 440;
    oscillator.start();
    oscillator.connect(context.destination);
}
```

Notes:
- ça c'est le code de mon slide avec la sinusoide


### AudioNode
<img src="images/schemas/audio-node-class-diagram.png" />

Notes:
- ça hérite d'EventTarget, parce qu'on peut lancer des événements.
```mermaid
classDiagram
    EventTarget <|-- AudioNode
    AudioNode <|-- PannerNode
    AudioNode <|-- GainNode
    AudioNode <|-- OscillatorNode
    AudioNode <|-- AudioBufferSourceNode
    AudioNode <|-- MediaElementSourceNode
    class AudioNode{
      +number channelCount
      +number numberOfInputs
      +number numberOfOutputs
      +connect()
      +disconnect()
    }
```


### Des noeuds (au cerveau?)

```
AnalyzerNode
AudioBufferSourceNode
AudioWorkletNode
BiquadFilterNode
ChannelMergerNode
ChannelSplitterNode
ConstantSourceNode
ConvolverNode
DelayNode
DynamicsCompressorNode
GainNode
GainNode
IIRFilterNode
MediaElementAudioSourceNode
MediaStreamAudioDestinationNode
MediaStreamAudioSourceNode
OscillatorNode
PannerNode
StereoPannerNode
WaveShaperNode
```
<https://developer.mozilla.org/en-US/docs/Web/API/AudioNode>
Notes:
- api orientée object
- AudioNode la super classe
- plusieurs entrée / sortie
- connect() / disconnect() + channels


### graphe de routage audio

// TODO schema


### Rigolo ?

L'API est concue exactement comme on utiliserais un synthétiseur.

//TODO svg connect
Notes:
- maintenant qu'on a vu ça, revenons en détail sur le MS-20


## Features du MS-20

<abbr title="Read The Fantastic Manual">R.T.F.M.</abbr>


<img src="images/korg-docs/ms-20-owners-manual-01.png" />


<img src="images/korg-docs/ms-20-owners-manual-02.png" />


<img src="images/korg-docs/ms-20-owners-manual-03.png" />


<img src="images/korg-docs/ms-20-owners-manual-04.png" />


<img src="images/korg-docs/ms-20-owners-manual-05.png" />


<img src="images/korg-docs/ms-20-owners-manual-06.png" />


<img src="images/korg-docs/ms-20-owners-manual-07.png" />


<img src="images/korg-docs/ms-20-owners-manual-08.png" />


<img src="images/korg-docs/ms-20-owners-manual-09.png" />


<img src="images/korg-docs/ms-20-owners-manual-10.png" />


<img src="images/korg-docs/ms-20-owners-manual-11.png" />


<img src="images/korg-docs/ms-20-owners-manual-12.png" />


<img src="images/korg-docs/ms-20-owners-manual-13.png" />


<img src="images/korg-docs/ms-20-owners-manual-14.png" />


## Conception


### korg + visual interface

Notes:
- Ce qui est bien avec le 

### korg + hack du cable panel (on le voit sur le synthé: c'est le meilleur manuel)


### thinking in components : mon plan d'action


### keyboard


### knobs (oscillateurs et filtres)


### patchboard



## Le clavier

Notes:
- la partie la plus importante
- Celle qui définit la note


###  fréquences en entrée

`$$ f=\frac1{T} $$`
Notes:
- f = le nombre de fois par seconde ou une période arrive
- en Hertz


###  merci wikipedia (todo lien)
<https://en.wikipedia.org/wiki/Piano_key_frequencies>


###  demi-tons, touches noires-blanches
<img src="schemas/piano-keys.svg" />
Notes:
- Chiffre magique
- Dans notre musique européenne (ethno-centrisme)
- l'espace entre chaque note est un "demi-ton"


### Nombre magique
`$$ \sqrt[12]{2} $$`<!-- .element: class="fragment" -->
`$$ 2^{1/12} $$`<!-- .element: class="fragment" -->
`$$ 1,0594631 $$`<!-- .element: class="fragment" -->
Notes:
- twelvth root of 2 / racine douzième de deu
- ou 2 puissance 1/12e
- nombre magique


### Une boucle for


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



## Gestion d'état


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
- Signal en entrée.



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
<img src="images/jean-pierre/araignées-malades-dans-la-cave-09-jean-pierre.jpg" />
Notes:
- Pour finir, je voudrais dédicacer ce talk à Jean-Pierre
- Merci de m'avoir légué ce synthé


### Le bon coin
<img src="images/memes/korg-on-ebay-japan.png" />
Notes:
- si jamais ca vous intéresse d'avoir un gros synthé chez vous, je le revends.
- Juste pour vous donner une image de l'argus de ce genre de truc



## Merci

// TODO qrcodes et slide de fin
