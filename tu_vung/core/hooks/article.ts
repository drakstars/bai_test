import type { Article, Sentence } from '../types'
import { getDefaultArticleWord, getDefaultDict, PracticeArticleWordType } from '../types'
import { _nextTick, cloneDeep } from '../utils'
import { usePlayWordAudio } from './sound'
import { getSentenceAllText, getSentenceAllTranslateText } from './translate'
import { useBaseStore } from '../stores/base'
import { useRuntimeStore } from '../stores/runtime'
import { nanoid } from 'nanoid'
import { DictId } from '../config/env'

function parseSentence(sentence: string) {

  sentence = sentence
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')

  const len = sentence.length
  const tokens = []
  let i = 0

  while (i < len) {
    const ch = sentence[i]


    if (/\s/.test(ch)) {
      i++
      continue
    }

    const rest = sentence.slice(i)


    let m = rest.match(/^[\$¥€£]\d{1,3}(?:,\d{3})*(?:\.\d+)?%?/)
    if (m) {
      tokens.push({ word: m[0], start: i, end: i + m[0].length, type: PracticeArticleWordType.Number })
      i += m[0].length
      continue
    }


    m = rest.match(/^\d{1,3}(?:,\d{3})*(?:\.\d+)?%?/)
    if (m) {
      tokens.push({ word: m[0], start: i, end: i + m[0].length, type: PracticeArticleWordType.Number })
      i += m[0].length
      continue
    }


    m = rest.match(/^[A-Za-z]+(?:\.[A-Za-z]+)+\.?/)
    if (m) {
      tokens.push({ word: m[0], start: i, end: i + m[0].length, type: PracticeArticleWordType.Word })
      i += m[0].length
      continue
    }


    m = rest.match(/^[A-Za-z0-9]+(?:[\'\-][A-Za-z0-9]+)*/)
    if (m) {
      tokens.push({ word: m[0], start: i, end: i + m[0].length, type: PracticeArticleWordType.Word })
      i += m[0].length
      continue
    }



    if (/[^\w\s]/.test(ch)) {
      tokens.push({ word: ch, start: i, end: i + 1, type: PracticeArticleWordType.Symbol })
      i += 1
      continue
    }


    tokens.push({ word: ch, start: i, end: i + 1, type: PracticeArticleWordType.Symbol })
    i += 1
  }


  const result = tokens.map((t, idx) => {
    const next = tokens[idx + 1]
    const between = next ? sentence.slice(t.end, next.start) : sentence.slice(t.end)
    const nextSpace = /\s/.test(between)
    return getDefaultArticleWord({ word: t.word, nextSpace, type: t.type })
  })

  return result
}


export function genArticleSectionData(article: Article): number {
  let text = article.text.trim()
  let sections: Sentence[][] = []
  text
    .split('\n\n')
    .filter(Boolean)
    .map((sectionText, i) => {
      let section: Sentence[] = []
      sections.push(section)
      sectionText
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((item, i, arr) => {
          item = item.trim()



          if (i < arr.length - 1) item += ' '
          let sentence: Sentence = cloneDeep({
            text: item,
            translate: '',
            words: parseSentence(item),
            audioPosition: [0, 0],
          })
          section.push(sentence)
        })
    })

  sections = sections.filter(v => v.length)
  article.sections = sections

  let failCount = 0
  let translateList = article.textTranslate?.split('\n\n') || []
  for (let i = 0; i < article.sections.length; i++) {
    let v = article.sections[i]
    let sList = []
    try {
      let s = translateList[i]
      sList = s.split('\n')
    } catch (e) {}

    for (let j = 0; j < v.length; j++) {
      let sentence = v[j]
      try {
        let trans = sList[j]
        if (trans.trim()) {
          sentence.translate = trans
        } else {
          failCount++
        }
      } catch (e) {
        failCount++

      }
    }
  }

  text = getSentenceAllText(article)
  let translate = getSentenceAllTranslateText(article)

  article.text = text
  article.textTranslate = translate

  let count = 0
  if (article?.lrcPosition?.length) {
    article.sections.map((v, i) => {
      v.map((w, j) => {
        w.audioPosition = article.lrcPosition[count]
        count++
      })
    })
  }
  return failCount
}

export function splitEnArticle2(text: string): string {
  text = text.trim()
  if (!text && false) {
    //     text = `It was Sunday. I never get up early on Sundays. I sometimes stay in bed until lunchtime. Last Sunday I got up very late. I looked out of the window. It was dark outside. 'What a day!' I thought. 'It's raining again. ' Just then, the telephone rang. It was my aunt Lucy. 'I've just arrived by train, ' she said. 'I'm coming to see you. '
    //
    // 'But I'm still having breakfast, ' I said.
    // 'What are you doing?' she asked.
    // 'I'm having breakfast, ' I repeated.
    // 'Dear me,$3.000' she said. 'Do you always get up so late? It's one o'clock!'`
    //     text = `While it is yet to be seen what direction the second Trump administration will take globally in its China policy, VOA traveled to the main island of Mahe in Seychelles to look at how China and the U.S. have impacted the country, and how each is fairing in that competition for influence there.`
    // text = "It was Sunday. I never get up early on Sundays. I sometimes stay in bed until lunchtime. Last Sunday I got up very late. I looked out of the window. It was dark outside. 'What a day!' I thought. 'It's raining again.' Just then, the telephone rang. It was my aunt Lucy. 'I've just arrived by train,' she said. 'I'm coming to see you.'\n\n     'But I'm still having breakfast,' I said.\n\n     'What are you doing?' she asked.\n\n     'I'm having breakfast,' I repeated.\n\n     'Dear me,' she said. 'Do you always get up so late? It's one o'clock!'"
  }

  if (!text) return ''

  const abbreviations = [
    'Mr',
    'Mrs',
    'Ms',
    'Dr',
    'Prof',
    'Sr',
    'Jr',
    'St',
    'Co',
    'Ltd',
    'Inc',
    'e.g',
    'i.e',
    'U.S.A',
    'U.S',
    'U.K',
    'etc',
  ]

  function isSentenceEnd(text, idx) {
    const before = text.slice(0, idx + 1)
    const after = text.slice(idx + 1)

    const abbrevPattern = new RegExp('\\b(' + abbreviations.join('|') + ')\\.$', 'i')
    if (abbrevPattern.test(before)) return false
    if (/\d+\.$/.test(before)) return false
    if (/\d+\.\d/.test(text.slice(idx - 1, idx + 2))) return false
    if (/%/.test(after)) return false
    if (/[\$¥€]\d/.test(before + after)) return false

    return true
  }

  function normalizeQuotes(text) {
    const isWord = ch => /\w/.test(ch)
    let res = []
    let singleOpen = false
    let doubleOpen = false
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]
      if (ch === "'") {
        const prev = i > 0 ? text[i - 1] : ''
        const nxt = i + 1 < text.length ? text[i + 1] : ''
        if (isWord(prev) && isWord(nxt)) {
          res.push("'")
          continue
        }
        if (singleOpen) {
          if (res.length && res[res.length - 1] === ' ') res.pop()
          res.push("'")
          singleOpen = false
        } else {
          res.push("'")
          singleOpen = true
        }
      } else if (ch === '"') {
        if (doubleOpen) {
          if (res.length && res[res.length - 1] === ' ') res.pop()
          res.push('"')
          doubleOpen = false
        } else {
          res.push('"')
          doubleOpen = true
        }
      } else {
        res.push(ch)
      }
    }
    return res.join('')
  }

  let rawParagraphs = text.replaceAll('\n\n', '`^`').replaceAll('\n', '').split('`^`')

  const formattedParagraphs = rawParagraphs.map(p => {
    p = p.trim()
    if (!p) return ''

    p = p.replace(/\n/g, ' ')
    p = normalizeQuotes(p)

    const tentative: string[] = p.match(/[^.!?。！？]+[.!?。！？'"”’)]*/g) || []

    const sentences = []
    tentative.forEach(segment => {
      segment = segment.trim()
      if (!segment) return

      const lastCharIdx = segment.length - 1
      if (/[.!?。！？]/.test(segment[lastCharIdx])) {
        const globalIdx = p.indexOf(segment)
        if (!isSentenceEnd(p, globalIdx + segment.length - 1)) {
          if (sentences.length > 0) {
            sentences[sentences.length - 1] += ' ' + segment
          } else {
            sentences.push(segment)
          }
          return
        }
      }
      sentences.push(segment)
    })

    const finalSentences = []
    let i = 0
    while (i < sentences.length) {
      let cur = sentences[i]
      if (i + 1 < sentences.length) {
        const nxt = sentences[i + 1]
        if (/['"”’)\]]$/.test(cur) && /^[a-z]|^(I|You|She|He|They|We)\b/i.test(nxt)) {
          finalSentences.push(cur + ' ' + nxt)
          i += 2
          continue
        }
      }
      finalSentences.push(cur)
      i += 1
    }

    return finalSentences.join('\n')
  })

  return formattedParagraphs.filter(p => p).join('\n\n')
}

export function splitCNArticle2(text: string): string {
  if (!text && false) {








  }
  const segmenterJa = new Intl.Segmenter('zh-CN', { granularity: 'sentence' })

  let sectionTextList = text.replaceAll('\n\n', '`^`').replaceAll('\n', '').split('`^`')

  let s = sectionTextList
    .filter(v => v)
    .map((rowSection, i) => {
      const segments = segmenterJa.segment(rowSection)
      let ss = ''
      Array.from(segments).map(sentenceRow => {
        let row = sentenceRow.segment
        if (row) {


          if (row[row.length - 1] === '“') {
            row = row.substring(0, row.length - 1)
            ss += row + '\n' + '“'
          } else {
            ss += row + '\n'
          }
        }
      })
      return ss
    })
    .join('\n')
    .trim()
  return s
}

export function usePlaySentenceAudio() {
  const playWordAudio = usePlayWordAudio()
  let timer = $ref<any>(0)

  function playSentenceAudio(sentence: Sentence, ref?: HTMLAudioElement) {
    if (sentence.audioPosition?.length && ref && ref.src) {
      clearTimeout(timer)
      if (ref.played) {
        ref.pause()
      }
      let start = sentence.audioPosition[0]
      // ref.volume = settingStore.wordSoundVolume / 100
      ref.currentTime = start
      ref.play()
      let end = sentence.audioPosition?.[1]
      // console.log(sentence.audioPosition,(end - start) * 1000)

      if (end && end !== -1) {
        timer = setTimeout(
          () => {
            console.log('停')
            ref.pause()
          },
          ((end - start) / ref.playbackRate) * 1000
        )
      }
    } else {
      playWordAudio(sentence.text)
    }
  }

  return {
    playSentenceAudio,
  }
}


export function syncBookInMyStudyList(study = false) {
  _nextTick(() => {
    const base = useBaseStore()
    const runtimeStore = useRuntimeStore()
    let temp = runtimeStore.editDict
    let rIndex = base.article.bookList.findIndex(v => v.id === temp.id)
    if (!temp.custom && temp.id !== DictId.articleCollect) {
      temp.custom = true
      if (!temp.id.includes('_custom')) {
        temp.id += '_custom_' + nanoid(6)
      }
    }
    temp.length = temp.articles.length
    if (rIndex > -1) {
      base.article.bookList[rIndex] = getDefaultDict(temp)
      if (study) base.article.studyIndex = rIndex
    } else {
      base.article.bookList.push(getDefaultDict(temp))
      if (study) base.article.studyIndex = base.article.bookList.length - 1
    }
  }, 100)
}