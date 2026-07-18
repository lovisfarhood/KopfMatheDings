# Generatorübersicht

## Gesamtstand

Die Registry enthält **103 auditierte Generatorfamilien** in 18 Themen. Davon sind **100 aktiv** und **3 begründet deaktiviert**. Jede aktive Familie nennt genau eine tatsächlich erzeugte Stufe: 27 Basis-, 35 Klausurstandard-, 19 Klausur+- und 19 Transferfamilien.

| Thema | Gesamt | Aktiv | Deaktiviert | Echte Schrittfamilie |
|---|---:|---:|---:|---|
| Rechengrundlagen | 5 | 5 | 0 | — |
| Algebra & Funktionen | 6 | 6 | 0 | — |
| Komplexe Zahlen | 10 | 10 | 0 | — |
| Grenzwerte | 4 | 4 | 0 | — |
| Folgen | 4 | 4 | 0 | — |
| Reihen & Potenzreihen | 4 | 4 | 0 | — |
| Ableitungen | 8 | 8 | 0 | — |
| Taylorpolynome | 6 | 6 | 0 | `taylor.shifted-exp` |
| Integralrechnung | 8 | 8 | 0 | `integrals.partial-fractions` |
| Matrizen, Determinanten & Eigenwerte | 11 | 10 | 1 | — |
| Lineare Gleichungssysteme | 7 | 7 | 0 | `linearSystems.gauss-steps` |
| Vektorräume, Basis, Rang & Kern | 6 | 6 | 0 | — |
| Orthogonalität & Approximation | 6 | 6 | 0 | — |
| QR- und LU-Zerlegung | 6 | 6 | 0 | `decompositions.lu-complete` |
| Numerische Verfahren | 4 | 3 | 1 | — |
| Differentialgleichungen | 4 | 4 | 0 | — |
| Methoden & Konzepte | 2 | 1 | 1 | — |
| MATLAB & Algorithmen | 2 | 2 | 0 | — |
| **Summe** | **103** | **100** | **3** | **4** |

Der vollständige Einzelentscheid zu Stufe, Modus, Status und Kompetenzbezug jeder Familie steht in [TASK_AUDIT.md](./TASK_AUDIT.md).

## Schrittmodus

Schrittmodus ist eine explizite Generatorfähigkeit. Nur die vier in der Tabelle genannten Familien tragen `step`; alle anderen Familien bleiben reine Kopfmodus-Aufgaben. Jede erzeugte Schrittaufgabe besitzt mindestens zwei fachlich aufeinander aufbauende, einzeln validierbare Schritte mit Prompt, Eingabespezifikation, Antwort und Erklärung.

Die Registry verwirft jede als Schrittaufgabe markierte Ausgabe mit weniger als zwei vollständigen Schritten. Die Tests prüfen außerdem 1.000 zufällige Schrittaufgaben. Eine Themenauswahl ohne geeignete Familie endet kontrolliert mit einer verständlichen Meldung statt mit einem fachfremden Fallback.

## Kompetenzvarianten

- **Ähnliche Aufgabe** erzwingt dieselbe Generatorfamilie und erzeugt neue Parameter.
- **Einfachere Vorstufe** und **Schwerere Variante** folgen nur expliziten Beziehungen oder derselben `competenceId` innerhalb desselben Themas.
- Die angeforderte Variante muss den aktuellen Kopf- oder Schrittmodus unterstützen; andernfalls wird keine zufällige Ersatzkompetenz gewählt.
- Beispiele der geprüften Progressionen sind Partialbruchansatz → vollständige Partialbruchzerlegung, Gauß-Faktor → vollständiger Gauß-Ablauf und Eigenwerte → Eigenvektor.

## Deaktivierte Familien

| Generator-ID | Grund |
|---|---|
| `matrices.add` | Hoher mobiler Eingabeaufwand bei sehr geringer kognitiver Anforderung |
| `numericalMethods.rectangle` | Redundant zur methodisch stärkeren Trapezregel |
| `trueFalse.computed` | Rechenaufgabe im erratbaren Wahr/Falsch-Gewand |

Die Familien bleiben für den Audit in `allGenerators`, sind aber nicht Teil der aktiven Registry.

## Automatische Variantenprüfung

Jeder vollständige Testlauf erzeugt **100 Varianten je aktiver Familie**. Bei 100 aktiven Familien sind das **10.000 Generatorvarianten**. Jede Variante wird auf Metadaten, Wertebereiche, gültige Musterlösung, bewusst falsche Antwort, Signaturvielfalt und fehlende `undefined`-/`NaN`-Werte geprüft.

Zusätzlich kontrollieren **1.600 unabhängig nachgerechnete Varianten** aus 16 repräsentativen Familien die Mathematik ohne Verwendung des Produkt-Antwortprüfers. Die Referenzen verwenden unter anderem Differenzenquotienten, Simpson-Quadratur, Matrixidentitäten, unabhängige Elimination und Rückpotenzieren komplexer Wurzeln.
