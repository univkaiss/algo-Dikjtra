import { readFileSync, createWriteStream } from "fs";

abstract class Graphe {
  private _sommets = new Array<Sommet>();
  private _arc = new Array<Arc>();
  private _nbSommets: number;
  private _nbArc: number;

  get sommets(): Array<Sommet> {
    return this._sommets;
  }

  set sommets(sommets: Array<Sommet>) {
    this._sommets = sommets;
  }

  get arc(): Array<Arc> {
    return this._arc;
  }

  set arc(arc: Array<Arc>) {
    this._arc = arc;
  }

  get nbSommets(): number {
    return this._nbSommets;
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

  trouverSommet(index: string): Sommet | undefined {
    for (let l of this.sommets) {
      if (index === l.nom) {
        return l;
      }
    }
    return undefined;
  }
  abstract importer(): void;
  abstract exporter(): void;
}

class GrapheOrienter extends Graphe {
  importer(): void {
    let lignes = readFileSync("./dag_10_1.gr", "utf8").split("\n");
    for (let l of lignes) {
      if (l === "") {
        continue;
      }
      if (lignes[0] === l) {
        let lsplit = l.split(" ");
        this.nbSommets = parseInt(lsplit[0]);
        this.nbArc = parseInt(lsplit[1]);
      } else {
        let lsplit = l.split(" ");

        let sommetDebut = this.trouverSommet(lsplit[0]);
        if (sommetDebut === undefined) {
          sommetDebut = new Sommet(lsplit[0]);
          this.sommets.push(sommetDebut);
        }

        let sommetFinal = this.trouverSommet(lsplit[1]);
        if (sommetFinal === undefined) {
          sommetFinal = new Sommet(lsplit[1]);
          this.sommets.push(sommetFinal);
        }
        sommetDebut.ajouterAdjacent(sommetFinal);
        sommetFinal.ajouterAntecedant(sommetDebut);
        let arc = new Arc(parseInt(lsplit[2]), sommetDebut, sommetFinal);
        this.arc.push(arc);
      }
    }
  }
  exporter(): void {
    let output = createWriteStream("./bonjour.gr");
    output.write(this.nbSommets + " " + this.nbArc + "\n");
    for (let l of this.arc) {
      output.write(l.sommetOr.nom + " " + l.sommeDest.nom + " " + l.poids + "\n");
    }
  }

  ordreTopologique(): Sommet[] {
    let Graphe1 = new GrapheOrienter();
    Graphe1.importer();
    let ordreTopologique = new Array<Sommet>();
    let l = Graphe1.sommets.length;
    for (let i = 0; i < l; i++) {
      let racine = Graphe1.trouverRacine();
      ordreTopologique.push(racine!);
      for (let ll of racine!.adjacent) {
        ll.antecedents.splice(ll.antecedents.indexOf(racine!), 1);
      }
      Graphe1.sommets.splice(Graphe1.sommets.indexOf(racine!), 1);
    }
    let ordreTopologique2 = new Array<Sommet>();
    for (let l of ordreTopologique) {
      let sommet = this.trouverSommet(l.nom);
      if (sommet !== undefined) {
        ordreTopologique2.push(sommet);
      }
    }

    return ordreTopologique2;
  }

  trouverRacine(): Sommet | undefined {
    for (let l of this.sommets) {
      if (l.antecedents.length === 0) {
        return l;
      }
    }
    return undefined;
  }

  AlgorithmeBellManMinimum(): void {
    const pere: { [key: string]: Sommet } = {};
    const poids: { [key: string]: number } = {};

    for (let sommet of this.ordreTopologique()) {
      if (sommet === this.trouverRacine()) {
        poids[sommet.nom] = 0;
        let none = new Sommet("none");
        pere[sommet.nom] = none;
      } else {
        poids[sommet.nom] = Infinity;
        pere[sommet.nom] = sommet;
        for (let x of sommet.antecedents) {
          if (poids[x.nom] + this.trouverPoids(x, sommet) < poids[sommet.nom]) {
            poids[sommet.nom] = poids[x.nom] + this.trouverPoids(x, sommet);
            pere[sommet.nom] = x;
          }
        }
      }
    }

    for (let i of this.sommets) {
      process.stdout.write("le chemin de poids minimum: ");
      let tab = new Array<string>();
      tab.push(i.nom);
      let nom = pere[i.nom].nom;
      if (nom !== "none") tab.push(nom);
      while (nom !== "none") {
        nom = pere[nom].nom;
        if (nom !== "none") tab.push(nom);
      }

      for (let a of tab.reverse()) {
        process.stdout.write("-> " + a);
      }
      console.log();
    }
  }
  AntiMaxBell(): void {
    const fils: { [key: string]: Sommet } = {};
    const poids: { [key: string]: number } = {};

    for (let sommet of this.ordreTopologique().reverse()) {
      if (sommet === this.trouverRacine()) {
        poids[sommet.nom] = 0;
        let none = new Sommet("none");
        fils[sommet.nom] = none;
      } else {
        poids[sommet.nom] = 0;
        fils[sommet.nom] = sommet;
        for (let x of sommet.antecedents) {
          if (poids[x.nom] + this.trouverPoids(x, sommet) > poids[sommet.nom]) {
            poids[sommet.nom] = poids[x.nom] + this.trouverPoids(x, sommet);
            fils[sommet.nom] = x;
          }
        }
      }
    }
    for (let key in fils) {
      let sommet = fils[key];
      console.log(key + ":" + sommet.nom);
    }
  }

