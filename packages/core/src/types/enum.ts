export enum CompareResult {
  RemoteNewer = 0,
  LocalNewer = 1,
  Equal = 2,
  NoRemote = 3,
  NoLocal = 4,
}

export enum DictType {
  collect = 'collect',
  simple = 'simple',
  wrong = 'wrong',
  known = 'known',
  word = 'word',
  article = 'article',
}
export enum Sort {
  normal = 0,
  random = 1,
  reverse = 2,
  reverseAll = 3,
  randomAll = 4,
}

export enum ShortcutKey {
  ShowWord = 'ShowWord',
  EditArticle = 'EditArticle',
  Next = 'Next',
  Ignore = 'Ignore',
  Previous = 'Previous',
  ToggleSimple = 'ToggleSimple',
  ToggleCollect = 'ToggleCollect',
  NextChapter = 'NextChapter',
  PreviousChapter = 'PreviousChapter',
  NextStep = 'NextStep',
  RepeatChapter = 'RepeatChapter',
  DictationChapter = 'DictationChapter',
  PlayWordPronunciation = 'PlayWordPronunciation',
  ToggleShowTranslate = 'ToggleShowTranslate',
  ToggleDictation = 'ToggleDictation',
  ToggleTheme = 'ToggleTheme',
  ToggleToolbar = 'ToggleToolbar',
  ToggleConciseMode = 'ToggleConciseMode',
  TogglePanel = 'TogglePanel',
  RandomWrite = 'RandomWrite',
  KnowWord = 'KnowWord',
  UnknownWord = 'UnknownWord',
  MasteredWord = 'MasteredWord',
  ChooseA = 'ChooseA',
  ChooseB = 'ChooseB',
  ChooseC = 'ChooseC',
  ChooseD = 'ChooseD',
}

export enum TranslateEngine {
  Baidu = 0,
}

export enum PracticeArticleWordType {
  Symbol,
  Number,
  Word,
}



export enum WordPracticeMode {
  // practice-words
  System = 0,
  Free = 1,
  IdentifyOnly = 2,
  DictationOnly = 3,
  ListenOnly = 4,
  Shuffle = 5,
  Review = 6,
  // words-test
  ShuffleWordsTest = 7,
  ReviewWordsTest = 8,
}


export enum WordPracticeType {
  FollowWrite,
  Spell,
  Identify,
  Listen,
  Dictation,
}

export enum CodeType {
  Login = 0,
  Register = 1,
  ResetPwd = 2,
  ChangeEmail = 3,
  ChangePhoneNew = 4,
  ChangePhoneOld = 5,
}

export enum ImportStatus {
  Idle = 0,
  Success = 1,
  Fail = 2,
}


export enum WordPracticeStage {
  FollowWriteNewWord = 0,
  IdentifyNewWord = 1,
  ListenNewWord = 2,
  DictationNewWord = 3,

  FollowWriteReview = 4,
  IdentifyReview = 5,
  ListenReview = 6,
  DictationReview = 7,

  Shuffle = 12,
  Complete = 13,
}


export enum IdentifyMethod {

  SelfAssessment = 0,

  WordTest = 1,

  QuickIdentify = 2,
}

export enum SyncDataType {
  dict = 'dict',
  setting = 'setting',
  practice_word = 'practice_word',
  practice_article = 'practice_article',
}

export enum Frequency {
  Rare = 0,
  Uncommon = 1,
  Common = 2,
}