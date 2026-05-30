const fs = require('fs')
const path = require('path')

const sourceDir = path.resolve(__dirname, './dist')
const targetDir = path.resolve(__dirname, '../../dist')


function copyDir(src, dest) {

  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true })
    console.log(`🗑️  已删除目标目录: ${dest}`)
  }


  fs.mkdirSync(dest, { recursive: true })


  const entries = fs.readdirSync(src, { withFileTypes: true })

  let fileCount = 0
  let dirCount = 0

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
      dirCount++
    } else {
      fs.copyFileSync(srcPath, destPath)
      fileCount++
    }
  }

  return { fileCount, dirCount }
}


function main() {
  try {

    if (!fs.existsSync(sourceDir)) {
      console.error(`❌ 错误: 源目录不存在: ${sourceDir}`)
      console.error('   请先运行 pnpm --filter vscode-web build')
      process.exit(1)
    }

    console.log(`📦 开始复制 vscode-web 构建产物...`)
    console.log(`   源目录: ${sourceDir}`)
    console.log(`   目标目录: ${targetDir}`)

    const { fileCount, dirCount } = copyDir(sourceDir, targetDir)

    console.log(`✅ 复制完成!`)
    console.log(`   文件数: ${fileCount}, 目录数: ${dirCount}`)
  } catch (error) {
    console.error('❌ 复制失败:', error.message)
    process.exit(1)
  }
}

main()