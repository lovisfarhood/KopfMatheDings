# Audit der Generatorfamilien

## Methode und Ergebnis

Der Audit liest die tatsächlich registrierten Metadaten und verlässt sich nicht auf frühere Changelog-Angaben. Stand dieser Reparatur:

- 103 Familien insgesamt, 100 aktiv, 3 begründet deaktiviert
- genau eine real erzeugte Stufe pro Familie; dadurch kann kein unveränderter Generator unter vier Labels erscheinen
- Kopfmodus nur bei ausdrücklichem `head`
- Schrittmodus nur bei `integrals.partial-fractions`, `taylor.shifted-exp`, `linearSystems.gauss-steps` und `decompositions.lu-complete`
- 100 Varianten je aktiver Familie = 10.000 Aufgaben im vollständigen Lauf
- korrekte Musterantwort und konstruierte Falschantwort je Variante
- 1.600 zusätzliche unabhängige Referenzprüfungen über 16 Familien

Stufen: **B** = Basis, **K** = Klausurstandard, **K+** = Klausur+, **T** = Transfer. Die Pfeile zeigen die expliziten Kompetenzbeziehungen für „einfacher“ und „schwerer“.

## Rechengrundlagen
| Generator | Stufe | Modus | Status | Kompetenzbezug |
|---|---|---|---|---|
| `basics.signed` | B | head | aktiv | basics.signed |
| `basics.fractions` | K | head | aktiv | basics.fractions |
| `basics.percent` | B | head | aktiv | basics.percent |
| `basics.powers` | K | head | aktiv | basics.powers |
| `basics.order` | B | head | aktiv | basics.order |

## Algebra & Funktionen
| Generator | Stufe | Modus | Status | Kompetenzbezug |
|---|---|---|---|---|
| `algebra.linear` | B | head | aktiv | algebra.linear |
| `algebra.collect` | B | head | aktiv | algebra.collect |
| `algebra.roots` | K | head | aktiv | algebra.roots |
| `algebra.composition` | K+ | head | aktiv | algebra.composition |
| `algebra.fraction-equation` | K+ | head | aktiv | algebra.fraction-equation |
| `algebra.factor-structure` | K | head | aktiv | algebra.factor-structure |

## Komplexe Zahlen
| Generator | Stufe | Modus | Status | Kompetenzbezug |
|---|---|---|---|---|
| `complex.add` | B | head | aktiv | complex.add |
| `complex.multiply` | K | head | aktiv | complex.multiply |
| `complex.conjugate` | B | head | aktiv | complex.conjugate |
| `complex.modulus` | B | head | aktiv | complex.modulus |
| `complex.i-power` | K | head | aktiv | complex.i-power |
| `complex.divide-i` | B | head | aktiv | → complex.division-general |
| `complex.division-general` | K | head | aktiv | ← complex.divide-i |
| `complex.polar` | K | head | aktiv | → complex.demoivre |
| `complex.demoivre` | K+ | head | aktiv | ← complex.polar; → complex.roots |
| `complex.roots` | T | head | aktiv | ← complex.demoivre |

## Grenzwerte
| Generator | Stufe | Modus | Status | Kompetenzbezug |
|---|---|---|---|---|
| `limits.infinity` | K | head | aktiv | limits.infinity |
| `limits.removable` | T | head | aktiv | limits.removable |
| `limits.sin` | B | head | aktiv | limits.sin |
| `limits.root` | K+ | head | aktiv | limits.root |

## Folgen
| Generator | Stufe | Modus | Status | Kompetenzbezug |
|---|---|---|---|---|
| `sequences.arithmetic` | B | head | aktiv | sequences.arithmetic |
| `sequences.geometric` | B | head | aktiv | sequences.geometric |
| `sequences.limit` | K | head | aktiv | sequences.limit |
| `sequences.fixpoint` | T | head | aktiv | sequences.fixpoint |

## Reihen & Potenzreihen
| Generator | Stufe | Modus | Status | Kompetenzbezug |
|---|---|---|---|---|
| `series.finite` | B | head | aktiv | series.finite |
| `series.infinite` | K | head | aktiv | series.infinite |
| `series.radius` | K+ | head | aktiv | series.radius |
| `series.convergence` | T | head | aktiv | series.convergence |

