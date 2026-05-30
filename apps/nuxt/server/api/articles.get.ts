import { readFileSync } from 'fs'
import { resolve } from 'path'

export default defineEventHandler(() => {
    return $fetch('https://typewords.cc/list/article.json')

    const path = resolve(process.cwd(), 'public/list/article.json')
    const data = JSON.parse(readFileSync(path, 'utf-8'))
    return data
})