export interface Person {
  burgerservicenummer: string | null;
  naam: PersonName;
  geslacht: PersonGender;
  geboorte: PersonBirthDetails;
  verblijfplaats: PersonResidence;
  kinderen: Partial<Person>[];
  ouders: Partial<Person>[];
  partners: Partial<Person>[];
}

export interface PersonName {
  voornamen: string;
  geslachtsnaam: string;
  voorletters: string;
  volledigeNaam: string;
}

export interface PersonGender {
  code: string;
  omschrijving: string;
}

export interface PersonBirthDetails {
  datum: DateOfBirth;
  land: CountryOfBirth;
  plaats: PlaceOfBirth;
}

export interface DateOfBirth {
  langFormaat: string;
  datum: string;
}

export interface CountryOfBirth {
  code: string;
  omschrijving: string;
}

export interface PlaceOfBirth {
  code: string | null;
  omschrijving: string;
}

export interface PersonResidence {
  verblijfadres: PersonAddress;
}

export interface PersonAddress {
  officieleStraatnaam: string;
  huisnummer: number;
  huisletter: string | null;
  huisnummertoevoeging: string | null;
  postcode: string;
  woonplaats: string;
}
