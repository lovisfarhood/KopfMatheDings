# Changelog

## 2.0.0 – 2026-07-17

### Eingabe und Prüfung

- persistente, dreistufige KopfMathe-Tastatur mit sicherem Minus auf iPhone
- gemeinsamer Cursor-/Slot-Controller ohne native Aufgabeninputs
- strukturierte Inline-Templates und Matrixnavigation
- freie Formeleingabe mit Live-Interpretation für Brüche, Exponenten und Wurzeln
- sicherer Parser ohne `eval()` für reelle, algebraische und komplexe Ausdrücke
- Äquivalenzprüfung, ungeordnete Mengen, Matrixdimensionen, skalare Eigenvektoren und Winkel modulo `2π`

### Produkt und UX

- echte Themenmehrfachauswahl mit Alle/Keine und sechs Presets
- neue Stufen Basis, Klausurstandard, Klausur+ und Transfer / Knobeln
- unabhängiger Kopf- und Schrittmodus
- progressive Hinweise, sofortiger Skip mit Undo und kompakte Lösungen
- ähnliche/einfachere/schwierigere/spätere Aufgaben
- Step Chips zum Einsetzen, Bearbeiten und Löschen
- minimalistischer Dark Mode, Safe Areas, große Tap-Flächen und reduzierte Bewegung
- lokaler Reset aller Lern- und Einstellungsdaten

### Aufgaben

- 102 auditierte Familien, 99 aktiv und 3 deaktiviert
- 24 neue klausurnahe Familien für komplexe Zahlen, Ableitungen, Integrale, Taylor, Matrizen, LGS, Vektorräume, Orthogonalität und Zerlegungen
- Basis-only-Sperre verhindert triviale Aufgaben bei Klausurstandard
- metadatenbasierte Gewichtung, Wiederholungssperre und lokale Fehlerverstärkung

### PWA und Qualität

- Service-Worker-Cache `kopfmathe-v3-20260717` mit allen neuen Modulen
- relative Pfade für `/KopfMatheDings/`
- aktualisiertes Dark-Mode-Manifest
- 144 automatisierte Tests einschließlich 10.098 generierter Aufgaben
- statische Produktionsprüfung für Syntax, Manifest, Assets und Offline-Cache
