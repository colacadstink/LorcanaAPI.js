import {describe, expect, test} from '@jest/globals';
import {
  getCardNameAndID,
  CardType,
  CardTypes,
  Classifications,
  Colors,
  DEFAULT_LORCANA_API_ROOT_URL,
  LorcanaAPI,
  Rarities,
} from "./index.js";
import {fail, failIfReason} from "./util.test.js";

describe('LorcanaAPI', () => {
  const api = new LorcanaAPI();
  const cardsPromise = api.getCardsList();

  describe('API sanity checks', () => {
    test('Fetching the cards list works', async () => {
      await expect(cardsPromise).resolves.toBeDefined();
    });

    test('Card colors match', async () => {
      const errors: string[] = [];
      const cards = await cardsPromise;
      for(const card of cards) {
        if(!Colors.includes(card.Color)) {
          errors.push(`Unknown color '${card.Color}' found on card ${getCardNameAndID(card)}`);
        }
      }
      failIfReason(errors.join('\n'));
    });

    test('Card rarities match', async () => {
      const errors: string[] = [];
      const cards = await cardsPromise;
      for(const card of cards) {
        if(!Rarities.includes(card.Rarity)) {
          errors.push(`Unknown rarity '${card.Rarity}' found on card ${getCardNameAndID(card)}`);
        }
      }
      failIfReason(errors.join('\n'));
    });

    test('Card types match', async () => {
      const errors: string[] = [];
      const cards = await cardsPromise;
      for(const card of cards) {
        if(!CardTypes.includes(card.Type)) {
          errors.push(`Unknown card type '${card.Type}' found on card ${getCardNameAndID(card)}`);
        }
      }
      failIfReason(errors.join('\n'));
    });

    test('Card classifications match', async () => {
      const errors: string[] = [];
      const cards = await cardsPromise;
      for(const card of cards) {
        if('Classifications' in card) {
          for(const classification of card.Classifications) {
            if(!(Classifications as string[]).includes(classification)) {
              errors.push(`Unknown card classification '${classification}' found on card ${getCardNameAndID(card)}`);
            }
          }
          if(card.Classifications.length === 0) {
            errors.push(`Classifications present, but zero length for card ${getCardNameAndID(card)}`);
          }
        }
      }
      failIfReason(errors.join('\n'));
    });

    test('Card images resolve correctly', async () => {
      const errors: string[] = [];
      const cards = await cardsPromise;
      await Promise.all(cards.map(async (card) => {
        try {
          const response = await fetch(card.Image);
          if(!response.ok) {
            errors.push(`BAD CARD IMAGE: ${getCardNameAndID(card)} - '${card.Image}'`);
            return;
          }
          const contentType = response.headers.get('Content-Type');
          if(!contentType) {
            errors.push(`MISSING CONTENT TYPE, PROBABLY BAD: ${getCardNameAndID(card)} - '${card.Image}'`);
            return;
          }
          if(!contentType.startsWith('image/')) {
            errors.push(`CONTENT TYPE NOT IMAGE, PROBABLY BAD: ${getCardNameAndID(card)} - '${card.Image}'`);
            return;
          }
        } catch {
          errors.push(`ERROR WHILE FETCHING, PROBABLY BAD: ${getCardNameAndID(card)} - '${card.Image}'`);
        }
      }));
      failIfReason(errors.join('\n'));
    },10*60_000);

    test('CORS headers are set correctly', async () => {
      const resp = await fetch(`${DEFAULT_LORCANA_API_ROOT_URL}/cards/fetch?strict=Smash`, {method: 'HEAD'});
      const accessControl = resp.headers.get('Access-Control-Allow-Origin');
      expect(accessControl).toBe('*');
    });
  });

  test('[TS] Type narrowing works as expected', async () => {
    const cards = await cardsPromise;
    const aladdin = cards.find((c) => c.Name === 'Aladdin - Cornered Swordsman');
    if(!aladdin) {
      fail('Aladdin is not defined..?');
      return;
    }
    if(aladdin.Type !== CardType.Character) {
      fail('Aladdin is not a character..?');
      return;
    }
    // This will only work if we've narrowed the type to be only a CharacterCardData
    expect(aladdin.Willpower).toBe(1);
  });

  test('getCardByIDs works for Ariel - On Human Legs', async () => {
    const ariel = await api.getCardByIDs(1, 1);
    expect(ariel).toMatchSnapshot('arielOnHumanLegs');
  });

  test('getCardsByIDs works to pull a couple cards from different sets', async () => {
    const coupleCards = await api.getCardsByIDs([
      {setNum: 1, cardNum: 1},
      {setNum: 1, cardNum: 3},
      {setNum: 2, cardNum: 5},
      {setNum: 2, cardNum: 7},
      {setNum: 2, cardNum: 9},
    ]);
    expect(coupleCards).toMatchSnapshot('coupleCards');
  });
});
