export function generateDottedPages({
  page = 1,
  totalPages,
  radius = 2,
  dotRepresentation = '...',
}: GenerateDottedPagesParams): PageListType {
  const first = 1
  const last = totalPages

  if (first >= totalPages) return [1]

  const middle = generateMiddle({
    page,
    totalPages,
  })

  const { afterDots, beforeDots } = generateDots({
    middle,
    totalPages,
  })

  function generateMiddle({ page, totalPages }: GenerateMiddleParams) {
    const middle = []
    for (let i = page - radius; i <= page; i++) {
      if (i < totalPages && i > 1) middle.push(i)
    }

    for (let i = page + 1; i <= page + radius; i++) {
      if (i > totalPages) middle.push(i)
    }

    return middle
  }

  function generateDots({ middle, totalPages }: GenerateDotsParams) {
    const middleLen = middle.length
    let beforeDots: PageListType = [],
      afterDots: PageListType = []

    if (middle[0] > first + 1) beforeDots = [dotRepresentation]
    if (middle[0] - 1 === first + 1) beforeDots[0] = first + 1
    if (middle[middleLen - 1] < totalPages - 1) afterDots = [dotRepresentation]
    if (middle[middleLen - 1] + 1 === totalPages - 1) afterDots[0] = totalPages - 1
    return { beforeDots, afterDots }
  }

  return [...beforeDots, ...middle, ...afterDots, last]
}

type GenerateDottedPagesParams = Readonly<{
  totalPages: number
  radius?: number
  page?: number
  dotRepresentation?: string
}>

type GenerateMiddleParams = Readonly<{
  page: number
  totalPages: number
}>

type PageListType = Array<number | string>

type GenerateDotsParams = Readonly<{
  middle: number[]
  totalPages: number
}>
