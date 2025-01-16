import {Person} from '../models';

export const person: Person = {
  burgerservicenummer: '999990111',
  naam: {
    voornamen: 'Cees',
    geslachtsnaam: 'Leclercq',
    voorletters: 'C.',
    volledigeNaam: 'Cees Leclercq',
  },
  geslacht: {
    code: 'M',
    omschrijving: 'Man',
  },
  geboorte: {
    datum: {
      langFormaat: '2 oktober 1961',
      datum: '1961-10-02',
    },
    land: {
      code: '5010',
      omschrijving: 'België',
    },
    plaats: {
      code: null,
      omschrijving: 'Antwerpen',
    },
  },
  verblijfplaats: {
    verblijfadres: {
      officieleStraatnaam: 'Laan van Meerdervoort',
      huisnummer: 1,
      huisletter: null,
      huisnummertoevoeging: null,
      postcode: '2517AA',
      woonplaats: "'s-Gravenhage",
    },
  },
  kinderen: [
    {
      burgerservicenummer: null,
      naam: {
        voornamen: 'Pero',
        geslachtsnaam: 'Paassen',
        voorletters: 'P.',
        volledigeNaam: 'Pero Paassen',
      },
      geslacht: {
        code: 'M',
        omschrijving: 'Man',
      },
      geboorte: {
        datum: {
          langFormaat: '1 februari 2023',
          datum: '2023-02-01',
        },
        land: {
          code: '6030',
          omschrijving: 'Nederland',
        },
        plaats: {
          code: '0518',
          omschrijving: "'s-Gravenhage",
        },
      },
    },
    {
      burgerservicenummer: null,
      naam: {
        voornamen: 'Peet',
        geslachtsnaam: 'Paassen',
        voorletters: 'P.',
        volledigeNaam: 'Peet Paassen',
      },
      geslacht: {
        code: 'M',
        omschrijving: 'Man',
      },
      geboorte: {
        datum: {
          langFormaat: '1 december 2018',
          datum: '2018-12-01',
        },
        land: {
          code: '6030',
          omschrijving: 'Nederland',
        },
        plaats: {
          code: '0518',
          omschrijving: "'s-Gravenhage",
        },
      },
    },
    {
      burgerservicenummer: null,
      naam: {
        voornamen: 'Pelle',
        geslachtsnaam: 'Paassen',
        voorletters: 'P.',
        volledigeNaam: 'Pelle Paassen',
      },
      geslacht: {
        code: 'M',
        omschrijving: 'Man',
      },
      geboorte: {
        datum: {
          langFormaat: '1 september 2017',
          datum: '2017-09-01',
        },
        land: {
          code: '6030',
          omschrijving: 'Nederland',
        },
        plaats: {
          code: '0518',
          omschrijving: "'s-Gravenhage",
        },
      },
    },
    {
      burgerservicenummer: null,
      naam: {
        voornamen: 'Pep',
        geslachtsnaam: 'Paassen',
        voorletters: 'P.',
        volledigeNaam: 'Pep Paassen',
      },
      geslacht: {
        code: 'M',
        omschrijving: 'Man',
      },
      geboorte: {
        datum: {
          langFormaat: '1 mei 2016',
          datum: '2016-05-01',
        },
        land: {
          code: '6030',
          omschrijving: 'Nederland',
        },
        plaats: {
          code: '0518',
          omschrijving: "'s-Gravenhage",
        },
      },
    },
  ],
  partners: [
    {
      burgerservicenummer: '999990081',
      naam: {
        voornamen: 'Paula',
        geslachtsnaam: 'Gonzalez Perez',
        voorletters: 'P.',
        volledigeNaam: 'Paula Gonzalez Perez',
      },
      geslacht: {
        code: 'V',
        omschrijving: 'Vrouw',
      },
      geboorte: {
        datum: {
          langFormaat: '28 mei 1962',
          datum: '1962-05-28',
        },
        land: {
          code: '6037',
          omschrijving: 'Spanje',
        },
        plaats: {
          code: null,
          omschrijving: 'Madrid',
        },
      },
    },
  ],
  ouders: [
    {
      naam: {
        voornamen: 'Hillegonda',
        geslachtsnaam: 'Mertens',
        voorletters: 'H.',
        volledigeNaam: 'Hillegonda Mertens',
      },
      geslacht: {
        code: 'V',
        omschrijving: 'Vrouw',
      },
      geboorte: {
        datum: {
          langFormaat: '4 april 1938',
          datum: '1938-04-04',
        },
        land: {
          code: '5010',
          omschrijving: 'België',
        },
        plaats: {
          code: null,
          omschrijving: 'Antwerpen',
        },
      },
    },
    {
      naam: {
        voornamen: 'Frederick',
        geslachtsnaam: 'Leclercq',
        voorletters: 'F.',
        volledigeNaam: 'Frederick Leclercq',
      },
      geslacht: {
        code: 'M',
        omschrijving: 'Man',
      },
      geboorte: {
        datum: {
          langFormaat: '3 september 1937',
          datum: '1937-09-03',
        },
        land: {
          code: '5010',
          omschrijving: 'België',
        },
        plaats: {
          code: null,
          omschrijving: 'Antwerpen',
        },
      },
    },
  ],
};
