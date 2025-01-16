export interface LopendeStatus {
  datumStatusGezet: string;
  statusOmschrijving: string;
}

export interface LopendeZaak {
  identificatie: string;
  uuid: string;
  omschrijving: string;
  startdatum: string;
  statusOmschrijving: string;
  statusGeschiedenis: LopendeStatus[];
}
