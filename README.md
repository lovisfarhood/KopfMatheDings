# KopfMathe

KopfMathe ist eine mobile, installierbare Mathematik-PWA für kurze, klausurnahe Trainingseinheiten. Die App funktioniert ohne Konto, Backend, Tracking oder Laufzeit-KI und nach dem ersten vollständigen Laden auch offline.

Die aktuelle Architektur umfasst 18 Themen, 102 auditierte Generatorfamilien, davon 99 aktiv. Drei schwache Familien sind bewusst deaktiviert. Die Standardauswahl ist **Klausurstandard**; Basisaufgaben werden dort nicht beigemischt.

## Benutzung

1. Ein Preset wählen oder beliebig viele Themen-Chips kombinieren.
2. **Basis**, **Klausurstandard**, **Klausur+** oder **Transfer / Knobeln** wählen.
3. **Kopfmodus** oder **Schrittmodus** wählen und das Training starten.
4. Mit der dauerhaft angedockten KopfMathe-Tastatur antworten.

Die Themenauswahl wird lokal gespeichert. „Gemischt“ ist kein verstecktes Thema mehr: Nur ausdrücklich aktive Themen werden verwendet.

## Eingabe und Prüfung

KopfMathe verwendet drei Antwortmuster mit einem gemeinsamen Controller:

- Multiple Choice mit aus typischen Fehlern abgeleiteten Distraktoren
- strukturierte Inline-Antworten für Koeffizienten, Vektoren und Matrizen
- freie mathematische Ausdrücke mit zweidimensionaler Vorschau für Brüche, Potenzen und Wurzeln

Die eigene Tastatur enthält Zahlen, Minus, Grundrechenarten, Variablen, Konstanten, Funktionen, Brüche, Potenzen, Wurzeln, Mengen- und Intervallklammern sowie Cursor-, Lösch- und Prüftasten. Aufgabenfelder sind keine nativen Texteingaben; dadurch öffnet sich auf dem iPhone nicht ungewollt die Systemtastatur. Hardware-Tastaturen bleiben nutzbar.

Der sichere Parser verwendet kein `eval()`. Er prüft unter anderem:

- exakte und dezimale Zahlen, negative Werte und Brüche
- algebraisch äquivalente Ausdrücke wie `x+x` und `2x`
- faktorisierte und ausmultiplizierte Darstellungen
- ungeordnete Lösungsmengen
- Matrizen mit Dimensionsprüfung
- Eigenvektoren bis auf einen von null verschiedenen Skalarfaktor
- komplexe kartesische und Euler-Darstellungen
- Argumente modulo `2π`

Details stehen in [INPUT_ARCHITECTURE.md](./INPUT_ARCHITECTURE.md).

## Schrittmodus

Der Schrittmodus hält Zwischenergebnisse als antippbare Chips oberhalb der Tastatur sichtbar. Chips lassen sich einsetzen, zum Bearbeiten in die aktive Eingabe übernehmen oder löschen. Kuratierte mehrstufige Abläufe bestehen für Gauß-Verfahren, Partialbruchzerlegung, verschobene Taylorpolynome und LU-Zerlegung. Jede Aufgabe kann außerdem eigene Zwischenergebnisse speichern.

## Aufgabenqualität

Die Auswahl gewichtet Generatorfamilien und realistische Klausurthemen, blockiert unmittelbare Wiederholungen und verstärkt lokal erkannte Schwächen. Nach Fehlern, Hinweisen, Überspringen oder Lösungseinblick stehen ähnliche Aufgaben, einfachere Vorstufen, schwierigere Varianten und spätere Wiederholung bereit.

Das vollständige Audit ist in [TASK_AUDIT.md](./TASK_AUDIT.md) dokumentiert. Die Zuordnung zu wiederkehrenden HM1-Mustern steht in [EXAM_ALIGNMENT.md](./EXAM_ALIGNMENT.md).

