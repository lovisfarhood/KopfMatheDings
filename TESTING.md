# Automatische Abnahme

## Vollständiger Lauf

```bash
npm install
npm run verify
```

`npm run verify` führt alle Node-Tests und anschließend die statische Produktionsprüfung aus. Einzelbereiche lassen sich gezielt wiederholen:

```bash
npm run test:generators
npm run test:math
npm run test:ui
npm run test:pwa
npm run check
```

## Abgedeckte Bereiche

| Bereich | Automatische Abnahme |
|---|---|
| Generatoren | 100 aktive Familien × 100 Varianten = **10.000** |
| Unabhängige Mathematik | 16 Familien × 100 Varianten = **1.600**; zusätzlich Singularitäts- und Nullpivotfälle |
| Schrittmodus | genau 4 kuratierte Familien; **1.000** Zufallsauswahlen mit mindestens zwei vollständig validierbaren Schritten |
| Parser und Antwortprüfer | Zahlen, Brüche, Ausdrücke, Gleichungen, Mengen, Intervalle, Matrizen, Eigenvektoren, komplexe Zahlen, Winkel, Definitionsbereiche, verlangte Formen, Fehlsyntax und Code-Injection-Abwehr |
| Eingabe und Tastatur | Cursor, Slots, Matrizen, Hardwaretasten, alle Antwortmodi, vollständige Serialisierung und stabiles `keyboard-dock` in einem echten Test-DOM |
| Wiederholungswarteschlange | 3–10 Aufgaben Verzögerung, Neustart, Deduplizierung, Themen-/Moduskompatibilität, vollständiger Aufgaben-Snapshot, Erledigen und Neu-Terminieren |
| Mobile Viewports | 320×568, 375×667, 375×812, 390×844, 393×852, 430×932 und 844×390; Dock-Reihenfolge, Safe Area, responsive Regeln und 44px-Touchziele |
| PWA und Offline | Manifest, relative Pages-Pfade, 44 App-Shell-Einträge, Install/Activate/Fetch, Cache-First-Assets, Offline-Navigation, Cache-Bereinigung und Worker-Update |
| Produktion | alle 35 Runtime-Module syntaktisch geprüft; 42 verpflichtende lokale Runtime-Assets im Service Worker; insgesamt 37 JavaScript-Dateien; keine externen Ressourcen |

## Dokumentierter Abnahmestand

Am 18. Juli 2026 bestanden **202 von 202 automatisierten Tests**. Die statische Produktionsprüfung bestätigte **42 verpflichtende Offline-Assets**, den GitHub-Pages-Unterpfad `/KopfMatheDings/` und **37 JavaScript-Dateien**.

Die DOM-Prüfung lädt die vollständige App mit `linkedom`, startet ein mobiles Schritttraining, hält das Tastatur-Dock stabil und durchläuft den persistenten Wiederholungsfluss. Die Service-Worker-Prüfung führt den Worker in einer isolierten VM aus und simuliert Installations-, Aktivierungs-, Nachrichten- und Offline-Fetchereignisse.

## Nicht automatisierbare Grenze

Die manuelle Cloud-Browser-Sichtprüfung war nicht möglich: Der Zugriff auf `127.0.0.1:8080` wurde durch die Browser-Sicherheitsrichtlinie blockiert. Es wurde keine Umgehung und keine Wiederholungsschleife verwendet. DOM-, CSS-, Tastatur- und Viewporttests prüfen Struktur und Geometrie, ersetzen aber keine menschliche pixelgenaue Sichtprüfung oder einen vollständigen Browser-Layout-Engine-Test.
