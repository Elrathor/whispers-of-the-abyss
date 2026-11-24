# Whispers of the Abyss

Ein Foundry-VTT-Modul für das **„Into the Abyss“-Regelappendix** zu *Vampire: The Masquerade 5e*. Es ergänzt das System [World of Darkness 5e (wod5e)](https://github.com/WoD5E-Developers/wod5e) um einen neuen Actor-Typ **„Schatten“**.

*A Foundry VTT module that adds a “Shadow” actor type for the “Into the Abyss” rules appendix (wod5e). German and English.*

## Funktionen

- **Actor-Typ „Schatten“** mit eigenem Bogen
- **Vampir-Auswahl:** Dropdown mit allen sichtbaren Actors und einem Button, der den Bogen des Vampirs öffnet
- **Angst-Zähler** von 0 bis 10 mit Plus- und Minus-Button; ein neuer Schatten startet mit 1 Angst
- **Schnell-Buttons** zum Sammeln von Angst:
  - +1 bei Bestial Failure oder Messy Critical
  - +2 für angenommene Bonuswürfel
  - +3 bei einem Verstoß gegen eine Conviction
- **Schatten-Moves** mit Kosten, Voraussetzung und Effekt: „Ausführen“ zieht die Angst ab und ist ausgegraut, wenn die Angst nicht reicht
- **Notizen:** Freitextfeld zum Schatten und zum Charakter
- **Sprachen:** Deutsch und Englisch

## Installation

In Foundry (oder auf The Forge) über **Install Module → Manifest URL** installieren:

```
https://github.com/Elrathor/whispers-of-the-abyss/releases/latest/download/module.json
```

## Verwendung

1. Als SL einen neuen Actor vom Typ **Schatten** anlegen. Ein Schatten pro Spieler, also pro Schattenflüsterer.
2. Unter *Ownership* den jeweiligen Spieler als **Owner** eintragen und alle anderen auf **None** setzen. Die SL sieht ohnehin alles.
3. Der Spieler wählt im Bogen den Vampir aus, dessen Schatten er spielt.

Spieler mit der Stufe *Observer* können den Bogen ansehen, aber nichts ändern. Mit *Limited* lässt er sich nicht öffnen.

## Releases erstellen

In der `module.json` die `version` erhöhen (z. B. auf `0.2.0`) und auf `main` pushen. Der Workflow erstellt dann automatisch Tag und Release `v0.2.0` und hängt `module.json` und `module.zip` an. Foundry bzw. The Forge zeigen das Update danach an.

## Lizenz

MIT. Die Regeltexte stammen aus dem „Into the Abyss“-Regelappendix der Gruppe.
