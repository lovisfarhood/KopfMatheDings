# KopfMathe

KopfMathe ist eine mobile, installierbare HM1-Trainings-PWA ohne Konto, Backend, Tracking, Werbung oder Laufzeit-KI. Nach dem ersten vollständigen Laden funktioniert sie offline.

Der aktuelle Stand umfasst 18 Themen und 103 auditierte Generatorfamilien: 100 aktiv, 3 begründet deaktiviert. Klausurstandard ist vorausgewählt; MATLAB bleibt standardmäßig aus.

## Benutzung

1. Preset wählen oder Themen beliebig kombinieren.
2. Basis, Klausurstandard, Klausur+ oder Transfer wählen.
3. Kopf- oder Schrittmodus starten.
4. Mit der dauerhaft angedockten KopfMathe-Tastatur antworten.

Nur aktivierte Themen werden erzeugt. Gibt es in einer gewählten Stufe keine passende Familie, sucht die Registry innerhalb derselben Themen die nächste verfügbare Stufe und kennzeichnet das sichtbar. Gibt es im Schrittmodus in keiner Stufe eine echte Mehrschrittaufgabe, erscheint ein kontrollierter Hinweis statt einer fachfremden Ersatzaufgabe.

## Eingabe

Alle Aufgaben verwenden eine gemeinsame Tastatur und drei Antwortmuster:

- Multiple Choice als zugängliche Radiogruppe
- strukturierte Inline-Eingabe für Koeffizienten, Vektoren und Matrizen
- freie mathematische Eingabe für Zahlen, Mengen, Intervalle, Gleichungen und Ausdrücke

Die Tastatur wird als inneres `.math-keyboard`-Element in einem unveränderten `.keyboard-dock` gerendert. Dock und Workspace sind fest positioniert, berücksichtigen die iPhone-Safe-Area und bleiben beim Aufgabenwechsel bestehen. Die Aufgabenfelder sind fokussierbare DOM-Editoren mit `inputmode="none"` statt nativer Textfelder; Hardware-Tastaturen bleiben nutzbar.

Brüche, Exponenten, Wurzeln, Funktionen und das aktive Caret werden direkt im Eingabebereich strukturiert dargestellt. Die intern gespeicherte, sicher auswertbare Quellrepräsentation bleibt linear. Das ist ein echter visueller Struktur-Editor für die unterstützten Kurzformen, aber kein allgemeiner LaTeX-/Handschrifteditor und kein vollständiges digitales Schreibpapier.

Details: [INPUT_ARCHITECTURE.md](./INPUT_ARCHITECTURE.md).

## Parser und Prüfung

Der Parser verwendet weder `eval()` noch den `Function`-Konstruktor. Er unterstützt unter anderem:

- negative Zahlen, Brüche, Dezimalpunkt/-komma und negative Exponenten
- implizite Multiplikation wie `2x`, `3xy`, `2sin(x)`, `x(x+1)` und `(x+1)(x-1)`
- aufgabenspezifische Variablenlisten; `xy` kann Produkt oder ausdrücklich registrierte Variable sein
- reelle und komplexe Auswertung
- ungeordnete Mengen, Intervalle, Matrizen und Vektoren
- Gleichungsäquivalenz über normalisierte Polynomkoeffizienten beziehungsweise konservative Proportionalitätsproben
- strikte Definitionsbereiche mit expliziten Ausschlüssen und erkannten Nennernullstellen
- verlangte Formen: faktorisiert, ausmultipliziert, kartesisch komplex, polar komplex und Partialbruchform
- Eigenvektoren bis auf einen von null verschiedenen Skalar und Winkel modulo einer Periode

Die Äquivalenzprüfung ist bewusst konservativ und kein vollständiges CAS. Verzweigungsabhängige Identitäten, allgemeine transzendente Nullmengen und nicht erkannte mehrdimensionale Definitionsränder können abgelehnt werden.

## Schrittmodus und Zwischenergebnisse

Nur vier Familien sind als Schrittgeneratoren registriert:

- `integrals.partial-fractions`
- `taylor.shifted-exp`
- `linearSystems.gauss-steps`
- `decompositions.lu-complete`

Jede erzeugte Schrittaufgabe besitzt mindestens zwei validierbare Schritte; jeder Schritt hat Prompt, Eingabedefinition, Antwort und Erklärung.

Controller implementieren `collect()`, `serialize()`, `restore()`, `insertSerialized()`, `displayValue()` und `isComplete()`. Chips speichern dadurch vollständige Ausdrücke, Feldobjekte, Vektoren oder Matrizen einschließlich Dimensionen. Einsetzen, Bearbeiten und Löschen arbeitet auf der ganzen Struktur.

## Später wiederholen

„Später wiederholen“ speichert die vollständige serialisierbare Aufgabe sowie Seed, Generator, Thema, Stufe, Aufgabenmodus, Eingabemodus, Signatur und Fälligkeit. Eine Aufgabe wird nach 3 bis 10 anderen Aufgaben priorisiert erneut gezeigt, aber nur bei weiterhin aktivem Thema und passendem Aufgabenmodus. Duplikate werden verhindert; eine korrekt gelöste Wiederholung wird entfernt; ein erneutes Vormerken terminiert sie neu. Queue und Zähler liegen in Local Storage und werden vom Datenreset gelöscht.

## Einfacher, schwerer und ähnlich

