declare var $:any

export function compressImage(file: File, mode: 'center' | 'auto' = 'center'): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.src = URL.createObjectURL(file)
    image.onload = () => {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      let sx = 0
      let sy = 0
      let sWidth = image.width
      let sHeight = image.height
      let dWidth = 500
      let dHeight = 500

      if (mode === 'auto') {
        if (image.width > image.height) {
          dHeight = (image.height / image.width) * dWidth
        } else {
          dWidth = (image.width / image.height) * dHeight
        }
      } else if (mode === 'center') {
        let side = Math.min(image.width, image.height)
        sx = (image.width - side) / 2
        sy = (image.height - side) / 2
        sWidth = side
        sHeight = side
      }

      canvas.width = dWidth
      canvas.height = dHeight
      context?.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, dWidth, dHeight)

      let quality = 0.9
      let compressedDataUrl = canvas.toDataURL()
      while (quality > 0 && (compressedDataUrl.length / 1024) > 100) {
        compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        quality -= 0.1
      }
      resolve(compressedDataUrl)
    }
    image.onerror = reject
  })
}


export function compressImageToFile(file: File, mode: 'center' | 'auto' = 'center'): Promise<[File,string]> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.src = URL.createObjectURL(file)
    image.onload = () => {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      let sx = 0
      let sy = 0
      let sWidth = image.width
      let sHeight = image.height
      let dWidth = 500
      let dHeight = 500

      if (mode === 'auto') {
        if (image.width > image.height) {
          dHeight = (image.height / image.width) * dWidth
        } else {
          dWidth = (image.width / image.height) * dHeight
        }
      } else if (mode === 'center') {
        let side = Math.min(image.width, image.height)
        sx = (image.width - side) / 2
        sy = (image.height - side) / 2
        sWidth = side
        sHeight = side
      }

      canvas.width = dWidth
      canvas.height = dHeight
      context?.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, dWidth, dHeight)

      let quality = 0.9
      let compressedDataUrl = canvas.toDataURL()
      while (quality > 0 && (compressedDataUrl.length / 1024) > 100) {
        compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        quality -= 0.1
      }

      const byteString = atob(compressedDataUrl.split(',')[1])
      const mimeString = compressedDataUrl.split(',')[0].split(':')[1].split(';')[0]
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i)
      }
      const blob = new Blob([ab], {type: mimeString})
      const compressedFile = new File([blob], file.name, {type: mimeString})
      resolve([compressedFile, compressedDataUrl])
    }
    image.onerror = reject
  })
}




export function resizeImage(frameSelector: string, imageSelector: string, maxWidth: number) {
  const updateSize = () => {
    const widthMax = $(frameSelector).width()
    const border = parseInt($(frameSelector).css("border-width")) * 2
    if (window.matchMedia(`(max-width: ${maxWidth}px)`).matches) {
      $(frameSelector).css("height", widthMax + border)
      $(imageSelector).css("max-height", widthMax)
    } else {
      $(frameSelector).css("height", "auto")
      $(imageSelector).css("max-height", $(frameSelector).height())
    }
  }
  const frameElement: Element = document.querySelector(frameSelector)!
  new ResizeObserver(updateSize).observe(frameElement)
}
