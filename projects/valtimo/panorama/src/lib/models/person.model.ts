/*
 * Copyright 2015-2023 Ritense BV, the Netherlands.
 *
 * Licensed under EUPL, Version 1.2 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
