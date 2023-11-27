import {CardData} from "./types/CardData.js";

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
      this.#cardsList = await resp.json() as CardData[];
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
}
