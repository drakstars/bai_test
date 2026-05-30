import type {
  Languages,
  TranslatorEnv,
  TranslatorInit,
  TranslateResult,
  TranslateQueryResult
} from "./type";
import type { Language } from "../languages";
import Axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosPromise } from "axios";

export abstract class Translator<Config extends {} = {}> {
  axios: AxiosInstance;

  protected readonly env: TranslatorEnv;

  
  config: Config;

  
  abstract readonly name: string;

  
  constructor(init: TranslatorInit<Config> = {}) {
    this.env = init.env || "node";
    this.axios = init.axios || Axios;
    this.config = init.config || ({} as Config);
  }

  
  abstract getSupportLanguages(): Languages;

  
  async translate(
    text: string,
    from: Language,
    to: Language,
    config = {} as Config
  ): Promise<TranslateResult> {
    const queryResult = await this.query(text, from, to, {
      ...this.config,
      ...config
    });

    return {
      ...queryResult,
      engine: this.name
    };
  }

  
  updateToken?(): Promise<void>;

  
  protected abstract query(
    text: string,
    from: Language,
    to: Language,
    config: Config
  ): Promise<TranslateQueryResult>;

  protected request<R = {}>(
    url: string,
    config?: AxiosRequestConfig
  ): AxiosPromise<R> {
    return this.axios(url, config);
  }

  
  async detect(text: string): Promise<Language> {
    return
  }

  
  textToSpeech(
    text: string,
    lang: Language,
    meta?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<string | null> {
    return Promise.resolve(null);
  }
}