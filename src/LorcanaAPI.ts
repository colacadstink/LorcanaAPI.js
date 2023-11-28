import {AbilityParsers, CardData, cardToString} from "./types/index.js";

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
      const resp = await fetch(`${this.#apiRootUrl}/cards/all`);
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
    // TODO use the API properly lol
    if(!this.#cardsList) {
      await this.getCardsList();
    }
    return this.#cardsList!.find((card) => card.Name === name);
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

    if('Classifications' in jsonObj && typeof jsonObj.Classifications === 'string' && 'Classifications' in cardData) {
      cardData.Classifications = jsonObj.Classifications
        .split(',')
        .map((c) => c.trim())
        .filter((c) => !!c);
    }

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
          console.error(`LorcanaAPI.js error: Unable to parse ability ${ability} on card ${cardToString(cardData)}`);
        }
      }
    }

    return cardData;
  }
}
