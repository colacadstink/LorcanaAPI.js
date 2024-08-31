import {AbilityParsers, CardData, getCardNameAndID} from "./types/index.js";

export const DEFAULT_LORCANA_API_ROOT_URL = 'https://api.lorcana-api.com';

export type LorcanaAPIConfig = {
  apiRootUrl?: string,
};

export class LorcanaAPI {
  #cardsList: CardData[] | undefined = undefined;
  readonly #apiRootUrl: string;

  constructor(config?: LorcanaAPIConfig) {
    this.#apiRootUrl = config?.apiRootUrl ?? DEFAULT_LORCANA_API_ROOT_URL;
  }

  async getCardsList(force = false): Promise<CardData[]> {
    if(force || !this.#cardsList) {
      const resp = await fetch(`${this.#apiRootUrl}/bulk/cards`);
      this.#assertResponseGood(resp);
      const jsonObj = await resp.json();
      if(!Array.isArray(jsonObj)) {
        throw new Error(`getCardsList didn't return an array - what? I got this instead: ${JSON.stringify(jsonObj)}`);
      }
      this.#cardsList = jsonObj.map((card) => this.#massageCardData(card));
    }
    return this.#cardsList;
  }

  async getCardByName(name: string): Promise<CardData | undefined> {
    const resp = await fetch(`${this.#apiRootUrl}/cards/fetch?search=name=${encodeURIComponent(name)}`);
    this.#assertResponseGood(resp);
    const jsonObj = await resp.json();
    if(!Array.isArray(jsonObj)) {
      throw new Error(`/cards/fetch didn't return an array - what? I got this instead: ${JSON.stringify(jsonObj)}`);
    }
    return jsonObj.map((card) => this.#massageCardData(card))[0] ?? undefined;
  }

  async getCardByIDs(setNum: number, cardNum: number): Promise<CardData | undefined> {
    const resp = await fetch(`${this.#apiRootUrl}/cards/fetch?search=set_num=${setNum};card_num=${cardNum};`);
    this.#assertResponseGood(resp);
    const jsonObj = await resp.json();
    if(!Array.isArray(jsonObj)) {
      throw new Error(`/cards/fetch didn't return an array - what? I got this instead: ${JSON.stringify(jsonObj)}`);
    }
    return jsonObj.map((card) => this.#massageCardData(card))[0] ?? undefined;
  }

  async getCardsByIDs(cardIDs: {setNum: number, cardNum: number}[]): Promise<CardData[] | undefined> {
    // Build out the search string
    const groupedBySet: Record<number, number[]> = {};
    for(const {setNum, cardNum} of cardIDs) {
      if(!groupedBySet[setNum]) {
        groupedBySet[setNum] = [];
      }
      groupedBySet[setNum].push(cardNum);
    }
    const searchString = Object.entries(groupedBySet)
      .map(([setNum, cardNums]) => {
        return `(set_num=${setNum};(${
          cardNums.map((cardNum) => `card_num=${cardNum}`).join(';|')
        };);)`;
      })
      .join(';|');

    // Actually query the API
    const resp = await fetch(`${this.#apiRootUrl}/cards/fetch?search=${encodeURI(searchString)}`);
    this.#assertResponseGood(resp);
    const jsonObj = await resp.json();
    if(!Array.isArray(jsonObj)) {
      throw new Error(`/cards/fetch didn't return an array - what? I got this instead: ${JSON.stringify(jsonObj)}`);
    }
    return jsonObj.map((card) => this.#massageCardData(card)) ?? undefined;
  }

  #assertResponseGood(resp: Response): void {
    if(!resp.ok) {
      throw new Error('Error fetching cards list: ' + resp.statusText);
    }
  }

  #massageCardData(jsonObj: unknown): CardData {
    if(!jsonObj || typeof jsonObj !== 'object') {
      throw new Error(`Server response isn't a card: ${jsonObj}`);
    }

    const cardData = {
      ...jsonObj,
    } as CardData;

    // Chop the classifications up into an array
    if('Classifications' in jsonObj && typeof jsonObj.Classifications === 'string' && 'Classifications' in cardData) {
      cardData.Classifications = jsonObj.Classifications
        .split(',')
        .map((c) => c.trim())
        .filter((c) => !!c);
    }

    // Chop up the abilities, and parse them into objects
    if('Abilities' in jsonObj && typeof jsonObj.Abilities === 'string' && 'Abilities' in cardData) {
      // Start with a blank ability object
      cardData.Abilities = {};

      // Split this up on commas, eat all the whitespace
      const abilityStrings = jsonObj.Abilities.trim().split(/\s*,\s*/);

      for(const ability of abilityStrings) {
        // Set this to true later, once we've found a parser that accepted this ability
        let abilityParsed = false;

        // Loop through all the parsers, trying each one, and stopping when someone gives us back a non-fasle value
        for(const [abilityName, parser] of Object.entries(AbilityParsers)) {
          const config = parser(ability);
          if(config !== false) {
            // @ts-expect-error - We've checked that this ability parses correctly, we can safely assign
            cardData.Abilities[abilityName] = config;
            abilityParsed = true;
            break;
          }
        }

        // Either we found a parser that accepted it, or it failed all parsers. Check which & complain if necessary:
        if(!abilityParsed) {
          console.error(`LorcanaAPI.js error: Unable to parse ability ${ability} on card ${getCardNameAndID(cardData)}`);
        }
      }
    }

    return cardData;
  }
}
