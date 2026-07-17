# Audit der Generatorfamilien

## Vorgehen

Alle 102 Familien wurden gegen Klausurnähe, kognitive Anforderung, mobilen Eingabeaufwand, mathematische Vielfalt, Robustheit und erwartete Lösungszeit geprüft. Zusätzlich erzeugt die Testsuite 102 Varianten jeder aktiven Familie und prüft korrekte sowie bewusst falsche Antworten.

Skalen: **K** = Klausurnähe, **D** = kognitive Anforderung, **E** = Eingabeaufwand, **V** = Vielfalt; jeweils 0–3. Eingabe: **F** = freie mathematische Eingabe, **S** = strukturierte Inline-Eingabe, **MC** = Multiple Choice. Stufen: **B**, **K**, **K+**, **T** = Basis, Klausurstandard, Klausur+, Transfer. „B–T / 5“ bedeutet in allen sichtbaren Stufen verfügbar, numerischer Ausgangswert 5.

Entscheidungen: **behalten** = mathematischer Kern bleibt; **überarbeitet** = Stufen- oder Eingabelogik wurde wesentlich geändert; **neu** = im Audit ergänzt; **deaktiviert** = nicht in der Auswahl.

## Rechengrundlagen

| Generator-ID | Unterthema | Stufe / Wert | Eingabe | Zeit | K/D/E/V | Bekanntes Problem | Entscheidung |
|---|---|---:|---:|---:|---:|---|---|
| `basics.signed` | Vorzeichen | B / 2 | F | 16 s | 1/1/1/2 | für Klausurstandard zu trivial | überarbeitet: nur Basis |
| `basics.fractions` | Bruchrechnung | B–T / 5 | F | 24 s | 2/2/1/2 | — | behalten |
| `basics.percent` | Prozentrechnung | B / 2 | F | 16 s | 1/1/1/2 | geringe Klausurnähe | überarbeitet: nur Basis |
| `basics.powers` | Potenzen und Wurzeln | B–T / 5 | F | 20 s | 2/2/1/2 | — | behalten |
| `basics.order` | Rechenreihenfolge | B / 2 | F | 20 s | 1/1/1/2 | nur Grundlagenkontrolle | überarbeitet: nur Basis |

## Algebra und Funktionen

| Generator-ID | Unterthema | Stufe / Wert | Eingabe | Zeit | K/D/E/V | Bekanntes Problem | Entscheidung |
|---|---|---:|---:|---:|---:|---|---|
| `algebra.linear` | lineare Gleichung | B–T / 5 | F | 24 s | 2/2/1/2 | — | behalten |
| `algebra.collect` | Terme sammeln | B–T / 5 | S | 20 s | 2/2/1/2 | getrennte native Felder | überarbeitet: Inline-Controller |
| `algebra.roots` | Nullstellen | B–T / 5 | F | 24 s | 2/2/1/2 | Reihenfolge früher formatabhängig | überarbeitet: Mengengleichheit |
| `algebra.composition` | Verkettung | B–T / 5 | F | 24 s | 2/2/1/2 | — | behalten |
| `algebra.fraction-equation` | Bruchgleichung | B–T / 5 | F | 24 s | 2/2/1/2 | — | behalten |
| `algebra.factor-structure` | Faktorisierung | B–K+ / 5 | S | 24 s | 3/3/1/3 | fehlte | neu |

## Komplexe Zahlen

| Generator-ID | Unterthema | Stufe / Wert | Eingabe | Zeit | K/D/E/V | Bekanntes Problem | Entscheidung |
|---|---|---:|---:|---:|---:|---|---|
| `complex.add` | Addition | B–T / 5 | S | 20 s | 2/2/1/2 | — | überarbeitet: Inline-Form |
| `complex.multiply` | Multiplikation | B–T / 5 | S | 24 s | 2/2/1/2 | — | überarbeitet: Inline-Form |
| `complex.conjugate` | Konjugation | B / 2 | S | 16 s | 1/1/1/2 | zu trivial für Standardpool | überarbeitet: nur Basis |
| `complex.modulus` | Betrag | B–T / 5 | F | 20 s | 2/2/1/2 | — | behalten |
| `complex.i-power` | Potenzen von i | B–T / 5 | MC | 20 s | 2/2/1/2 | — | behalten |
| `complex.divide-i` | Division durch i | B–T / 5 | S | 24 s | 2/2/1/2 | deckte nur Sonderfall ab | behalten als Vorstufe |
| `complex.division-general` | allgemeine Division | K–T / 7 | F | 44 s | 3/3/1/3 | fehlte | neu |
| `complex.polar` | kartesisch zu polar | K–T / 7 | S | 44 s | 3/3/1/3 | fehlte | neu |
| `complex.demoivre` | de Moivre | K+–T / 8 | F | 56 s | 3/3/1/3 | fehlte | neu |
| `complex.roots` | komplexe Wurzeln | K–K+ / 6 | F | 40 s | 3/3/1/3 | fehlte | neu |

