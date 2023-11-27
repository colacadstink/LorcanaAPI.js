import {describe, expect, test} from '@jest/globals';
import {cardToString, CardType, CardTypes, Classifications, Colors, LorcanaAPI, Rarities} from "./index.js";
import {fail, failIfReason} from "./util.test.js";

describe('LorcanaAPI', () => {
  const api = new LorcanaAPI();

  beforeAll(async () => {
    // Get the cards list once up front, so we can use the cached value throughout
    await api.getCardsList();
  });

  test.concurrent('Fetching the cards list works', async () => {
    await expect(api.getCardsList()).resolves.toBeDefined();
  });

  test.concurrent('Card colors match', async () => {
    const cards = await api.getCardsList();
    const errors: string[] = [];
    for(const card of cards) {
      if(!Colors.includes(card.Color)) {
        errors.push(`Unknown color '${card.Color}' found on card ${cardToString(card)}`);
      }
    }
    failIfReason(errors.join('\n'));
  });

  test.concurrent('Card rarities match', async () => {
    const cards = await api.getCardsList();
    const errors: string[] = [];
    for(const card of cards) {
      if(!Rarities.includes(card.Rarity)) {
        errors.push(`Unknown rarity '${card.Rarity}' found on card ${cardToString(card)}`);
      }
    }
    failIfReason(errors.join('\n'));
  });

  test.concurrent('Card types match', async () => {
    const cards = await api.getCardsList();
    const errors: string[] = [];
    for(const card of cards) {
      if(!CardTypes.includes(card.Type)) {
        errors.push(`Unknown card type '${card.Type}' found on card ${cardToString(card)}`);
      }
    }
    failIfReason(errors.join('\n'));
  });

  test.concurrent('Card classifications match', async () => {
    const cards = await api.getCardsList();
    const errors: string[] = [];
    for(const card of cards) {
      if('Classifications' in card) {
        for(const classification of card.Classifications) {
          if(!(Classifications as string[]).includes(classification)) {
            errors.push(`Unknown card classification '${classification}' found on card ${cardToString(card)}`);
          }
        }
        if(card.Classifications.length === 0) {
          errors.push(`Classifications present, but zero length for card ${cardToString(card)}`);
        }
      }
    }
    failIfReason(errors.join('\n'));
  });

  test.concurrent('[TS] Type narrowing works as expected', async () => {
    const aladdin = await api.getCardByName('Aladdin - Cornered Swordsman');
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

  test('Card images resolve correctly', async () => {
    const cards = await api.getCardsList();
    const errors: string[] = [];
    await Promise.all(cards.map(async (card) => {
      try {
        const response = await fetch(card.Image);
        if(!response.ok) {
          errors.push(`BAD CARD IMAGE: ${cardToString(card)} - '${card.Image}'`);
          return;
        }
        const contentType = response.headers.get('Content-Type');
        if(!contentType) {
          errors.push(`MISSING CONTENT TYPE, PROBABLY BAD: ${cardToString(card)} - '${card.Image}'`);
          return;
        }
        if(!contentType.startsWith('image/')) {
          errors.push(`CONTENT TYPE NOT IMAGE, PROBABLY BAD: ${cardToString(card)} - '${card.Image}'`);
          return;
        }
      } catch {
        errors.push(`ERROR WHILE FETCHING, PROBABLY BAD: ${cardToString(card)} - '${card.Image}'`);
      }
    }));
    failIfReason(errors.join('\n'));
  },10*60_000);
});
