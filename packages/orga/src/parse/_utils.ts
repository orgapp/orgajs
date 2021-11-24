const COMMON_IMAGE_EXTENSIONS = [
  'apng',
  'avif',
  'gif',
  'jpeg',
  'jpg',
  'jfif',
  'pjpeg',
  'pjp',
  'png',
  'svg',
  'webp',
  'bmp',
  'ico',
  'cur',
  'tif',
  'tiff',
]

export const isImage = (path: string) => {
  const ext = path.toLowerCase().split('.').pop()
  return COMMON_IMAGE_EXTENSIONS.includes(ext)
}
