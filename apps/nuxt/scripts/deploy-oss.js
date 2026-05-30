import OSS from 'ali-oss'
import fs from 'fs'
import path from 'path'
import Core from '@alicloud/pop-core'

const {
  OSS_REGION,
  OSS_KEY_ID,
  OSS_KEY_SECRET,
  OSS_BUCKET,
} = process.env

if (!OSS_REGION || !OSS_KEY_ID || !OSS_KEY_SECRET || !OSS_BUCKET) {
  console.error('❌ 缺少必要的环境变量，请检查 GitHub Secrets 配置')
  process.exit(1)
}

const client = new OSS({
  region: OSS_REGION,
  accessKeyId: OSS_KEY_ID,
  accessKeySecret: OSS_KEY_SECRET,
  bucket: OSS_BUCKET
})

const cdnClient = new Core({
  accessKeyId: OSS_KEY_ID,
  accessKeySecret: OSS_KEY_SECRET,
  endpoint: 'https://cdn.aliyuncs.com',
  apiVersion: '2018-05-10'
})


function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList)
    } else {
      fileList.push(filePath)
    }
  }
  return fileList
}



async function uploadFilesWithClean(files, localBase = './dist', ignoreDirs = []) {

  const filteredFiles = files.filter(file => {
    const relativePath = path.relative(localBase, file)
    const topDir = relativePath.split(path.sep)[0]
    return !ignoreDirs.includes(topDir)
  })


  console.log('📄 获取远端文件列表...')
  let remoteFiles = []
  let marker = ''
  do {
    const result = await client.list({
      prefix: '',
      'max-keys': 1000,
      marker,
    })

    if (result.objects) {
      remoteFiles.push(...result.objects.map(f => f.name))
    }

    marker = result.nextMarker || ''
  } while (marker)


  const total = filteredFiles.length
  let count = 0
  const uploadedFiles = []

  for (const file of filteredFiles) {
    const relativePath = path.relative(localBase, file)
    const remotePath = relativePath.split(path.sep).join('/')
    await client.put(remotePath, file)
    uploadedFiles.push(remotePath)
    count++
    const percent = ((count / total) * 100).toFixed(1)
    process.stdout.write(`\r📤 上传进度: ${count}/${total} (${percent}%) ${remotePath}       `)
  }
  console.log('\n✅ 文件上传完成')


  const toDelete = remoteFiles.filter(f => {
    const topDir = f.split('/')[0]
    return !uploadedFiles.includes(f) && !ignoreDirs.includes(topDir)
  })

  if (toDelete.length) {
    console.log('🗑 删除远端多余文件:', toDelete)

    const batchSize = 1000
    for (let i = 0; i < toDelete.length; i += batchSize) {
      const batch = toDelete.slice(i, i + batchSize)
      await client.deleteMulti(batch)
    }
    console.log('✅ 多余文件删除完成')
  } else {
    console.log('ℹ️ 无需删除远端文件')
  }
}



async function refreshCDN(domain) {
  console.log(`🔄 刷新 ${domain} CDN 缓存...`)
  const params = {
    ObjectPath: `https://${domain}/`,
    ObjectType: 'Directory'
  }
  const requestOption = {method: 'POST'}
  const result = await cdnClient.request('RefreshObjectCaches', params, requestOption)
  console.log('✅ CDN 刷新完成:', result)
}

async function main() {
  const files = getAllFiles('./dist')
  console.log(`📁 共找到 ${files.length} 个文件，开始上传...`)
  await uploadFilesWithClean(files, './dist', ['dicts', 'sound', 'libs','imgs'])
  // await uploadFilesWithClean(files, './dist', ['sound','libs','imgs'])
  await refreshCDN('2study.top')
  await refreshCDN('typewords.cc')
}

main().catch(err => {
  console.error('❌ 部署失败:', err)
  process.exit(1)
})