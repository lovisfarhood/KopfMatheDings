# KopfMathe

KopfMathe ist eine installierbare Mathematik-Übungs-App für kurze Einheiten auf dem iPhone. Nach dem Start erscheint direkt eine zufällig erzeugte Aufgabe. Es gibt keine Konten, Werbung, Streaks, Cloud-Dienste oder Laufzeit-KI.

## Kurz benutzen

1. Thema und Schwierigkeit wählen.
2. **Aufgabe starten** antippen.
3. Antwort eingeben und **Prüfen** wählen.

Nach dem ersten vollständigen Laden funktioniert die App offline.

## Niveau und Themen

Die Aufgaben reichen vom Schul-Kopfrechnen bis zu kompakten Rechenbausteinen aus **Mathematik 1 für Maschinenwesen und CIW (TUM)**. Große Klausuraufgaben werden in Schritte von meist 5 bis 90 Sekunden zerlegt.

Enthalten sind 18 auswählbare Themen und 78 Generatorfamilien: Rechengrundlagen, Algebra, komplexe Zahlen, Grenzwerte, Folgen, Reihen, Ableitungen, Taylorpolynome, Integrale, Matrizen, lineare Gleichungssysteme, Vektorräume, Orthogonalität und Approximation, Matrixzerlegungen, Numerik, Differentialgleichungen, Wahr/Falsch und optional MATLAB-Verständnis.

Nicht enthalten sind insbesondere Eigenwerte, mehrdimensionale Analysis, Fourier-/Laplace-Transformation, Stochastik und lange Beweise.

## Schwierigkeit

- **Locker:** kleine Zahlen und meist ein Schritt
- **HM1-Baustein:** typische kurze HM1-Rechnungen
- **Klausurnah kompakt:** klausurnahe Konzepte mit einfachen Zahlen
- **Automatisch:** 45 % Locker, 40 % HM1, 15 % klausurnah

## Lokal starten

Auf macOS **KopfMathe starten.command** doppelt anklicken. Falls macOS blockiert: Rechtsklick → **Öffnen**.

Alternativ im Projektordner:

```bash
python3 -m http.server 8080
```

Danach `http://localhost:8080` öffnen.

## Tests

Node.js 20 oder neuer wird nur für Tests benötigt:

```bash
npm test
```

Geprüft werden exakte Brüche, Dezimalkomma, Lösungsmengen, komplexe Zahlen, Vektoren, Matrizen, Wahr/Falsch, seeded Zufall, Registry sowie 100 erzeugte Aufgaben je Generatorfamilie.

## iPhone-Installation

1. Veröffentlichte URL in Safari öffnen.
2. Teilen → **Zum Home-Bildschirm**.
3. **Hinzufügen**.

Safari zeigt keine automatische Installationsabfrage. Für das erste vollständige Laden ist Internet nötig.

## Offline und Updates

Der Service Worker speichert Oberfläche, alle Themenmodule und Icons. Aufgaben entstehen vollständig auf dem Gerät. Bei einer neuen Version erscheint **Neu laden**. Local Storage enthält nur Einstellungen, Sitzungszähler und die letzten 20 Signaturen.

## GitHub Pages

Kein Build-Schritt nötig. Unter **Settings → Pages**: **Deploy from a branch**, Branch **main**, Ordner **/(root)**, dann **Save**.

## Struktur

```text
index.html / styles.css     Oberfläche und mobiles Design
manifest.webmanifest / sw.js PWA und Offline-Cache
src/core/                  Brüche, Parser, Checker, Zufall, Registry, Speicher
src/ui/                    Eingabekomponenten
src/topics/                Themenmodule und Generatoren
tests/                     Node-Test-Suite
```

## Generator ergänzen

Im passenden Themenmodul eine Generatorfamilie mit `generator(...)` und `makeTask(...)` ergänzen, in das exportierte Array aufnehmen und `npm test` ausführen. Neue Modulpfade zusätzlich in `sw.js` aufnehmen und die Cache-Version erhöhen. Generatoren greifen nie auf das DOM zu.

## Bekannte Einschränkungen

- Freie symbolische Formeleingabe wird bewusst durch robuste Zahlenfelder und Multiple Choice ersetzt.
- Offline-Betrieb beginnt nach dem ersten vollständigen Online-Laden.
- Es gibt absichtlich keine langfristige Leistungsanalyse oder Synchronisierung.

## Datenschutz

Kein Backend, keine Datenbank, keine externen APIs, keine Analytics und kein Tracking.
