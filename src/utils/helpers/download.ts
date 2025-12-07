import type { generateCsvParams } from '@/types'

export function generateAndDownloadCsv(options: generateCsvParams) {
  const file = generateCsv(options)
  downloadFile(file, options.fileName)
}

export function generateCsv(options: generateCsvParams) {
  const { headers, data, separator = ',' } = options
  const rows = []

  // add headers first
  rows.push(headers.map((h) => h.name).join(separator))

  // append rows
  data.forEach((row) => {
    rows.push(
      headers
        .map((h) => {
          const transform = h.transform ?? String
          return `"${transform(h.accessor ? getTarget(row, h.accessor) : row)}"`
        })
        .join(separator),
    )
  })

  const csvContent = rows.join('\n')
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8,' })
}

export function downloadFile(file: Blob | File, fileName: string = 'csv-file') {
  // create link element
  const linkElement = document.createElement('a')
  const href = URL.createObjectURL(file)

  linkElement.href = href
  linkElement.setAttribute('download', fileName.includes('.csv') ? fileName : `${fileName}.csv`)
  linkElement.setAttribute('target', '_blank')
  linkElement.click()

  URL.revokeObjectURL(href)
}

function getTarget(inputObj: Record<string, any>, path: string | string[]): any {
  const pathArr = Array.isArray(path) ? path : path?.split('.')
  return pathArr.reduce((target, currentPath) => target?.[currentPath], inputObj)
}
