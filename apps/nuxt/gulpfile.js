import { src, dest } from 'gulp';
import through from 'through2';
import * as XLSX from 'xlsx';
import * as path from 'path';
import Vinyl from 'vinyl';


const LANGUAGES = ['en', 'zh', 'id', 'tw', 'th', 'ru', 'vi', 'es', 'pt', 'ja', 'uk', 'ko', 'de', 'fr'];

function excel2i18n() {
  const stream = through.obj(function(file, encode, cb) {
    if (!file.isBuffer()) {
      return cb(null, file);
    }

    const workbook = XLSX.read(file.contents);
    const excelData = XLSX.utils.sheet_to_json(workbook.Sheets['Sheet1']);


    const translations = {};
    LANGUAGES.forEach(lang => {
      translations[lang] = {};
    });


    excelData.forEach(row => {
      let parsedRow = {};
      for (const key in row) {
        const letterPattern = /[a-zA-Z]+/g;
        const matches = key.match(letterPattern);
        if (matches) {
          const normalizedKey = matches[0].toLowerCase();
          parsedRow[normalizedKey] = row[key].replace(/@{/g, '{');
        }
      }


      if (parsedRow.key) {
        LANGUAGES.forEach(lang => {
          if (parsedRow[lang]) {
            translations[lang][parsedRow.key] = parsedRow[lang];
          }
        });
      }
    });


    LANGUAGES.forEach(lang => {
      if (Object.keys(translations[lang]).length > 0) {
        const langFile = new Vinyl({
          base: file.base,
          path: path.join(file.base, `${lang}.json`),
          contents: Buffer.from(JSON.stringify(translations[lang], null, '\t'))
        });
        this.push(langFile);
      }
    });

    cb();
  });

  return stream;
}


function i18nWrite() {
  return src(['../nuxt/i18n/i18n.xlsx'], { encoding: false })
    .pipe(excel2i18n())
    .pipe(dest('../nuxt/i18n/locales'));
}

export { i18nWrite };