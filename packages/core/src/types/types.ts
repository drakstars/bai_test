import { DictType, Frequency, PracticeArticleWordType } from './enum'
import type { Rating } from 'ts-fsrs'
import { PRACTICE_ARTICLE_CACHE, PRACTICE_WORD_CACHE } from '../utils/cache'
import { APP_VERSION } from '../config/env'

export type Word = {
  id?: string
  custom?: boolean
  word: string
  phonetic0: string
  phonetic1: string
  trans: {
    pos: string
    cn: string
    frequency?: Frequency
  }[]
  sentences: {
    c: string //content
    cn: string
  }[]
  phrases: {
    c: string
    cn: string
  }[]
  synos: {
    pos: string
    cn: string
    ws: string[]
  }[]
  relWords: {
    root: string
    rels: {
      pos: string
      words: {
        c: string
        cn: string
      }[]
    }[]
  }
  etymology: {
    t: string //title
    d: string //desc
  }[]
}

export type TranslateLanguageType = 'en' | 'zh-CN' | 'ja' | 'de' | 'common' | ''
export type LanguageType = 'en' | 'ja' | 'de' | 'code'

export interface ArticleWord extends Word {
  nextSpace: boolean
  symbolPosition: 'start' | 'end' | ''
  input: string
  type: PracticeArticleWordType
}

export interface Sentence {
  text: string
  translate: string
  words: ArticleWord[]
  audioPosition: number[]
}

export interface Article {
  id?: number | string
  title: string
  titleTranslate: string
  text: string
  textTranslate: string
  newWords: Word[]
  sections: Sentence[][]
  audioSrc: string
  audioFileId: string
  lrcPosition: number[][]
  nameList: string[]
  questions: {
    stem: string
    options: string[]
    correctAnswer: string[]
    explanation: string
  }[]
  quote?: {
    start: number
    text: string
    translate: string
    end: number
  }
  question?: {
    start: number
    text: string
    translate: string
    end: number
  }
}

export interface Statistics {
  startDate: number
  spend: number
  total: number
  new: number
  review: number
  wrong: number
  title?: string
  
  segments?: [number, number][]
  
  sessionRole?: 'single' | 'start' | 'middle' | 'end'
}

export type DictResource = {
  id: string
  name: string
  description: string
  url: string
  length: number
  category: string
  tags: string[]
  translateLanguage: TranslateLanguageType

  type?: DictType
  version?: number
  language: LanguageType
}

export interface Dict extends DictResource {
  lastLearnIndex: number
  perDayStudyNumber: number
  words: Word[]
  articles: Article[]
  statistics: Statistics[]
  custom: boolean
  complete: boolean

  en_name?: string
  createdBy?: string
  category_id?: number
  is_default?: boolean
  update?: boolean
  cover?: string
  sync?: boolean
  userDictId?: number
}

export interface ArticleItem {
  item: Article
  index: number
}

export interface PracticeData {
  index: number
  words: Word[]
  wrongWords: Word[]
  excludeWords: string[]
  allWrongWords: string[]
  isTypingWrongWord: boolean

  wrongTimesMap: Record<string, number>
  wrongTimes: number
  ratingMap: Record<string, Rating>
  question: Question
}

export interface TaskWords {
  new: Word[]
  review: Word[]
}

export interface SaveData {
  val: any
  version: number
  updated_at?: string
}

export interface Snapshot {
  meta: {
    currentHash: string
    previousHash: string
    createdAt: number
  }
  data: {
    dict: string
    setting: string
    [PRACTICE_WORD_CACHE.key]: string
    [PRACTICE_ARTICLE_CACHE.key]: string
    [APP_VERSION.key]: number
  }
}

export interface BackupData {
  version: number
  val: {
    dict: SaveData
    setting: SaveData
    [PRACTICE_WORD_CACHE.key]: SaveData
    [PRACTICE_ARTICLE_CACHE.key]: SaveData
    [APP_VERSION.key]: number
  }
}

export type Candidate = { word: Word; similarity: number }

export type Question = {
  candidates: Candidate[]
  correctIndex: number
}

export interface Resource {
  name?: string
  description?: string
  difficulty?: string
  link?: string
  author?: string
  features?: string
  suitable?: string
  type?: string
  children?: Resource[]
}