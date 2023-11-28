import {describe, expect, test} from '@jest/globals';
import {cardToString, CardType, CardTypes, Classifications, Colors, LorcanaAPI, Rarities} from "./index.js";
import {fail, failIfReason} from "./util.test.js";

describe('LorcanaAPI', () => {
  const api = new LorcanaAPI();
  const cardsPromise = api.getCardsList();

  test('Fetching the cards list works', async () => {
    await expect(cardsPromise).resolves.toBeDefined();
  });

  test('Card colors match', async () => {
    const errors: string[] = [];
    const cards = await cardsPromise;
    for(const card of cards) {
      if(!Colors.includes(card.Color)) {
        errors.push(`Unknown color '${card.Color}' found on card ${cardToString(card)}`);
      }
    }
    failIfReason(errors.join('\n'));
  });

  test('Card rarities match', async () => {
    const errors: string[] = [];
    const cards = await cardsPromise;
    for(const card of cards) {
      if(!Rarities.includes(card.Rarity)) {
        errors.push(`Unknown rarity '${card.Rarity}' found on card ${cardToString(card)}`);
      }
    }
    failIfReason(errors.join('\n'));
  });

  test('Card types match', async () => {
    const errors: string[] = [];
    const cards = await cardsPromise;
    for(const card of cards) {
      if(!CardTypes.includes(card.Type)) {
        errors.push(`Unknown card type '${card.Type}' found on card ${cardToString(card)}`);
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

  test('Card images resolve correctly', async () => {
    const errors: string[] = [];
    const cards = await cardsPromise;
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