## Grenzwerte

| Generator-ID | Unterthema | Stufe / Wert | Eingabe | Zeit | K/D/E/V | Bekanntes Problem | Entscheidung |
|---|---|---:|---:|---:|---:|---|---|
| `limits.infinity` | rational im Unendlichen | B–T / 5 | F | 24 s | 2/2/1/2 | — | behalten |
| `limits.removable` | kürzbare Lücke | B–T / 5 | F | 24 s | 3/3/1/2 | — | behalten |
| `limits.sin` | Standardgrenzwert | B–T / 5 | F | 24 s | 2/2/1/2 | — | behalten |
| `limits.root` | rationalisieren | B–T / 5 | F | 24 s | 3/3/1/2 | — | behalten |

## Folgen

| Generator-ID | Unterthema | Stufe / Wert | Eingabe | Zeit | K/D/E/V | Bekanntes Problem | Entscheidung |
|---|---|---:|---:|---:|---:|---|---|
| `sequences.arithmetic` | arithmetische Folge | B / 2 | F | 16 s | 1/1/1/2 | reine Musterfortsetzung | überarbeitet: nur Basis |
| `sequences.geometric` | geometrische Folge | B / 2 | F | 20 s | 1/1/1/2 | reine Musterfortsetzung | überarbeitet: nur Basis |
| `sequences.limit` | Folgen-Grenzwert | B–T / 5 | F | 24 s | 2/2/1/2 | — | behalten |
| `sequences.fixpoint` | Fixpunkt | B–T / 5 | F | 24 s | 2/3/1/2 | — | behalten |

## Reihen und Potenzreihen

| Generator-ID | Unterthema | Stufe / Wert | Eingabe | Zeit | K/D/E/V | Bekanntes Problem | Entscheidung |
|---|---|---:|---:|---:|---:|---|---|
| `series.finite` | endliche Summe | B–T / 5 | F | 20 s | 2/2/1/2 | — | behalten |
| `series.infinite` | geometrische Reihe | B–T / 5 | F | 24 s | 3/3/1/2 | — | behalten |
| `series.radius` | Konvergenzradius | B–T / 5 | S | 24 s | 3/3/1/2 | unabhängige Felder | überarbeitet: Inline-Controller |
| `series.convergence` | Konvergenz erkennen | B–T / 5 | MC | 20 s | 3/2/1/2 | — | behalten |

## Ableitungen

| Generator-ID | Unterthema | Stufe / Wert | Eingabe | Zeit | K/D/E/V | Bekanntes Problem | Entscheidung |
|---|---|---:|---:|---:|---:|---|---|
| `derivatives.polynomial` | Polynomwert der Ableitung | B–T / 5 | F | 24 s | 2/2/1/2 | lange Koeffizientenform vermieden | überarbeitet: nur kurzer Wert |
| `derivatives.chain` | Kettenregel | B–T / 5 | F | 24 s | 3/3/1/2 | — | behalten |
| `derivatives.product` | Produktregel | B–T / 5 | F | 24 s | 3/3/1/2 | — | behalten |
| `derivatives.critical` | kritischer Punkt | B–T / 5 | F | 24 s | 2/2/1/2 | — | behalten |
| `derivatives.rules` | Methodenwahl | B–T / 5 | MC | 16 s | 3/2/1/2 | Distraktoren begrenzt | überarbeitet: Fehleroptionen |
| `derivatives.quotient` | Quotientenregel | K–T / 7 | F | 44 s | 3/3/1/3 | fehlte | neu |
| `derivatives.mixed-expression` | Produkt plus Kette | K+–T / 8 | F | 56 s | 3/3/2/3 | freie Äquivalenz nötig | neu |
| `derivatives.chain-error` | Fehleranalyse | B–K+ / 5 | MC | 24 s | 3/3/1/3 | fehlte | neu |

