# Klausurabgleich

## Quellenlage und Methode

Im Repository liegen keine Altklausur-PDFs. Deshalb behauptet diese Datei keine Zuordnung zu einer konkreten Klausur oder Jahreszahl. Verwendet wurden die im Master-Auftrag ausdrücklich genannten, wiederkehrenden HM1-Muster sowie die bereits vorhandene Themenabdeckung. Aufgaben werden parametrisiert neu erzeugt und nicht aus einer Klausur kopiert.

Der **Klausur-Mix** gewichtet Ableitungen, Taylor, Integrale, Matrizen und LGS am stärksten; komplexe Zahlen, Algebra, Grenzwerte, Reihen, Vektorräume, Orthogonalität und Zerlegungen ergänzen den Mix. Grundlagen erscheinen bei Klausurstandard nicht über reine Basisfamilien.

## Wiederkehrende Muster

| Klausurmuster | Kompetenz | Familien | Stufe | Eingabemodus und Grund |
|---|---|---|---|---|
| Lineare und rationale Gleichungen | Umformen, Definitionsbereich beachten | `algebra.linear`, `algebra.fraction-equation` | Basis–Standard | kurze freie Zahleneingabe |
| Faktorisierung und Nullstellen | Struktur erkennen, Vieta nutzen | `algebra.factor-structure`, `algebra.roots` | Basis–Plus | Inline-Faktoren bzw. ungeordnete Menge |
| Komplexe Division | konjugiert erweitern, Real-/Imaginärteil sammeln | `complex.division-general` | Standard–Transfer | freie komplexe Eingabe akzeptiert äquivalente Formen |
| Polar-/Eulerform | Betrag, Quadrant, Argument | `complex.polar`, `complex.demoivre` | Standard–Transfer | Inline für `(r,φ)`, frei für Potenzen |
| Komplexe Gleichungen | vollständige Lösungsmenge | `complex.roots` | Standard–Plus | ungeordnete Mengeneingabe |
| Kürzbare und rationalisierte Grenzwerte | passende Umformung wählen | `limits.removable`, `limits.root` | Standard–Plus | kurze exakte Antwort |
| Reihenstruktur | geometrische Reihe und Konvergenz | `series.infinite`, `series.radius`, `series.convergence` | Standard–Plus | Zahl, Inline oder konzeptionelle Auswahl |
| Produkt-, Quotienten- und Kettenregel | Regelwahl plus korrekte Faktoren | `derivatives.product`, `derivatives.quotient`, `derivatives.mixed-expression` | Standard–Transfer | Wert oder freie Ableitung je nach Eingabeaufwand |
| Typische Ableitungsfehler | fehlenden Kettenfaktor identifizieren | `derivatives.chain-error` | Basis–Plus | Multiple Choice mit Fehler-Distraktoren |
| Taylor um 0 | Koeffizienten und Fakultäten | `taylor.exp`, `taylor.sin`, `taylor.cos`, `taylor.geometric` | Standard–Plus | Inline-Koeffizienten |
| Taylor um andere Stelle | Ableitungswerte und Potenzen von `(x−x₀)` | `taylor.shifted-exp` | Plus–Transfer | freie Eingabe oder zwei sinnvolle Schritte |
| Rationale Taylorentwicklung | geometrische Struktur umformen | `taylor.rational` | Standard–Plus | freie äquivalente Ausdrücke |
| Integrationsmethode erkennen | Substitution vs. partielle Integration | `integrals.method`, `integrals.parts-choice` | Standard–Plus | Multiple Choice, da Methodenwahl im Zentrum steht |
| Substitution | innere Ableitung und neue Grenzen | `integrals.substitution` | Standard–Plus | kurzer exakter Endwert |
| Partialbruchzerlegung | Ansatz, Koeffizientenvergleich, Zusammensetzen | `integrals.partial-fractions` | Standard–Transfer | Inline oder drei Schritte mit Chips |
| Determinanten strategisch vereinfachen | Zeilenoperationen, Dreiecksstruktur | `matrices.det-structured-3`, `matrices.det`, `matrices.triangular` | Basis–Transfer | Endwert; Strategie bleibt in Aufgabe/Hinweisen sichtbar |
| Matrixoperationen | Zeilenoperation, Inverse, Dimension | `matrices.row-operation`, `matrices.inverse` | Basis–Plus | gemeinsame Matrix-Slots |
| Eigenwerte/-vektoren | charakteristisches Polynom, Eigenraum | `matrices.eigenvalues`, `matrices.eigenvector` | Standard–Transfer | Menge bzw. Vektor bis auf Skalarfaktor |
| LGS klassifizieren | Rang-/Vielfachenstruktur interpretieren | `linearSystems.classification`, `linearSystems.type` | Basis–Plus | konzeptionelle Auswahl mit plausiblen Alternativen |
| Gauß-Verfahren | Operation wählen, Zwischenmatrix, Lösung | `linearSystems.gauss-steps` | Standard–Transfer | drei Schritte und wiederverwendbare Chips |
| Basisdarstellung | Koordinaten in anderer Basis | `vectorSpaces.coordinates` | Standard–Plus | strukturierte Linearkombination |
| Projektion und Winkel | Skalarprodukt, Norm, Geometrie | `orthogonality.projection`, `orthogonality.angle` | Standard–Plus | Vektor- bzw. exakte Winkeleingabe |
| LU-/QR-Zerlegung | Eliminationsfaktor, Normierung, Zusammensetzen | `decompositions.lu-complete`, `decompositions.qr-first-vector` | Standard–Transfer | Schrittmodus bzw. strukturierter Vektor |

## Kalibrierung

- **Basis (1–3):** ein mathematischer Kernschritt, bewusst kleine Zahlen; triviale Familien sind ausschließlich hier verfügbar.
- **Klausurstandard (4–6):** typische Methodenwahl und meist zwei gedankliche Schritte; Standardauswahl.
- **Klausur+ (7–8):** kombinierte Regeln, weniger offensichtliche Struktur oder anspruchsvollere Fehlerquellen.
- **Transfer / Knobeln (9–10):** strategische Umformung oder mehrere mögliche Wege; keine bloße Vergrößerung der Zahlen.

Jede Aufgabe trägt zusätzlich einen numerischen Wert von 1 bis 10. Die Registry filtert nach sichtbarer Stufe, berücksichtigt Familiengewichte, sperrt direkte Wiederholung und erhöht nach lokalen Fehlern die Wahrscheinlichkeit passender Familien.
