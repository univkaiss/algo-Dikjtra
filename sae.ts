import { readFileSync, createWriteStream } from "node:fs";
import { MinPriorityQueue } from "@datastructures-js/priority-queue";

export class Sommet {
  nom: string;
  successeur: Sommet[];
  predecesseur: Sommet[];

  constructor(nom: string) {
    this.nom = nom;
    this.successeur = [];
    this.predecesseur = [];
  }

  ajouterSuccesseur(sommet: Sommet): void {
    this.successeur.push(sommet);
  }

  ajouterPredecesseur(sommet: Sommet): void {
    this.predecesseur.push(sommet);
  }
  get getSuccesseur(): Sommet[] {
    return this.successeur;
  }
  get getPredecesseur(): Sommet[] {
    return this.predecesseur;
  }
  RecupVoisin(): Sommet[] {
    const voisins: Sommet[] = [];

    // Ajoute les successeurs du sommet
    this.successeur.forEach((successeur) => {
      voisins.push(successeur);
    });

    // Ajoute les prédécesseurs du sommet
    this.predecesseur.forEach((predecesseur) => {
      voisins.push(predecesseur);
    });

    return voisins;
  }
}

export class Arc {
  private _poids: number;
  private _sommetOr: Sommet;
  private _sommetDest: Sommet;

  constructor(poids: number, sommetOr: Sommet, sommetDest: Sommet) {
    this._poids = poids;
    this._sommetOr = sommetOr;
    this._sommetDest = sommetDest;
  }

  get poids(): number {
    return this._poids;
  }

  get sommetOr(): Sommet {
    return this._sommetOr;
  }

  get sommetDest(): Sommet {
    return this._sommetDest;
  }

  set poids(poids: number) {
    this._poids = poids;
  }

  set sommetOr(sommetOr: Sommet) {
    this._sommetOr = sommetOr;
  }

  set sommetDest(sommetDest: Sommet) {
    this._sommetDest = sommetDest;
  }
}

export class Graphe {
  private _sommets: Sommet[] = [];
  private _arc: Arc[] = [];
  _nbSommets: number = 0;
  _nbArc: number = 0;

  get sommets(): Sommet[] {
    return this._sommets;
  }
  set sommets(sommets: Sommet[]) {
    this._sommets = sommets;
  }
  get arc(): Arc[] {
    return this._arc;
  }
  set arc(arc: Arc[]) {
    this._arc = arc;
  }
  get nbSommets(): number {
    return this._sommets.length;
  }
  set nbSommets(nbSommets: number) {
    this._nbSommets = nbSommets;
  }
  get nbArc(): number {
    return this._nbArc;
  }
  set nbArc(nbArc: number) {
    this._nbArc = nbArc;
  }
  nbSommet(): number {
    return this._sommets.length;
  }
  nBArc(): number {
    return this._arc.length;
  }
  trouverSommet(nom: string): Sommet | undefined {
    for (let i = 0; i < this._sommets.length; i++) {
      if (this._sommets[i].nom === nom) {
        return this._sommets[i];
      }
    }
    return undefined;
  }
  ajouterArc(sommetOrigine: Sommet, sommetDest: Sommet, poids: number): void {
    if (
      this.trouverSommet(sommetDest.nom) === sommetDest &&
      this.trouverSommet(sommetOrigine.nom) === sommetOrigine
    ) {
      this._arc.push(new Arc(poids, sommetOrigine, sommetDest));
      sommetOrigine.ajouterSuccesseur(sommetDest);
      sommetDest.ajouterPredecesseur(sommetOrigine);
    } else {
      throw new Error(`Sommet pas trouvé.`);
    }
  }
  retirerArc(sommetOrigine: Sommet | undefined, sommetDest: Sommet | undefined): void {
    if (!sommetDest || !sommetOrigine) throw new Error("Un des sommet n'a pas etait trouver");
    this._arc = this._arc.filter(
      (arc) => arc.sommetOr !== sommetOrigine || arc.sommetDest !== sommetDest
    );
  }
  TestArc(sommetOrigine: Sommet | undefined, sommeDest: Sommet | undefined): boolean {
    if (!sommeDest || !sommetOrigine) throw new Error("Un des sommet n'a pas etait trouver");
    for (let i = 0; i < this._arc.length; i++) {
      if (this._arc[i].sommetOr === sommetOrigine && this._arc[i].sommetDest === sommeDest) {
        return true;
      }
    }
    return false;
  }
  ajouterSommet(sommet: Sommet): void {
    if (!this.trouverSommet(sommet.nom)) {
      this._sommets.push(sommet);
      this._nbSommets++;
    } else {
      throw new Error(`Le sommet ${sommet.nom} est déjà présent.`);
    }
  }