## Taylorpolynome

| Generator-ID | Unterthema | Stufe / Wert | Eingabe | Zeit | K/D/E/V | Bekanntes Problem | Entscheidung |
|---|---|---:|---:|---:|---:|---|---|
| `taylor.exp` | Exponentialfunktion um 0 | B–T / 5 | S | 24 s | 3/3/2/2 | vier native Felder | überarbeitet: gemeinsames Polynom-Template |
| `taylor.sin` | Sinus um 0 | B–T / 5 | S | 24 s | 3/3/2/2 | vier native Felder | überarbeitet: gemeinsames Polynom-Template |
| `taylor.cos` | Kosinus um 0 | B–T / 5 | S | 24 s | 3/3/2/2 | vier native Felder | überarbeitet: gemeinsames Polynom-Template |
| `taylor.geometric` | geometrische Taylorreihe | B–T / 5 | S | 24 s | 3/3/2/2 | vier native Felder | überarbeitet: gemeinsames Polynom-Template |
| `taylor.shifted-exp` | Entwicklung um x₀ | K+–T / 8 | F/Schritt | 84 s | 3/3/2/3 | fehlte | neu |
| `taylor.rational` | rationale Funktion | K–K+ / 7 | F | 44 s | 3/3/1/3 | fehlte | neu |

## Integralrechnung

| Generator-ID | Unterthema | Stufe / Wert | Eingabe | Zeit | K/D/E/V | Bekanntes Problem | Entscheidung |
|---|---|---:|---:|---:|---:|---|---|
| `integrals.power` | Potenzregel | B–T / 5 | F | 24 s | 2/2/1/2 | — | behalten |
| `integrals.antiderivative` | Stammfunktion | B–T / 5 | S | 20 s | 2/2/1/2 | getrennte Koeffizienten | überarbeitet: Inline-Controller |
| `integrals.partial` | einfacher Partialbruch | B–T / 5 | S | 24 s | 2/2/1/2 | nur Kurzform | behalten als Vorstufe |
| `integrals.method` | Methodenwahl | B–T / 5 | MC | 20 s | 3/2/1/2 | — | behalten |
| `integrals.substitution` | Substitution mit Grenzen | K–K+ / 7 | F | 44 s | 3/3/1/3 | fehlte | neu |
| `integrals.parts-choice` | partielle Integration | K–K+ / 6 | MC | 36 s | 3/3/1/3 | fehlte | neu |
| `integrals.partial-fractions` | vollständige Zerlegung | K–T / 8 | S/Schritt | 126 s | 3/3/2/3 | fehlte | neu |

## Matrizen, Determinanten und Eigenwerte

| Generator-ID | Unterthema | Stufe / Wert | Eingabe | Zeit | K/D/E/V | Bekanntes Problem | Entscheidung |
|---|---|---:|---:|---:|---:|---|---|
| `matrices.add` | Matrixaddition | B–T / 5 | S | 24 s | 1/1/3/2 | viel Eingabe, kaum Denken | **deaktiviert** |
| `matrices.det` | 2×2-Determinante | B–T / 5 | F | 24 s | 2/2/1/2 | — | behalten als Basis |
| `matrices.vector` | Matrix-Vektor-Produkt | B–T / 5 | S | 24 s | 2/2/2/2 | — | behalten |
| `matrices.triangular` | Dreiecksmatrix | B–T / 5 | F | 20 s | 2/2/1/2 | — | behalten |
| `matrices.inverse-entry` | einzelner Inverseneintrag | B–T / 5 | F | 24 s | 2/2/1/2 | — | behalten als Vorstufe |
| `matrices.invertible` | Invertierbarkeit | B–T / 5 | MC | 24 s | 3/2/1/2 | — | behalten |
| `matrices.det-structured-3` | strategische 3×3-Determinante | K–T / 8 | F | 44 s | 3/3/1/3 | fehlte | neu |
| `matrices.row-operation` | Zeilenoperation | B–K+ / 6 | S | 24 s | 3/3/2/3 | fehlte | neu |
| `matrices.eigenvalues` | Eigenwerte | K–K+ / 6 | F | 36 s | 3/3/1/3 | fehlte | neu |
| `matrices.eigenvector` | Eigenvektor | K+–T / 8 | S | 56 s | 3/3/2/3 | skalare Äquivalenz nötig | neu |
| `matrices.inverse` | vollständige Inverse 2×2 | K–K+ / 7 | S | 44 s | 3/3/3/3 | fehlte | neu |

