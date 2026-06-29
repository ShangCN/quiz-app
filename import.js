/**
 * import.js —— CSV 转 JSON 脚本
 *
 * 用法：
 *   1. 在根目录放入 *.csv 文件（如 politics.csv、english.csv）
 *   2. npm install csv-parser
 *   3. node import.js
 *
 * CSV 列结构：type, stem, options, answer, explanation, tag
 *   - options：用 | 分隔
 *   - 输出：/public/questions/{subject}.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import csv from 'csv-parser'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function cleanAnswer(text) {
  if (!text) return ''
  // 去除所有标点符号（中英文）、空格和换行，仅保留文字和数字
  return text
    .replace(/[\s\n\r]+/g, '')
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '')
}

function processCsvFile(csvPath) {
  return new Promise((resolve, reject) => {
    const results = []
    fs.createReadStream(csvPath, { encoding: 'utf-8' })
      .pipe(csv())
      .on('data', (row) => {
        const question = {
          type: (row.type || '').trim(),
          stem: (row.stem || '').trim(),
          options: (row.options || '')
            .split('|')
            .map((o) => o.trim())
            .filter(Boolean),
          answer: (row.answer || '').trim(),
          explanation: (row.explanation || '').trim(),
          tag: (row.tag || '').trim(),
        }

        // 简答题额外生成 cleanAnswer
        if (question.type === '简答题') {
          question.cleanAnswer = cleanAnswer(question.answer)
        }

        results.push(question)
      })
      .on('end', () => resolve(results))
      .on('error', reject)
  })
}

async function main() {
  const files = fs.readdirSync(__dirname).filter((f) => f.endsWith('.csv'))
  if (files.length === 0) {
    console.log('❌ 未找到 CSV 文件，请在项目根目录放入 *.csv 文件。')
    process.exit(1)
  }

  const outputDir = path.join(__dirname, 'public', 'questions')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  for (const file of files) {
    const subject = path.basename(file, '.csv')
    const csvPath = path.join(__dirname, file)
    console.log(`📄 正在处理：${file} ...`)
    try {
      const data = await processCsvFile(csvPath)
      const outPath = path.join(outputDir, `${subject}.json`)
      fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8')
      console.log(`   ✅ 已生成 public/questions/${subject}.json（${data.length} 题）`)
    } catch (err) {
      console.error(`   ❌ 处理 ${file} 失败：`, err.message)
    }
  }

  console.log('\n🎉 全部完成！')
}

main()
