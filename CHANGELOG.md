# Changelog

## 2.1.0 – 2026-07-18

### Kritische Reparaturen

- `.keyboard-dock` bleibt als äußere feste Komponente erhalten; `.math-keyboard` wird nur noch innen gerendert
- Workspace, Tastatur, Safe Area und Aufgabenpadding teilen eine getestete Dock-Geometrie
- das Aufgabenpadding reserviert die iOS-Safe-Area nun zusätzlich zu Tastatur und Workspace
- Standard-`taskModes` ist `["head"]`; nur vier echte Mehrschrittfamilien führen `step`
- ungeeignete Schritt-Auswahl liefert einen kontrollierten Zustand statt einer fachfremden Grundrechenaufgabe
- 1.000 zufällige Schrittaufgaben garantieren mindestens zwei vollständig validierbare Schritte

### Wiederholung und Varianten

- „Später wiederholen“ speichert eine vollständige reproduzierbare Aufgabenaufnahme mit Seed, Metadaten, Signatur und Fälligkeit
- Wiedervorlage nach 3–10 anderen Aufgaben, persistent, dedupliziert, themen- und modusgebunden
- korrekt gelöste Wiederholungen werden entfernt; erneutes Vormerken terminiert neu
- explizite `easierPredecessor`-/`harderVariant`-/`competenceId`-Beziehungen verhindern zufällige Themenwechsel
- neue Vorstufe `integrals.partial-fractions-setup`

### Eingabe und Mathematik

- vollständige Controller-Schnittstelle für Sammeln, Serialisieren, Wiederherstellen, Einsetzen, Anzeige und Vollständigkeit
- Chips speichern vollständige Ausdrücke, Felder, Vektoren und Matrizen samt Dimensionen
- Brüche, Exponenten, Wurzeln, Funktionen, leere Strukturplätze und Caret erscheinen direkt im aktiven Editor
- implizite Multiplikation trennt `xy` aufgabengesteuert als `x*y`
- separate Gleichungsäquivalenz, strikte Definitionsbereichsprüfung und verlangte Darstellungsformen
- Intervallprüfung ergänzt
- komplexe Wurzeln als vollständige kubische Lösungsmenge auf Transferniveau

### Stufen und Qualität

- 103 Familien auditiert, 100 aktiv, 3 deaktiviert
- jede aktive Familie weist nur noch ihre real erzeugte Einzelstufe aus
- methodische Progressionen verbinden Basis, Standard, Plus und Transfer über unterschiedliche Familien
- 16 Familien × 100 Varianten werden unabhängig mathematisch geprüft
- Service-Worker-Cache `kopfmathe-v4-20260718`

### Prüfung

- 202 automatisierte Tests
- 10.000 generierte Aufgaben (100 je aktiver Familie)
- 1.600 unabhängige Generatorvarianten
- acht eindeutige mobile Dock-Geometrien von iPhone SE bis Pro Max einschließlich Android und Querformat
- App und Tastatur laufen in einem echten Test-DOM; Service-Worker-Install, -Activate, -Fetch und Offline-Fallback werden ausgeführt
- statische Produktionsprüfung aller 35 Runtime-Module, 42 verpflichtenden Offline-Assets und des GitHub-Pages-Unterpfads
- Cloud-Browser-Sichtprüfung nicht ausgeführt: Navigation zu `127.0.0.1:8080` wurde durch die Browser-Sicherheitsrichtlinie blockiert

## 2.0.0 – 2026-07-17

- mobile PWA-Grundarchitektur mit Themenmehrfachauswahl, vier Stufen und drei Eingabemodi
- sicherer Parser ohne `eval()`, lokale Tastatur, strukturierte Slots und Offline-Cache
- 102 initial auditierte Familien, davon 99 aktiv
- erster Schrittmodus, Hilfen, Skip/Undo und lokale Lernhistorie

Die Aussagen dieses Abschnitts beschreiben den damaligen Stand; die oben genannten Reparaturen ersetzen unvollständige 2.0.0-Verhaltensweisen.