## Lineare Gleichungssysteme

| Generator-ID | Unterthema | Stufe / Wert | Eingabe | Zeit | K/D/E/V | Bekanntes Problem | Entscheidung |
|---|---|---:|---:|---:|---:|---|---|
| `linearSystems.solve` | 2×2-System | B–T / 5 | S | 24 s | 3/3/2/2 | native Einzelfelder | überarbeitet: gemeinsame Lösung |
| `linearSystems.type` | Lösungsanzahl | B–T / 5 | MC | 24 s | 3/3/1/2 | — | behalten |
| `linearSystems.gauss` | Gauß-Faktor | B–T / 5 | F | 24 s | 3/2/1/2 | nur Teilschritt | behalten als Vorstufe |
| `linearSystems.back` | Rückwärtssubstitution | B–T / 5 | S | 24 s | 3/3/2/2 | — | überarbeitet: Inline-Controller |
| `linearSystems.homogeneous` | homogenes System | B–T / 5 | MC | 24 s | 3/2/1/2 | — | behalten |
| `linearSystems.classification` | keine/unendlich viele Lösungen | B–K+ / 6 | MC | 24 s | 3/3/1/3 | fehlte | neu |
| `linearSystems.gauss-steps` | vollständiger Gauß-Ablauf | K–T / 9 | S/Schritt | 126 s | 3/3/2/3 | fehlte | neu |

## Vektorräume

| Generator-ID | Unterthema | Stufe / Wert | Eingabe | Zeit | K/D/E/V | Bekanntes Problem | Entscheidung |
|---|---|---:|---:|---:|---:|---|---|
| `vectorSpaces.combination` | Linearkombination | B–T / 5 | S | 24 s | 3/3/2/2 | — | überarbeitet: Inline-Controller |
| `vectorSpaces.dimension` | Dimension von Pₙ | B–T / 5 | F | 16 s | 2/2/1/2 | kurz, aber konzeptionell | behalten |
| `vectorSpaces.kernel` | Kern | B–T / 5 | S | 24 s | 3/3/2/2 | — | überarbeitet: Vektorcontroller |
| `vectorSpaces.rank` | Rang | B–T / 5 | MC | 24 s | 3/3/1/2 | — | behalten |
| `vectorSpaces.subspace` | Untervektorraum | B–T / 5 | MC | 20 s | 3/3/1/2 | — | behalten |
| `vectorSpaces.coordinates` | Basisdarstellung | K–K+ / 7 | S | 44 s | 3/3/2/3 | fehlte | neu |

## Orthogonalität und Approximation

| Generator-ID | Unterthema | Stufe / Wert | Eingabe | Zeit | K/D/E/V | Bekanntes Problem | Entscheidung |
|---|---|---:|---:|---:|---:|---|---|
| `orthogonality.dot` | Skalarprodukt | B–T / 5 | F | 20 s | 2/2/1/2 | als Standard allein zu einfach | behalten, niedriger gewichtet |
| `orthogonality.norm` | Norm | B–T / 5 | F | 20 s | 2/2/1/2 | — | behalten |
| `orthogonality.projection` | Projektion | B–T / 5 | S | 24 s | 3/3/2/2 | — | überarbeitet: Vektorcontroller |
| `orthogonality.normal` | Normalenvektor | B–T / 5 | S | 20 s | 3/2/2/2 | exakte Zeichenfolge ungeeignet | überarbeitet: Skalarvielfache |
| `orthogonality.least-squares` | Ausgleichsgerade | B–T / 5 | S | 24 s | 3/3/2/2 | — | überarbeitet: Inline-Controller |
| `orthogonality.angle` | Winkel | K–K+ / 7 | F | 44 s | 3/3/1/3 | fehlte | neu |

## Matrixzerlegungen

