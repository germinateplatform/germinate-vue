<template>
  <b-modal ref="screenshotModal" size="xl" @shown="onShown" @hide="onHide" @ok.prevent="onCropImage" :cancel-title="$t('buttonCancel')" :ok-title="$t('buttonOk')" no-close-on-backdrop no-close-on-esc>
    <div class="img-container">
      <b-img fluid-grow :src="imageData" ref="image" />
    </div>
  </b-modal>
</template>

<script>
import html2canvas from 'html2canvas'

import 'cropperjs/dist/cropper.css'
import Cropper from 'cropperjs'
import Compressor from 'compressorjs'

import { dataURLtoFile } from '@/mixins/util'

const emitter = require('tiny-emitter/instance')

let crop = null

export default {
  data: function () {
    return {
      imageData: null
    }
  },
  props: {
    targetElement: {
      type: Object,
      default: null
    }
  },
  methods: {
    onCropImage: function () {
      if (crop) {
        const data = crop.getCroppedCanvas().toDataURL('image/png')
        const file = dataURLtoFile(data)

        /* eslint-disable no-new */
        new Compressor(file, {
          convertSize: 100000,
          quality: 0.80,
          maxWidth: 1280,
          maxHeight: 1280,
          // The compression process is asynchronous,
          // which means you have to access the `result` in the `success` hook function.
          success: scaled => {
            const reader = new FileReader()
            reader.onloadend = () => {
              this.imageData = reader.result

              if (crop) {
                crop.destroy()
                crop = null
              }

              this.$emit('screenshot-taken', this.imageData)

              this.$refs.screenshotModal.hide()
            }
            reader.readAsDataURL(scaled)
          }
        })
      }
    },
    onShown: function () {
      crop = new Cropper(this.$refs.image, {
        modal: true,
        zoomable: false,
        viewMode: 2,
        ready: () => {
          const imageData = crop.getImageData()
          // Make sure the crop position is at the top
          crop.setData({
            x: imageData.naturalWidth * 0.05,
            y: imageData.naturalWidth * 0.05,
            width: imageData.naturalWidth * 0.9,
            height: imageData.naturalWidth * 0.9 * 3 / 4
          })
        }
      })
    },
    onHide: function () {
      if (crop) {
        crop.destroy()
        crop = null
      }
    },
    takeScreenshot: function () {
      emitter.emit('show-loading', true)
      window.scrollTo(0, 0)
      // html2canvas(document.querySelector('#content > .container-fluid'), {
      html2canvas(document.body, {
        foreignObjectRendering: false,
        allowTaint: true,
        useCORS: true
      }).then(canvas => {
        this.imageData = canvas.toDataURL('image/png')
        this.imageCropped = false

        this.$refs.screenshotModal.show()
      }).finally(() => {
        emitter.emit('show-loading', false)
      })
    }
  }
}
</script>

<style scoped>
.img-container {
  max-width: 100%;
}
</style>
