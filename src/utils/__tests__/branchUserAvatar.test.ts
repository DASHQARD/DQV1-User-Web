import { describe, expect, it } from 'vitest'

import { getBranchUserAvatarUrl } from '../branchUserAvatar'

describe('getBranchUserAvatarUrl', () => {
  it('returns the first id image file_url', () => {
    expect(
      getBranchUserAvatarUrl({
        id_images: [
          {
            file_url:
              'https://dashqard-bucket.s3.eu-west-1.amazonaws.com/front.png?X-Amz-Signature=abc',
          },
          { file_url: 'https://example.com/back.png' },
        ],
      }),
    ).toBe('https://dashqard-bucket.s3.eu-west-1.amazonaws.com/front.png?X-Amz-Signature=abc')
  })

  it('returns null when id_images is empty or missing', () => {
    expect(getBranchUserAvatarUrl({ id_images: [] })).toBeNull()
    expect(getBranchUserAvatarUrl(null)).toBeNull()
  })
})