| Generator-ID | Unterthema | Stufe / Wert | Eingabe | Zeit | K/D/E/V | Bekanntes Problem | Entscheidung |
|---|---|---:|---:|---:|---:|---|---|
| `decompositions.lr` | LR-Faktor | B–T / 5 | F | 24 s | 3/2/1/2 | nur Einzelfaktor | behalten als Vorstufe |
| `decompositions.forward` | Vorwärtssubstitution | B–T / 5 | S | 24 s | 3/3/2/2 | — | überarbeitet: Vektorcontroller |
| `decompositions.orthogonal` | QR-Idee | B–T / 5 | MC | 20 s | 3/2/1/2 | — | behalten |
| `decompositions.pivot` | Pivotisierung | B–T / 5 | MC | 20 s | 3/3/1/2 | — | behalten |
| `decompositions.lu-complete` | LU-Zerlegung | K–T / 8 | S/Schritt | 126 s | 3/3/2/3 | fehlte | neu |
| `decompositions.qr-first-vector` | erster QR-Vektor | K–K+ / 6 | S | 40 s | 3/3/2/3 | fehlte | neu |

## Numerische Verfahren

| Generator-ID | Unterthema | Stufe / Wert | Eingabe | Zeit | K/D/E/V | Bekanntes Problem | Entscheidung |
|---|---|---:|---:|---:|---:|---|---|
| `numericalMethods.newton` | Newton-Schritt | B–T / 5 | F | 24 s | 3/3/1/2 | — | behalten |
| `numericalMethods.euler` | Euler-Schritt | B–T / 5 | F | 24 s | 3/3/1/2 | — | behalten |
| `numericalMethods.trapezoid` | Trapezregel | B–T / 5 | F | 24 s | 2/2/1/2 | Formeleinsetzung, aber methodisch relevant | behalten |
| `numericalMethods.rectangle` | Rechteckregel | B–T / 5 | F | 24 s | 1/1/1/2 | reine Formeleinsetzung, redundant | **deaktiviert** |

## Differentialgleichungen

| Generator-ID | Unterthema | Stufe / Wert | Eingabe | Zeit | K/D/E/V | Bekanntes Problem | Entscheidung |
|---|---|---:|---:|---:|---:|---|---|
| `differentialEquations.initial` | Anfangswert ablesen | B / 2 | F | 16 s | 1/1/1/2 | trivial außerhalb Basis | überarbeitet: nur Basis |
| `differentialEquations.equilibrium` | stationäre Lösung | B–T / 5 | F | 24 s | 3/2/1/2 | — | behalten |
| `differentialEquations.verify` | Lösung überprüfen | B–T / 5 | MC | 20 s | 3/3/1/2 | — | behalten |
| `differentialEquations.characteristic` | charakteristische Gleichung | B–T / 5 | F | 24 s | 3/3/1/2 | Reihenfolge früher relevant | überarbeitet: Mengengleichheit |

## Methoden, Konzepte und MATLAB

| Generator-ID | Thema / Unterthema | Stufe / Wert | Eingabe | Zeit | K/D/E/V | Bekanntes Problem | Entscheidung |
|---|---|---:|---:|---:|---:|---|---|
| `trueFalse.computed` | Konzepte / Rechnen als Wahr-Falsch | B–T / 5 | MC | 24 s | 1/1/1/2 | erratbar; Rechnen wird nur versteckt | **deaktiviert** |
| `trueFalse.concepts` | Konzepte / Begriffe | B–T / 5 | MC | 20 s | 3/3/1/2 | — | behalten |
| `matlab.elementwise` | MATLAB / elementweise Operation | B–T / 5 | F | 16 s | 2/2/1/2 | optionales Randthema | behalten, standardmäßig aus |
| `matlab.size` | MATLAB / Dimension | B / 2 | MC | 16 s | 1/1/1/2 | trivial | überarbeitet: nur Basis und optional |

## Ergebnis

- Gesamt: **102** Familien
- Aktiv: **99**
- Deaktiviert: **3**
- Neu: **24**
- Basis-only: **8**
- Automatisch geprüfte Varianten: **10.098** pro vollständigem Testlauf

Die drei Deaktivierungen bleiben im Quellcode und in `allGenerators`, damit Entscheidung, Tests und spätere Neubewertung nachvollziehbar bleiben. Die aktive Registry enthält sie nicht.
