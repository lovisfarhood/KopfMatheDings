# Klausurabgleich

## Quellenlage

Im Repository und im bereitgestellten Work-Kontext wurden keine Altklausur-PDFs, Scans, Bilder oder Aufgabenblätter bereitgestellt. Deshalb gibt es keine belastbare Zuordnung zu Jahr, Version, Aufgabennummer, Punkteverteilung oder erlaubten Hilfsmitteln. Es wird keine konkrete Klausurausrichtung behauptet und keine Quelle erfunden.

Die aktuelle Einordnung basiert ausschließlich auf allgemeinen HM1-Mustern, die im Auftrag ausdrücklich genannt wurden, sowie auf der vorhandenen Themenarchitektur. Alle Aufgaben sind neu parametrisierte Familien; keine geschützte Klausuraufgabe wurde kopiert.

Für einen späteren echten Abgleich fehlen mindestens:

- die betreffenden Altklausuren oder Übungsklausuren
- Modulhandbuch beziehungsweise verbindlicher Stoffkatalog
- Prüfungsordnung und Angaben zu erlaubten Hilfsmitteln
- Punkteverteilungen oder Erwartungshorizonte
- gegebenenfalls Musterlösungen zur Rechenlänge und Notation

## Allgemeine HM1-Zuordnung

| Muster | Kompetenzprogression | Familien | Stufen | Eingabe |
|---|---|---|---|---|
| Gleichungen und Faktorisierung | linear umformen → Nullstellen/Faktoren → Bruchgleichung/Verkettung | `algebra.linear`, `algebra.roots`, `algebra.factor-structure`, `algebra.fraction-equation`, `algebra.composition` | B/K/K+ | Zahl, Menge, Inline |
| Komplexe Zahlen | Grundoperation/Betrag → allgemeine Division/Polarform → de Moivre → vollständige Wurzelmenge | `complex.add`, `complex.divide-i`, `complex.division-general`, `complex.polar`, `complex.demoivre`, `complex.roots` | B/K/K+/T | Inline, Ausdruck, Menge |
| Grenzwerte | Standardgrenzwert → rational im Unendlichen → rationalisieren → kürzbare Struktur | `limits.sin`, `limits.infinity`, `limits.root`, `limits.removable` | B/K/K+/T | exakte Zahl |
| Folgen und Reihen | Muster/Summe → Grenzwert/Reihenwert → Radius → Konvergenz-/Fixpunktentscheidung | Folgen- und Reihenfamilien | B/K/K+/T | Zahl, Inline, Auswahl |
| Ableitungen | Polynom → Produkt/Kette/Quotient → kombinierte Regeln → Regel-/Fehleranalyse | `derivatives.polynomial`, `derivatives.product`, `derivatives.chain`, `derivatives.quotient`, `derivatives.mixed-expression`, `derivatives.chain-error` | B/K/K+/T | Zahl, Ausdruck, Auswahl |
| Taylor | Standardreihe um 0 → verschobener Entwicklungspunkt → rationale/geometrische Struktur | `taylor.exp`, `taylor.sin`, `taylor.cos`, `taylor.shifted-exp`, `taylor.rational`, `taylor.geometric` | K/K+/T | Inline, Ausdruck, Schritte |
| Integrale | Potenzregel/Ansatz → Stammfunktion, Substitution, partielle Integration, Partialbrüche → Methodenwahl | Integral-Familien einschließlich `integrals.partial-fractions-setup` und `integrals.partial-fractions` | B/K/K+/T | Zahl, Inline, Auswahl, Schritte |
| Determinanten und Matrizen | 2×2/Dreieck/Zeilenoperation → Matrixprodukt/Invertierbarkeit/Eigenwerte → Inverse/Eigenvektor → strategische 3×3-Determinante | Matrix-Familien | B/K/K+/T | Zahl, Matrix, Menge, Vektor |
| LGS und Gauß | Eliminationsfaktor → Lösen/Rückwärtseinsetzen → vollständiger Gauß-Ablauf → Klassifikation | `linearSystems.gauss`, `linearSystems.solve`, `linearSystems.back`, `linearSystems.gauss-steps`, Klassifikationsfamilien | B/K/K+/T | Zahl, Inline, Schritte, Auswahl |
| Vektorräume/Orthogonalität | Dimension/Skalarprodukt → Basis/Rang/Normalenvektor → Kern/Projektion/Winkel → Unterraum/Ausgleich | Vektorraum- und Orthogonalitätsfamilien | B/K/K+/T | Zahl, Vektor, Inline, Auswahl |
| LU/QR | Eliminationsfaktor/Orthogonalität → Vorwärtseinsetzen/erster Q-Vektor → vollständige LU → Pivotstrategie | Zerlegungsfamilien | B/K/K+/T | Zahl, Vektor, Schritte, Auswahl |
| Numerik/DGL | Standardverfahren → anspruchsvollere Einzelschritte → Methoden-/Strukturentscheidung | Numerik- und DGL-Familien | B/K/K+/T je nach Thema | Zahl, Auswahl |

## Stufenmodell

Jede aktive Generatorfamilie ist genau einer tatsächlich implementierten Stufe zugeordnet. Progression entsteht durch einen Wechsel der mathematischen Struktur oder Kompetenzfamilie, nicht durch ein anderes Label auf derselben Generatorlogik.

- **Basis:** ein klarer Kernschritt, kleine übersichtliche Zahlen
- **Klausurstandard:** typische HM1-Methode, meist zwei gedankliche Schritte
- **Klausur+:** verknüpfte Regeln oder vollständiger mehrstufiger Ablauf
- **Transfer:** Methodenwahl, Strategie, Fehleranalyse oder versteckte Struktur; nicht bloß größere Zahlen

Ein automatisierter Test erzeugt für sechs Kerngebiete feste Seeds auf allen vier Stufen. Die gemessene mittlere Komplexität steigt dort von 3,67 über 5,63 und 7,54 auf 8,08; zugleich unterscheiden sich die verwendeten Familienmengen.

## Prüfstatus

Die mathematische Korrektheit wird nicht nur durch die eigene Musterlösung geprüft. 16 Familien besitzen je 100 unabhängige Referenzvarianten mit Differenzenquotienten, Simpson-Quadratur, Matrixidentitäten, Eliminationsdeterminanten, Rückpotenzieren und Einsetzen. Details stehen in [TASK_AUDIT.md](./TASK_AUDIT.md).

## Ehrliche Grenze

Ohne echte Klausurdokumente kann weder eine empirische Themengewichtung noch eine Aussage wie „an den Altklausuren des Jahres X kalibriert“ belegt werden. Der Klausur-Mix ist ein allgemeiner HM1-Mix und muss bei später bereitgestellten Quellen erneut abgeglichen werden.
