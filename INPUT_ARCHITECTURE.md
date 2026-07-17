# Eingabearchitektur

## Ziel

Das Eingabesystem optimiert die mobile Rechenzeit statt die Anzahl sichtbarer Formularfelder. Alle Antworten verwenden denselben `MathInputController` und dieselbe dauerhaft angedockte `MathKeyboard`. Ein Aufgabenwechsel erzeugt neue Antwortdaten, aber keine neue Systemtastatur und keinen unkontrollierten Viewport-Sprung.

## Die drei Antwortmodi

### 1. Multiple Choice

`inputSpec.type = "choice"` rendert eine zugängliche Radiogruppe aus großen Buttons. Die mathematische Tastatur bleibt als stabile Dock-Fläche bestehen; Eingabetasten sind gedimmt, Navigation und **Prüfen** bleiben erreichbar. Distraktoren werden innerhalb der Generatorfamilie aus typischen Fehlern gebildet.

### 2. Strukturierte Inline-Eingabe

`fields` und `matrix` erzeugen ein einziges logisches Antwortobjekt. Sichtbare Slots sind `role="textbox"`-Elemente ohne native Texteingabe. Der Controller verwaltet Werte, aktive Position und Cursor gemeinsam.

Beispiele:

- `[a]x + [b]`
- `r = [r], φ = [φ]`
- `(x, y) = ([x], [y])`
- kleine Matrizen mit Zeilen- und Spaltennavigation

Pfeil rechts wechselt am Slotende zum nächsten Slot; Pfeil links kehrt am Slotanfang zurück. Oben/unten navigiert in Matrizen um eine Zeile. Tab wechselt innerhalb einer Slotgruppe und verlässt am Rand wieder regulär den Editor.

### 3. Freie mathematische Eingabe

`number`, `set` und `expression` verwenden einen kompakten linearen Editor plus Live-Interpretation. Der Nutzer kann beispielsweise

```text
-3/2*x^2 + 4*x - 1
```

eingeben. Parallel rendert die App Bruch, Exponent, implizite Multiplikation und Minus typografisch. Unvollständige Syntax liefert eine verständliche Meldung wie „Zur Klammer fehlt der Abschluss“ und keine interne Parserausgabe.

## Tastatur

Die Tastatur wird einmal beim App-Start angelegt und im Training nur mit dem aktiven Controller verbunden. Ihre drei Ebenen sind bewusst verwandt und klein:

- **Basis:** 0–9, Minus, Plus, Multiplikation, Division, Dezimalkomma, Klammern, Gleichheit, Semikolon, `x`, `i`
- **Funktionen:** `x`, `y`, `t`, `e`, `i`, `π`, `sin`, `cos`, `tan`, `ln`, `log`, Potenz, Quadrat, Wurzel, Betrag
- **Strukturen:** Bruch, Exponent, Wurzel, Klammern, Mengen- und Intervallklammern, Komma, Semikolon, Cursor, Matrixnavigation, Rücktaste und Leeren

Cursor links/rechts, Rücktaste und **Prüfen** liegen zusätzlich in einer immer sichtbaren Navigationszeile. Alle Tasten haben mindestens ungefähr 44 × 44 CSS-Pixel.

## Cursor- und Template-Modell

`MathEntryModel` besitzt eine geordnete Liste von Slots:

```js
{ key, value, cursor }
```

Templates werden als sichere Textsegmente und Slotreferenzen beschrieben. Bruch, Potenz, Wurzel und Funktionen fügen balancierte lineare Strukturen ein und platzieren den Cursor direkt im ersten relevanten Bereich:

- Bruch → `()/()`; Cursor im Zähler
- Potenz → `^()`; Cursor im Exponenten
- Wurzel → `sqrt()`; Cursor im Radikanden
- Funktion → `sin()` usw.; Cursor im Argument

Rechtsnavigation überschreitet schließende Klammern und verlässt dadurch Exponenten, Brüche und Funktionsargumente. Das sichtbare Caret bleibt immer im aktiven Slot. Diese lineare Repräsentation ist absichtlich schneller und robuster als ein vollständiges mobiles Schreibblatt.

## Hardware-Tastatur und Fokus

Fokussierbare, nicht editierbare DOM-Elemente verhindern das automatische Öffnen der iPhone-Tastatur. `keydown` verarbeitet Zahlen, Buchstaben, Rechenzeichen, Pfeile, Backspace, Delete, Escape, Tab und Enter. Unbekannte Tastenkombinationen werden nicht abgefangen. Sichtbare `:focus-visible`-Ränder, ARIA-Labels und `aria-valuetext` geben Position und Inhalt wieder.

## Parser

`src/core/expression.js` implementiert einen rekursiven Pratt-/Präzedenzparser. Unterstützt werden:

- Dezimalpunkt und Dezimalkomma
- wissenschaftliche Schreibweise
- `+`, `−`, `*`, `/`, `^`
- implizite Multiplikation wie `2x`
- runde, eckige und geschweifte Klammern
- `sqrt`, `sin`, `cos`, `tan`, `ln`, `log`, `abs`, `exp`
- `π`, `e`, `i`
- reelle und komplexe Auswertung

Es gibt kein `eval()`, keinen `Function`-Konstruktor und keine dynamische Codeausführung. Unbekannte Bezeichner sind nur mathematische Variablen; bei konkreten Zahlenantworten werden sie abgewiesen.

## Antwortprüfung

- Zahlen werden, wenn möglich, als gekürzte rationale Zahl verglichen; exakte Konstantenausdrücke werden sicher ausgewertet.
- Algebraische Ausdrücke werden geparst und an mehreren kontrollierten, domänengültigen Stellen verglichen. Mindestens vier unabhängige gültige Punkte sind erforderlich.
- Lösungsmengen werden ohne Reihenfolge und mit korrekter Kardinalität verglichen.
- Matrizen benötigen exakt die verlangte Dimension und werden elementweise geprüft.
- Eigenvektoren werden proportional verglichen; der Nullvektor ist ausgeschlossen.
- Komplexe Zahlen werden als Real-/Imaginärpaar ausgewertet, einschließlich Eulerform.
- Winkel werden modulo einer expliziten Periode, standardmäßig `2π`, verglichen.

## Schrittmodus

Eine Aufgabe kann zwei bis fünf `steps` mit eigenem Prompt, Input-Spec, Antwort, Erklärung und Chipwert besitzen. Nach einem korrekten Schritt wird der Chip gespeichert und der nächste Schritt geladen. **Direktantwort** wechselt jederzeit zur Gesamtantwort. Allgemeine Aufgaben können über **Ergebnis merken** ebenfalls Chips anlegen.

## Warum keine externe Editorbibliothek?

Der bestehende Vanilla-JS-Stack benötigte keinen vollständigen Neuaufbau als CAS oder digitales Schreibpapier. Die verlangten kurzen HM1-Ausdrücke lassen sich mit einem kleinen, auditierten Parser und kontrollierter DOM-Darstellung vollständig offline abdecken. Die eigene Lösung vermeidet mehrere Megabyte Editor-/CAS-Code, externe Build-Schritte, Supply-Chain-Risiko und eine zweite konkurrierende virtuelle Tastatur. Sie bleibt lokal gebündelt, PWA-tauglich und testbar.

Diese Entscheidung wäre neu zu bewerten, falls später mehrzeilige Herleitungen, allgemeine LaTeX-Eingabe, Handschrift oder vollständige symbolische Beweise gefordert werden.
