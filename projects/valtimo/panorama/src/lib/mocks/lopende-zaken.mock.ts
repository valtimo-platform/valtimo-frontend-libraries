import {LopendeZaak} from '../models';

export const lopendeZaken: {results: LopendeZaak[]} = {
  results: [
    {
      uuid: 'aa60cd96-d3d1-4310-9467-5c4a54c8beee',
      identificatie: 'ZAAK-000002',
      omschrijving: 'Dit een een zaak!',
      startdatum: '2025-01-10',
      statusOmschrijving: 'Hoorzitting gehouden',
      statusGeschiedenis: [
        {
          datumStatusGezet: '2025-01-10T13:09:52Z',
          statusOmschrijving: 'Hoorzitting gehouden',
        },
        {
          datumStatusGezet: '2025-01-10T13:09:33Z',
          statusOmschrijving: 'Bezwaar beoordeeld',
        },
        {
          datumStatusGezet: '2025-01-10T13:09:15Z',
          statusOmschrijving: 'Intake afgerond',
        },
      ],
    },
  ],
};