„Ähnliche Aufgabe“ erzwingt dieselbe Familie mit neuer Signatur. „Einfachere Vorstufe“ und „Schwerere Variante“ verwenden zuerst explizite Beziehungen, dann eine andere unterstützte Stufe derselben Familie und zuletzt dieselbe `competenceId`. Thema und Kompetenz dürfen nicht zufällig wechseln; fehlt eine Beziehung, erscheint eine Meldung.

## Schwierigkeitsmodell

Jede aktive Familie weist genau die eine Stufe aus, die ihre aktuelle Generatorlogik tatsächlich erzeugt. Die vier Niveaus entstehen durch fachliche Progressionen zwischen Familien, zum Beispiel:

- Division durch `i` → allgemeine komplexe Division
- Produktregel → kombinierte Produkt-/Kettenregel → Fehleranalyse
- Partialbruchansatz → vollständige Zerlegung
- Taylor um 0 → verschobener Taylor → rationale Struktur
- Gauß-Faktor → vollständiger Gauß-Ablauf
- Eigenwerte → Eigenvektor
- LU-Faktor → vollständige LU-Zerlegung

Damit kann eine unveränderte Aufgabe nicht unter vier verschiedenen Labels erscheinen. Transferfamilien verlangen Methodenwahl, Strategie, Fehleranalyse oder versteckte Struktur und werden nicht nur durch größere Zahlen schwerer.

Eine kompakte Verteilung steht in [GENERATOR_OVERVIEW.md](./GENERATOR_OVERVIEW.md), das vollständige Familienaudit in [TASK_AUDIT.md](./TASK_AUDIT.md).

## Tests

```bash
npm install
npm run verify
```

Der vollständige Lauf umfasst aktuell 202 Testfälle:

- 100 Varianten je aktiver Familie = 10.000 generierte Aufgaben
- korrekte Musterantwort und konstruierte Falschantwort je Variante
- 1.000 zufällige Schrittaufgaben
- 1.600 unabhängige mathematische Referenzprüfungen über 16 Familien
- Parser-, Gleichungs-, Form- und Definitionsbereichstests
- Queue-, Persistenz- und vollständige Eingabeserialisierung
- echter Test-DOM für App, Tastatur, Hardwaretasten und alle Eingabestrukturen
- automatisierte Dock- und CSS-Prüfung für sieben mobile Viewports von 320×568 bis 430×932 sowie 844×390 im Querformat
- ausgeführte Service-Worker-Install-/Activate-/Fetch- und Offline-Fallbacktests
- Manifest-, Offline-Asset- und GitHub-Pages-Unterpfadprüfungen

Die Cloud-Browser-Navigation zu `127.0.0.1:8080` wurde in dieser Abnahme durch die Browser-Sicherheitsrichtlinie blockiert. Deshalb wird keine manuelle Sichtprüfung behauptet; die mobile Aussage beruht auf DOM-, CSS- und Geometrietests.

Alle Befehle und Abnahmedeckungen sind in [TESTING.md](./TESTING.md) dokumentiert.

## PWA und GitHub Pages

Alle Laufzeitressourcen sind lokal und relativ referenziert. `manifest.webmanifest` verwendet `./` für Start und Scope. Service-Worker-Cache `kopfmathe-v4-20260718` enthält 44 relative App-Shell-Einträge, entfernt alte Cache-Versionen und aktualisiert Assets im Hintergrund. Installieren, Aktivieren, Cache-First-Assets und Offline-Navigation am Unterpfad werden als ausgeführter Worker-Code getestet.

Pages bleibt für Branch `main`, Ordner `/(root)` und Basispfad `/KopfMatheDings/` ausgelegt:

https://lovisfarhood.github.io/KopfMatheDings/

## Lokal entwickeln

Node.js 20.19 oder neuer genügt; es gibt keine Runtime-Abhängigkeiten und keinen Bundler.

```bash
python3 -m http.server 8080
npm run verify
```

## Projektstruktur

```text
index.html / styles.css             mobile Oberfläche und feste Docks
manifest.webmanifest / sw.js       Installation, Offline-Cache, Updates
src/core/expression.js             sicherer Parser, Gleichungen, Domains, Rendering
src/core/checker.js                semantische Antwort- und Formprüfung
src/core/later-queue.js            reproduzierbare Wiederholungswarteschlange
src/core/registry.js               Themen, Stufen, Schrittfilter, Varianten
src/ui/input-model.js              Cursor-, Slot- und Matrixnavigation
src/ui/inputs.js                   Controller und vollständige Serialisierung
src/ui/math-keyboard.js            persistente innere Tastaturfläche
src/ui/layout.js                   testbare mobile Dock-Geometrie
src/topics/                        Generatorfamilien
tests/                             Regressionen und unabhängige Mathematik
```

## Klausurbezug und Grenzen

Im Repository und im bereitgestellten Work-Kontext liegen keine Altklausur-PDFs, Bilder oder Aufgabenblätter. Daher behauptet KopfMathe keine Kalibrierung an konkreten Jahren, Aufgaben oder Punkteverteilungen. Verwendet werden allgemeine, im Auftrag genannte HM1-Muster. Für einen echten Abgleich fehlen die betreffenden Klausurdokumente, Modul-/Prüfungsordnung und Angaben zu erlaubten Hilfsmitteln. Siehe [EXAM_ALIGNMENT.md](./EXAM_ALIGNMENT.md).
