import { assertThrows } from "https://deno.land/std@0.220.0/assert/assert_throws.ts";
import { Sommet, Arc, Graphe, Dijkstra, GraphRecup } from "./sae.ts";
import { assertEquals } from "https://deno.land/std@0.220.0/assert/mod.ts";
// Test pour la classe Sommet
Deno.test("Création de Sommet", () => {
  const sommet = new Sommet("A");
  assertEquals(sommet.nom, "A");
  assertEquals(sommet.getSuccesseur.length, 0);
  assertEquals(sommet.getPredecesseur.length, 0);
});

Deno.test("Ajout de Successeur et Prédécesseur", () => {
  const sommet1 = new Sommet("A");
  const sommet2 = new Sommet("B");
  sommet1.ajouterSuccesseur(sommet2);
  sommet2.ajouterPredecesseur(sommet1);

  assertEquals(sommet1.getSuccesseur.length, 1);
  assertEquals(sommet1.getSuccesseur[0], sommet2);
  assertEquals(sommet2.getPredecesseur.length, 1);
  assertEquals(sommet2.getPredecesseur[0], sommet1);
});

// Test pour la classe Arc
Deno.test("Création d'Arc", () => {
  const sommet1 = new Sommet("A");
  const sommet2 = new Sommet("B");
  const arc = new Arc(10, sommet1, sommet2);

  assertEquals(arc.poids, 10);
  assertEquals(arc.sommetOr, sommet1);
  assertEquals(arc.sommetDest, sommet2);
});

// Test pour la classe Graphe
Deno.test("Ajout de Sommets et Arcs à un Graphe", () => {
  const graphe = new Graphe();
  const sommet1 = new Sommet("A");
  const sommet2 = new Sommet("B");
  graphe.ajouterSommet(sommet1);
  graphe.ajouterSommet(sommet2);
  graphe.ajouterArc(sommet1, sommet2, 5);

  assertEquals(graphe.sommets.length, 2);
  assertEquals(graphe.arc.length, 1);
  assertEquals(graphe.arc[0].poids, 5);
  assertEquals(graphe.arc[0].sommetOr, sommet1);
  assertEquals(graphe.arc[0].sommetDest, sommet2);
});

// Test pour l'algorithme de Dijkstra
Deno.test("Exécution de Dijkstra", () => {
  const graphe = new Graphe();
  const sommet1 = new Sommet("A");
  const sommet2 = new Sommet("B");
  const sommet3 = new Sommet("C");
  graphe.ajouterSommet(sommet1);
  graphe.ajouterSommet(sommet2);
  graphe.ajouterSommet(sommet3);
  graphe.ajouterArc(sommet1, sommet2, 1);
  graphe.ajouterArc(sommet2, sommet3, 2);
  graphe.ajouterArc(sommet1, sommet3, 4);

  const resultat = Dijkstra(graphe, sommet1);

  assertEquals(resultat.CourtChemin.get("A"), 0);
  assertEquals(resultat.CourtChemin.get("B"), 1);
  assertEquals(resultat.CourtChemin.get("C"), 3);
  assertEquals(resultat.predecesseur.get("C"), "B");
  assertEquals(resultat.predecesseur.get("B"), "A");
});

// Test pour la lecture du fichier et la création du graphe
Deno.test("Lecture de fichier et création de graphe", () => {
  const graphe = GraphRecup.lireFichier("sae202/other_format/test.txt");
  assertEquals(graphe.sommets.length > 0, true);
  assertEquals(graphe.arc.length > 0, true);
});

// Test pour les erreurs de Dijkstra
Deno.test("Erreur de Dijkstra avec sommet initial non trouvé", () => {
  const graphe = new Graphe();
  const sommet = new Sommet("A");
  graphe.ajouterSommet(sommet);

  assertThrows(
    () => {
      Dijkstra(graphe, undefined);
    },
    Error,
    "sommet initial pas trouver"
  );
});
