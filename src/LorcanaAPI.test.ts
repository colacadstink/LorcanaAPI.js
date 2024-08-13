import {beforeAll, describe, expect, test} from '@jest/globals';
import {
  getCardNameAndID,
  CardType,
  CardTypes,
  Classifications,
  Colors,
  DEFAULT_LORCANA_API_ROOT_URL,
  LorcanaAPI,
  Rarities, Abilities,
} from "./index.js";
import {fail, failIfReason} from "./util.test.js";
import {Agent, fetch, setGlobalDispatcher} from 'undici';

const HTTP_TIMEOUT = 3 * 60 * 1000; // 3 minutes in ms
const IMAGE_TEST_RETRIES = 3;
const IMAGE_TEST_TIMEOUT = HTTP_TIMEOUT * IMAGE_TEST_RETRIES;

// avoid jest open handle error - this is a bug in jest, I swear
const JEST_OPEN_HANDLE_DELAY = 4000;

describe('LorcanaAPI', () => {
  const api = new LorcanaAPI();
  const cardsPromise = api.getCardsList();

  beforeAll(() => {
    setGlobalDispatcher(new Agent({
      connectTimeout: HTTP_TIMEOUT,
      bodyTimeout: HTTP_TIMEOUT,
      headersTimeout: HTTP_TIMEOUT,
    }));
  });

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
        for(let i=0; i<IMAGE_TEST_RETRIES; i++) {
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
            // Card's fine!
            return;
          } catch (e) {
            if (i === IMAGE_TEST_RETRIES - 1) {
              console.error(e);
              errors.push(`ERROR WHILE FETCHING, PROBABLY SLOW LOADING: ${getCardNameAndID(card)} - '${card.Image}'`);
            }
          }
        }
      }));
      failIfReason(errors.join('\n'));
    },IMAGE_TEST_TIMEOUT);

    test('CORS headers are set correctly', async () => {
      const resp = await fetch(`${DEFAULT_LORCANA_API_ROOT_URL}/cards/fetch?strict=Smash`, {method: 'HEAD'});
      const accessControl = resp.headers.get('Access-Control-Allow-Origin');
      expect(accessControl).toBe('*');
    }, 10_000);
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
    await new Promise<void>(resolve => setTimeout(() => resolve(), JEST_OPEN_HANDLE_DELAY)); // avoid jest open handle error
  }, 10_000);

  test('getCardsByIDs works to pull a couple cards from different sets', async () => {
    const coupleCards = (await api.getCardsByIDs([
      {setNum: 1, cardNum: 1},
      {setNum: 1, cardNum: 3},
      {setNum: 2, cardNum: 5},
      {setNum: 2, cardNum: 7},
      {setNum: 2, cardNum: 9},
    ]))?.sort((a, b) => b.Unique_ID.localeCompare(a.Unique_ID));
    expect(coupleCards).toMatchSnapshot('coupleCards');
    await new Promise<void>(resolve => setTimeout(() => resolve(), JEST_OPEN_HANDLE_DELAY)); // avoid jest open handle error
  }, 10_000);

  test('If an ability word appears in the text box, it appears in the abilities list', async () => {
    const errors: string[] = [];
    const cards = await cardsPromise;
    for(const card of cards) {
      for(const ability of Abilities) {
        if(card.Body_Text?.includes(ability) && (
          !('Abilities' in card) ||
          !(ability in (card.Abilities ?? {}))
        )) {
          errors.push(`${getCardNameAndID(card)} has the ability ${ability} in its body text, but not its Abilities list`);
        }
      }
    }
    failIfReason(errors.join('\n'));
  });
});
