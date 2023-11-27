import {CardData} from "./types/index.js";

const DEFAULT_API_ROOT_URL = 'https://api.lorcana-api.com';

export type LorcanaAPIConfig = {
  apiRootUrl?: string,
};

export class LorcanaAPI {
  #cardsList: CardData[] | undefined = undefined;
  readonly #apiRootUrl: string;

  constructor(config?: LorcanaAPIConfig) {
    this.#apiRootUrl = config?.apiRootUrl ?? DEFAULT_API_ROOT_URL;
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

    return cardData;
  }
}
