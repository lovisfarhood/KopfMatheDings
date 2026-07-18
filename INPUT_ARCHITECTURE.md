# Eingabearchitektur

## Komponenten und Docking

`#keyboard-dock.keyboard-dock` ist die äußere, fest positionierte Dock-Komponente. `MathKeyboard` ergänzt oder ersetzt diese Klasse nie. Beim Start wird genau ein inneres Element erzeugt:

```text
section.keyboard-dock
└── div.math-keyboard
    ├── Ebenen
    ├── Navigation + Prüfen
    └── Tastenraster
```

Beim Aufgabenwechsel wird nur der aktive Controller mit `setController()` ausgetauscht. Die Tastatur bleibt im DOM, fährt nicht neu ein und verliert ihre Position nicht. Multiple Choice setzt lediglich `.is-choice` auf der inneren Fläche; nicht benötigte Tasten werden gedimmt.

`workspace-dock` liegt mit `bottom: keyboard-height + safe-area-inset-bottom` exakt über der Tastatur. Der Aufgabenbereich erhält Bottom-Padding aus Tastatur-, Workspace- und Sicherheitsbereich. `src/ui/layout.js` stellt dieselben Geometrien als testbare Funktion bereit.

## Einheitliche Controller-Schnittstelle

Alle Eingabecontroller bieten:

- `collect()`
- `serialize()`
- `restore(serialized)`
- `insertSerialized(serialized)`
- `displayValue()`
- `isComplete()`

Serialisierte Werte tragen ihren Typ:

```js
{ type: "expression", value: "-3/2*x^2+4*x-1" }
{ type: "number", value: "-7" }
{ type: "set", value: "-2;3" }
{ type: "fields", values: { A: "2", B: "-3" } }
{ type: "fields", subtype: "vector", values: { x: "2", y: "-1" } }
{ type: "matrix", rows: 2, columns: 2, values: [["1", "2"], ["3", "4"]] }
```

Restore prüft Typ, Feldschlüssel, Subtyp und Matrixdimensionen. Ein inkompatibler Chip wird nicht teilweise eingesetzt. Leere strukturierte Antworten gelten nicht als vollständig.

## Drei Antwortmodi

### Multiple Choice

`choice` rendert eine ARIA-Radiogruppe. Genau eine Antwort ist aktiv. Prüfen ohne Auswahl liefert eine verständliche Meldung.

### Strukturierte Inline-Eingabe

`fields` und `matrix` besitzen ein gemeinsames `MathEntryModel`. Jeder Slot speichert Schlüssel, Wert und Cursor. Pfeile wechseln an Slotgrenzen, oben/unten navigiert um eine Matrixzeile, Tab wechselt intern und verlässt den Editor am äußeren Rand.

Vektoren sind `fields` mit `subtype: "vector"`. Matrizen speichern zusätzlich Zeilen- und Spaltenzahl.

### Freie mathematische Eingabe

`number`, `expression`, `set` und `interval` verwenden eine lineare, sichere Quellrepräsentation. Der aktive Editor rendert diese Quelle unmittelbar strukturiert:

- `()/()` als visuellen Bruch; Caret startet im Zähler
- `^()` als hochgestellten Exponenten
- `sqrt()` mit Radikandenbereich
- `sin()`, `cos()`, `ln()` usw. mit Argumentbereich
- gepaarte Klammern und sichtbare leere Strukturplätze

Die Cursorbewegung folgt den Quellpositionen. Dadurch gelangt Pfeil rechts vom Zähler in den Nenner und anschließend aus dem Bruch, beziehungsweise aus Exponent, Wurzel oder Funktionsargument. Bei noch unvollständiger Hardware-Eingabe fällt nur die betreffende Darstellung konservativ auf lineare Anzeige zurück.

Die Quelle bleibt absichtlich linear; die sichtbare Bearbeitung ist für die unterstützten Kurzformen zweidimensional. Es wird keine externe Editorbibliothek und kein vollständiger LaTeX-/Handschrifteditor behauptet.

## Tastatur und native Systemtastatur

Die drei Ebenen Basis, Funktionen und Strukturen verwenden dieselbe Komponente. Minus, Navigation, Rücktaste und Prüfen bleiben erreichbar. Aufgabeneditoren sind keine `input`- oder `textarea`-Elemente; sie tragen `role="textbox"`, `inputmode="none"` und `virtualkeyboardpolicy="manual"`. Pointer-Fokus wird ohne native Texteingabe gesetzt. Hardware-Tastaturen verarbeiten Zahlen, Variablen, Operatoren, Pfeile, Backspace, Delete, Escape, Tab und Enter.

## Schrittmodus

Eine Familie darf `taskModes: ["step", ...]` nur führen, wenn jede erzeugte Aufgabe mindestens zwei Schritte besitzt. Jeder Schritt benötigt Prompt, Eingabedefinition, Antwort und Erklärung und wird mit `checkTaskAnswer()` validiert.

Aktive Schrittfamilien:

- `integrals.partial-fractions` – drei Schritte
- `taylor.shifted-exp` – zwei Schritte
- `linearSystems.gauss-steps` – drei Schritte
- `decompositions.lu-complete` – drei Schritte

Automatische und manuelle Chips speichern immer `controller.serialize()`, nie nur den aktiven Slot. Direktantwort und Schrittansicht verwenden denselben Controllervertrag.

## Parser

`src/core/expression.js` implementiert einen rekursiven Präzedenzparser ohne dynamische Codeausführung.

Unterstützt werden Zahlen, Dezimalpunkt/-komma, wissenschaftliche Schreibweise, `+ − * / ^`, Klammern, Funktionen, `pi/e/i`, Gleichungen und implizite Multiplikation. Standard-Einzelvariablen sind `x y z t n k a b c r` und `lambda`. Eine Aufgabe kann `allowedVariables` setzen; mehrbuchstabige ausdrücklich registrierte Variablen bleiben dann atomar, sonst wird etwa `xy` als `x*y` gelesen.

## Äquivalenzmodi

- `algebraic`: Wertegleichheit an kontrollierten gültigen Punkten
- `equation`: beide Seiten als Nullform; Polynome bis auf einen von null verschiedenen Skalar normalisiert
- `strict-domain`: algebraische Gleichheit plus Definitionsbereich an expliziten Ausschlüssen und erkannten Nennernullstellen
- `factored`: algebraisch korrekt und als Produkt additiver Faktoren
- `expanded`: algebraisch korrekt ohne nicht ausmultiplizierte Summenprodukte
- `cartesian-complex`: kartesische komplexe Darstellung
- `polar-complex`: Polar-/Eulerstruktur
- `partial-fractions`: Summe mehrerer Bruchterme

Verlangte Formen werden durch `makeTask()` sichtbar im Prompt ergänzt oder im Schritttext ausdrücklich genannt.

## Grenzen

Der Parser ist kein CAS. Polynomgleichungen werden exakt strukturell normalisiert; allgemeinere Gleichungen verwenden eine konservative Proportionalitätsprüfung der Nullformen. Automatische Definitionsbereichserkennung konzentriert sich auf explizite Ausschlüsse, Nennernullstellen und elementare reelle Funktionsbedingungen. Allgemeine branchensensitive Identitäten können abgelehnt werden.
