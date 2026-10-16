const DEFAULT_OPTIONS = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.8,
  maxBytes: 200 * 1024,
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read image.'))
    }
    image.src = url
  })
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Could not compress image.'))
      },
      type,
      quality
    )
  })
}

function getOutputType(file) {
  if (file.type === 'image/png' || file.type === 'image/webp') {
    return 'image/webp'
  }
  return 'image/jpeg'
}

function extensionForType(type) {
  if (type === 'image/webp') return 'webp'
  if (type === 'image/png') return 'png'
  return 'jpg'
}

/**
 * Resize and compress an image File for upload.
 * Skips work when the file is already small enough and within max dimensions.
 */
export async function compressImage(file, options = {}) {
  if (!(file instanceof File) || !file.type.startsWith('image/')) {
    return file
  }

  const { maxWidth, maxHeight, quality, maxBytes } = {
    ...DEFAULT_OPTIONS,
    ...options,
  }

  const image = await loadImage(file)
  const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height)
  const width = Math.max(1, Math.round(image.width * scale))
  const height = Math.max(1, Math.round(image.height * scale))

  if (scale === 1 && file.size <= maxBytes) {
    return file
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) return file

  context.drawImage(image, 0, 0, width, height)

  const outputType = getOutputType(file)
  let blob
  try {
    blob = await canvasToBlob(canvas, outputType, quality)
  } catch {
    blob = await canvasToBlob(canvas, 'image/jpeg', quality)
  }

  // If compression made it larger, keep the resized jpeg/webp only when smaller
  if (blob.size >= file.size && scale === 1) {
    return file
  }

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'logo'
  const type = blob.type || outputType
  return new File([blob], `${baseName}.${extensionForType(type)}`, {
    type,
    lastModified: Date.now(),
  })
}