## Ableitungen
| Generator | Stufe | Modus | Status | Kompetenzbezug |
|---|---|---|---|---|
| `derivatives.polynomial` | B | head | aktiv | derivatives.polynomial |
| `derivatives.chain` | K | head | aktiv | → derivatives.mixed-expression |
| `derivatives.product` | K | head | aktiv | → derivatives.mixed-expression |
| `derivatives.critical` | K+ | head | aktiv | derivatives.critical |
| `derivatives.rules` | T | head | aktiv | derivatives.rules |
| `derivatives.quotient` | K | head | aktiv | ← derivatives.product; → derivatives.mixed-expression |
| `derivatives.mixed-expression` | K+ | head | aktiv | ← derivatives.product; → derivatives.chain-error |
| `derivatives.chain-error` | T | head | aktiv | ← derivatives.mixed-expression |

## Taylorpolynome
| Generator | Stufe | Modus | Status | Kompetenzbezug |
|---|---|---|---|---|
| `taylor.exp` | K | head | aktiv | → taylor.shifted-exp |
| `taylor.sin` | K | head | aktiv | taylor.sin |
| `taylor.cos` | K | head | aktiv | taylor.cos |
| `taylor.geometric` | T | head | aktiv | taylor.geometric |
| `taylor.shifted-exp` | K+ | step/head | aktiv | ← taylor.exp; → taylor.rational |
| `taylor.rational` | T | head | aktiv | ← taylor.shifted-exp |

## Integralrechnung
| Generator | Stufe | Modus | Status | Kompetenzbezug |
|---|---|---|---|---|
| `integrals.power` | B | head | aktiv | integrals.power |
| `integrals.antiderivative` | K | head | aktiv | integrals.antiderivative |
| `integrals.partial` | K+ | head | aktiv | integrals.partial |
| `integrals.method` | T | head | aktiv | integrals.method |
| `integrals.substitution` | K | head | aktiv | integrals.substitution |
| `integrals.parts-choice` | K | head | aktiv | integrals.parts-choice |
| `integrals.partial-fractions-setup` | B | head | aktiv | → integrals.partial-fractions |
| `integrals.partial-fractions` | K | step/head | aktiv | ← integrals.partial-fractions-setup |

## Matrizen, Determinanten & Eigenwerte
| Generator | Stufe | Modus | Status | Kompetenzbezug |
|---|---|---|---|---|
| `matrices.add` | K | head | deaktiviert: Hoher Eingabeaufwand bei sehr geringer kognitiver Anforderung. | matrices.add |
| `matrices.det` | B | head | aktiv | matrices.det |
| `matrices.vector` | K | head | aktiv | matrices.vector |
| `matrices.triangular` | B | head | aktiv | matrices.triangular |
| `matrices.inverse-entry` | K+ | head | aktiv | matrices.inverse-entry |
| `matrices.invertible` | K | head | aktiv | matrices.invertible |
| `matrices.det-structured-3` | T | head | aktiv | matrices.det-structured-3 |
| `matrices.row-operation` | B | head | aktiv | matrices.row-operation |
| `matrices.eigenvalues` | K | head | aktiv | → matrices.eigenvector |
| `matrices.eigenvector` | K+ | head | aktiv | ← matrices.eigenvalues |
| `matrices.inverse` | K+ | head | aktiv | matrices.inverse |

## Lineare Gleichungssysteme
| Generator | Stufe | Modus | Status | Kompetenzbezug |
|---|---|---|---|---|
| `linearSystems.solve` | K | head | aktiv | linearSystems.solve |
| `linearSystems.type` | T | head | aktiv | linearSystems.type |
| `linearSystems.gauss` | B | head | aktiv | → linearSystems.gauss-steps |
| `linearSystems.back` | K | head | aktiv | linearSystems.back |
| `linearSystems.homogeneous` | T | head | aktiv | linearSystems.homogeneous |
| `linearSystems.classification` | T | head | aktiv | linearSystems.classification |
| `linearSystems.gauss-steps` | K+ | step/head | aktiv | ← linearSystems.gauss |

## Vektorräume, Basis, Rang & Kern
| Generator | Stufe | Modus | Status | Kompetenzbezug |
|---|---|---|---|---|
| `vectorSpaces.combination` | K | head | aktiv | vectorSpaces.combination |
| `vectorSpaces.dimension` | B | head | aktiv | vectorSpaces.dimension |
| `vectorSpaces.kernel` | K+ | head | aktiv | vectorSpaces.kernel |
| `vectorSpaces.rank` | K | head | aktiv | vectorSpaces.rank |
| `vectorSpaces.subspace` | T | head | aktiv | vectorSpaces.subspace |
| `vectorSpaces.coordinates` | K | head | aktiv | vectorSpaces.coordinates |

