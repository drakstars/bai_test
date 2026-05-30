


const namedImports = {
  BasePage: '@/z-polyfill/BasePage.vue',
}


const pathRedirects = [
  {
    source: '@typewords/core/components/PracticeLayout.vue',
    target: '@/z-polyfill/PracticeLayout.vue',
  },
]

export default function polyfillComponentPlugin() {
  return {
    name: 'polyfill-component',
    transform(code, id) {

      if (!id.endsWith('.ts') && !id.endsWith('.vue')) return

      if (id.includes('z-polyfill')) return

      let modified = false
      let newCode = code



      if (newCode.includes('@typewords/base')) {
        for (const [componentName, polyfillPath] of Object.entries(namedImports)) {


          const importRegex = new RegExp(
            `(import\\s*\\{[^}]*?)\\b${componentName}\\b(.*?\\}\\s*from\\s*['"]@typewords/base['"])`,
            's',
          )
          if (!importRegex.test(newCode)) continue

          newCode = newCode.replace(importRegex, (_, before, after) => {

            const remaining = `${before}${after}`
              .replace(/,\s*,/g, ',')
              .replace(/\{\s*,/g, '{')
              .replace(/,\s*\}/g, ' }')


            const emptyBraces = /\{\s*\}/.test(remaining)
            if (emptyBraces) {

              return `import ${componentName} from '${polyfillPath}'`
            } else {

              return `import ${componentName} from '${polyfillPath}'\n${remaining}`
            }
          })

          modified = true
        }
      }


      for (const { source, target } of pathRedirects) {
        if (!newCode.includes(source)) continue

        const escaped = source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        newCode = newCode.replace(
          new RegExp(`(from\\s*['"])${escaped}(['"])`, 'g'),
          `$1${target}$2`,
        )
        modified = true
      }

      return modified ? newCode : null
    },
  }
}