  retirerSommet(sommet: Sommet): void {
    if (!this.trouverSommet(sommet.nom)) {
      throw new Error(`Le sommet n'existe pas.`);
    }
    this._arc = this._arc.filter((arc) => arc.sommetOr !== sommet && arc.sommetDest !== sommet);

    this._sommets = this._sommets.filter((s) => s !== sommet);
    this._nbSommets--;
  }
  recupPoidsArc(sommetOrigine: Sommet | undefined, sommeDest: Sommet | undefined): number {
    if (!sommeDest || !sommetOrigine) throw new Error("Un des sommet n'a pas etait trouver");
    if (!this.TestArc(sommetOrigine, sommeDest)) throw new Error("L arc n existe pas");
    for (let i = 0; i < this._arc.length; i++) {
      if (
        this.trouverSommet(sommetOrigine.nom) === sommetOrigine &&
        this.trouverSommet(sommeDest.nom) === sommeDest
      ) {
        return this._arc[i].poids;
      }
    }
    return 0;
  }
  sauvegarderFichier(chemin: string): void {
    const output = createWriteStream(chemin);
    output.write(`c This is a graph file\n`);
    output.write(`p sp ${this._nbSommets} ${this._nbArc}\n`);
    this._arc.forEach((arc) => {
      output.write(`a ${arc.sommetOr.nom} ${arc.sommetDest.nom} ${arc.poids}\n`);
    });
    output.end();
  }
}

export class Resultat {
  CourtChemin: Map<string, number>;
  predecesseur: Map<string, string | null>;

  constructor() {
    this.CourtChemin = new Map();
    this.predecesseur = new Map();
  }

  sauvegarderFichier(chemin: string): void {
    const output = createWriteStream(chemin);
    output.write("Plus court chemin:\n");
    this.CourtChemin.forEach((distance, sommet) => {
      output.write(`Sommet: ${sommet}, Distance: ${distance}\n`);
    });
    output.write("\nPrédecesseurs:\n");
    this.predecesseur.forEach((predecesseur, sommet) => {
      output.write(`Sommet: ${sommet}, Prédecesseur: ${predecesseur}\n`);
    });
    output.end();
  }
}

export class GraphRecup {
  static lireFichier(chemin: string): Graphe {
    const lignes = readFileSync(chemin, "utf8").split("\n");
    const graphe = new Graphe();

    lignes.forEach((ligne) => {
      const elements = ligne.split(" ");
      if (elements[0] === "c") {
        // Commentaire, peut être ignoré ou utilisé pour des métadonnées
      } else if (elements[0] === "p" && elements[1] === "sp") {
        graphe._nbSommets = parseInt(elements[2], 10);
        graphe._nbArc = parseInt(elements[3], 10);
      } else if (elements[0] === "a") {
        const sommetOrNom = elements[1];
        const sommetDestNom = elements[2];
        const poids = parseInt(elements[3], 10);

        let sommetOr = graphe.trouverSommet(sommetOrNom);
        if (!sommetOr) {
          sommetOr = new Sommet(sommetOrNom);
          graphe.ajouterSommet(sommetOr);
        }

        let sommetDest = graphe.trouverSommet(sommetDestNom);
        if (!sommetDest) {
          sommetDest = new Sommet(sommetDestNom);
          graphe.ajouterSommet(sommetDest);
        }

        graphe.ajouterArc(sommetOr, sommetDest, poids);
      }
    });

    return graphe;
  }
}

export function Dijkstra(graphe: Graphe, sommetInitial: Sommet | undefined): Resultat {
  if (!sommetInitial) throw new Error("sommet initial pas trouver ");
  const resultat = new Resultat();
  const distances = new Map<string, number>();
  const predecesseurs = new Map<string, string | null>();
  const queue = new MinPriorityQueue<{ id: string; priority: number }>();

  graphe.sommets.forEach((sommet) => {
    if (sommet === sommetInitial) {
      distances.set(sommet.nom, 0);
      queue.enqueue({ id: sommet.nom, priority: 0 });
    } else {
      distances.set(sommet.nom, Infinity);
    }
    predecesseurs.set(sommet.nom, null);
  });

  while (!queue.isEmpty()) {
    const { id: u } = queue.dequeue();
    const sommetU = graphe.trouverSommet(u);

    if (sommetU) {
      graphe.arc.forEach((arc) => {
        if (arc.sommetOr.nom === u) {
          const v = arc.sommetDest.nom;
          const alt = distances.get(u)! + arc.poids;
          if (alt < distances.get(v)!) {
            distances.set(v, alt);
            predecesseurs.set(v, u);
            queue.enqueue({ id: v, priority: alt });
          }
        }
      });
    }
  }

  resultat.CourtChemin = distances;
  resultat.predecesseur = predecesseurs;
  return resultat;
}

let graph = GraphRecup.lireFichier("other_format/test.txt");
let res = Dijkstra(graph, graph.trouverSommet("0"));
res.sauvegarderFichier("other_format/resultat.txt");
console.log(graph.trouverSommet("0")?.RecupVoisin());