## Orthogonalität & Approximation
| Generator | Stufe | Modus | Status | Kompetenzbezug |
|---|---|---|---|---|
| `orthogonality.dot` | B | head | aktiv | orthogonality.dot |
| `orthogonality.norm` | B | head | aktiv | orthogonality.norm |
| `orthogonality.projection` | K+ | head | aktiv | orthogonality.projection |
| `orthogonality.normal` | K | head | aktiv | orthogonality.normal |
| `orthogonality.least-squares` | T | head | aktiv | orthogonality.least-squares |
| `orthogonality.angle` | K+ | head | aktiv | orthogonality.angle |

## QR- und LU-Zerlegung
| Generator | Stufe | Modus | Status | Kompetenzbezug |
|---|---|---|---|---|
| `decompositions.lr` | B | head | aktiv | → decompositions.lu-complete |
| `decompositions.forward` | K | head | aktiv | decompositions.forward |
| `decompositions.orthogonal` | B | head | aktiv | decompositions.orthogonal |
| `decompositions.pivot` | T | head | aktiv | decompositions.pivot |
| `decompositions.lu-complete` | K+ | step/head | aktiv | ← decompositions.lr |
| `decompositions.qr-first-vector` | K | head | aktiv | qr-decomposition |

## Numerische Verfahren
| Generator | Stufe | Modus | Status | Kompetenzbezug |
|---|---|---|---|---|
| `numericalMethods.newton` | K | head | aktiv | numericalMethods.newton |
| `numericalMethods.euler` | K+ | head | aktiv | numericalMethods.euler |
| `numericalMethods.trapezoid` | T | head | aktiv | numericalMethods.trapezoid |
| `numericalMethods.rectangle` | K | head | deaktiviert: Nahezu reine Formeleinsetzung; die methodisch stärkere Trapezfamilie bleibt aktiv. | numericalMethods.rectangle |

## Differentialgleichungen
| Generator | Stufe | Modus | Status | Kompetenzbezug |
|---|---|---|---|---|
| `differentialEquations.initial` | B | head | aktiv | differentialEquations.initial |
| `differentialEquations.equilibrium` | K | head | aktiv | differentialEquations.equilibrium |
| `differentialEquations.verify` | K+ | head | aktiv | differentialEquations.verify |
| `differentialEquations.characteristic` | T | head | aktiv | differentialEquations.characteristic |

## Methoden & Konzepte
| Generator | Stufe | Modus | Status | Kompetenzbezug |
|---|---|---|---|---|
| `trueFalse.computed` | K | head | deaktiviert: Rechenaufgabe im Wahr/Falsch-Gewand mit zu hoher Rate erratbarer Antworten. | trueFalse.computed |
| `trueFalse.concepts` | T | head | aktiv | trueFalse.concepts |

## MATLAB & Algorithmen
| Generator | Stufe | Modus | Status | Kompetenzbezug |
|---|---|---|---|---|
| `matlab.elementwise` | K | head | aktiv | matlab.elementwise |
| `matlab.size` | B | head | aktiv | matlab.size |

## Unabhängige mathematische Referenzen

Je 100 Varianten werden unabhängig geprüft für:

- `complex.division-general`: direkte Real-/Imaginärteilrechnung
- `complex.roots`: Rückpotenzieren aller Wurzeln
- `derivatives.quotient` und `derivatives.mixed-expression`: symmetrische Differenzenquotienten
- `integrals.substitution`: Simpson-Quadratur
- `integrals.partial-fractions`: numerischer Identitätsvergleich außerhalb der Pole
- `taylor.shifted-exp` und `taylor.rational`: unabhängig aufgebaute Koeffizientensummen
- `matrices.det-structured-3`: separate Eliminationsdeterminante
- `matrices.row-operation`: separate Zeilenanwendung
- `matrices.eigenvalues`: `det(A−λI)=0`
- `matrices.eigenvector`: `Av=λv`
- `matrices.inverse`: `A·A⁻¹=I`
- `linearSystems.gauss-steps`: Einsetzen und unabhängige Elimination
- `decompositions.lu-complete`: `LU=A`
- `decompositions.qr-first-vector`: Norm 1 und korrekte Normierung

Zusätzlich deckt die Referenzroutine Nullpivots und singuläre Matrizen ab.

## Deaktivierungen

- `matrices.add`: viel mobile Eingabe bei sehr geringer kognitiver Anforderung
- `numericalMethods.rectangle`: redundante Formeleinsetzung; Trapezregel bleibt aktiv
- `trueFalse.computed`: erratbare Rechenaufgabe im Wahr/Falsch-Gewand

## Verbleibende Grenze

Die Stufenkalibrierung ist eine methodische HM1-Kalibrierung, keine empirische Kalibrierung an konkreten Altklausuren. Im bereitgestellten Repository und Work-Kontext liegen keine Klausurdokumente vor.