  AlgorithmeBellManMaximum(): void {
    const pere: { [key: string]: Sommet } = {};
    const poids: { [key: string]: number } = {};

    for (let sommet of this.ordreTopologique()) {
      if (sommet === this.trouverRacine()) {
        poids[sommet.nom] = 0;
        let none = new Sommet("none");
        pere[sommet.nom] = none;
      } else {
        poids[sommet.nom] = 0;
        pere[sommet.nom] = sommet;
        for (let x of sommet.antecedents) {
          if (poids[x.nom] + this.trouverPoids(x, sommet) > poids[sommet.nom]) {
            poids[sommet.nom] = poids[x.nom] + this.trouverPoids(x, sommet);
            pere[sommet.nom] = x;
          }
        }
      }
    }
    for (let i of this.sommets) {
      process.stdout.write("le chemin de poids minimum: ");
      let tab = new Array<string>();
      tab.push(i.nom);
      let nom = pere[i.nom].nom;
      if (nom !== "none") tab.push(nom);
      while (nom !== "none") {
        nom = pere[nom].nom;
        if (nom !== "none") tab.push(nom);
      }

      for (let a of tab.reverse()) {
        process.stdout.write("-> " + a);
      }
      console.log();
    }
  }
  trouverPoids(x: Sommet, s: Sommet): number {
    for (let arc of this.arc) {
      if (arc.sommetOr === x && arc.sommeDest === s) {
        return arc.poids;
      }
    }
    return -1;
  }
}

class Sommet {
  private _antecedents: Array<Sommet>;
  private _adjacents: Array<Sommet>;
  private _nom: string;

  constructor(nom: string) {
    this._nom = nom;
    this._antecedents = [];
    this._adjacents = [];
  }

  get antecedents(): Array<Sommet> {
    return this._antecedents;
  }

  get adjacent(): Array<Sommet> {
    return this._adjacents;
  }

  get nom(): string {
    return this._nom;
  }

  set antecedents(antecedents: Array<Sommet>) {
    this._antecedents = antecedents;
  }

  set adjacent(adjacents: Array<Sommet>) {
    this._adjacents = adjacents;
  }

  set nom(nom: string) {
    this._nom = nom;
  }

  ajouterAntecedant(Sommet: Sommet): void {
    this.antecedents.push(Sommet);
  }
  ajouterAdjacent(Sommet: Sommet): void {
    this.adjacent.push(Sommet);
  }
}

class Arc {
  private _sommetOr: Sommet;
  private _sommeDest: Sommet;
  private _poids: number;

  constructor(poids: number, sommetOr: Sommet, sommetDest: Sommet) {
    this.sommetOr = sommetOr;
    this.sommeDest = sommetDest;
    this.poids = poids;
  }

  get poids(): number {
    return this._poids;
  }
  get sommetOr(): Sommet {
    return this._sommetOr;
  }
  get sommeDest(): Sommet {
    return this._sommeDest;
  }
  set poids(poids: number) {
    this._poids = poids;
  }

  set sommetOr(sommetOr: Sommet) {
    this._sommetOr = sommetOr;
  }

  set sommeDest(sommeDest: Sommet) {
    this._sommeDest = sommeDest;
  }
  inverserSommetOrDest(): void {
    const temp = this._sommetOr;
    this._sommetOr = this._sommeDest;
    this._sommeDest = temp;
  }
}

let Graphe1 = new GrapheOrienter();
Graphe1.importer();
Graphe1.exporter();
Graphe1.AlgorithmeBellManMinimum();
console.log("----------------------------------------");
Graphe1.AlgorithmeBellManMaximum();
console.log("----------------------------------------");
//Graphe1.AntiMaxBell();