## Lokal entwickeln

Es gibt keine Runtime-Abhängigkeiten und keinen Bundler. Erforderlich sind ein statischer Webserver und für Tests Node.js 20 oder neuer.

```bash
python3 -m http.server 8080
```

Danach `http://127.0.0.1:8080` öffnen. Auf macOS kann alternativ **KopfMathe starten.command** verwendet werden.

## Tests und Produktionsprüfung

```bash
npm test
npm run build
```

`npm test` erzeugt 102 Varianten je aktiver Familie: **10.098 zufällig parametrisierte Aufgaben**. Zusätzlich werden Parser, Äquivalenzprüfung, Eingabemodell, Themenmehrfachauswahl, lokale Speicherung, Manifest, Offline-Cache und mobile Basisanforderungen geprüft.

`npm run build` ist bei dieser statischen Anwendung eine Produktionsprüfung. Sie validiert JavaScript-Syntax, Manifest, lokale Assets, externe Laufzeitressourcen und Service-Worker-Abdeckung.

## PWA, Offline und Updates

`manifest.webmanifest` verwendet relative URLs und funktioniert damit unter dem GitHub-Pages-Basispfad `/KopfMatheDings/`. Der Service Worker cached die vollständige App-Shell und alle lokalen Module. Navigation nutzt online eine frische Version und offline die gecachte `index.html`; Assets werden aus dem Cache beantwortet und im Hintergrund aktualisiert. Alte Cache-Versionen werden bei Aktivierung gelöscht.

Auf dem iPhone: URL in Safari öffnen → Teilen → **Zum Home-Bildschirm** → **Hinzufügen**.

## GitHub Pages

Die App benötigt keinen Build-Output. Pages wird aus Branch `main`, Ordner `/(root)` veröffentlicht. Alle Laufzeitpfade sind relativ; die erwartete URL lautet:

`https://lovisfarhood.github.io/KopfMatheDings/`

## Projektstruktur

```text
index.html / styles.css          Oberfläche und mobiles Dark-Mode-Layout
manifest.webmanifest / sw.js    Installation, Offline-Cache und Updates
src/core/expression.js          sicherer Parser, Auswertung und Formel-Rendering
src/core/checker.js             semantische Antwortprüfung
src/core/registry.js            Themen, Presets, Metadaten und Balancing
src/ui/input-model.js           Cursor-, Slot- und Matrixnavigation
src/ui/inputs.js                drei Antwortmodi
src/ui/math-keyboard.js         persistente KopfMathe-Tastatur
src/topics/                     bestehende und neue Generatorfamilien
scripts/check-static.mjs        statische Produktionsprüfung
tests/                          automatisierte Regressionstests
```

## Datenschutz

Einstellungen, letzte Aufgaben, Fehlerhistorie und „später wiederholen“ liegen ausschließlich in Local Storage. Die Einstellungen bieten einen vollständigen lokalen Reset. Es gibt keine externen Schriften, Skripte, Analysewerkzeuge, Werbung oder Datenübertragung.

## Bewusste Grenzen

- Die Äquivalenzprüfung ist ein sicherer domänenspezifischer Parser mit kontrollierten Stichproben, kein vollständiges Computer-Algebra-System. Verzweigungsabhängige Identitäten können daher bewusst abgelehnt werden.
- Die Formeleingabe bleibt für mobile Geschwindigkeit linear editierbar und zeigt parallel die zweidimensionale Interpretation; sie ist kein vollständiges digitales Schreibpapier.
- Die kuratierten Altklausur-Muster beruhen auf dem im Projektauftrag verfügbaren HM1-Kontext. Im Repository liegen keine Klausur-PDFs, daher werden keine konkrete Klausur oder Jahreszahl behauptet und keine Originalaufgaben kopiert.

Wesentliche Änderungen sind in [CHANGELOG.md](./CHANGELOG.md) aufgeführt.
