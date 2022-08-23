<template>
  <b-modal ref="imageExifModal"
           ok-only
           :ok-title="$t('buttonClose')"
           size="xl"
           :title="$t('modalTitleImageExif')">
    <b-row>
      <b-col cols=12 sm=6 md=4 lg=3 class="mb-3" v-for="property in availableProperties" :key="`exif-prop-${property.key}`">
        <b-card no-body class="h-100" bg-variant="light">
          <b-card-img class="p-3 exif-icon" :src="property.img" v-if="property.img" />
          <b-card-body class="bg-dark text-white d-flex flex-column justify-content-between">
            <div class="mb-3">
              <b-card-title class="mb-0">{{ property.text() }}</b-card-title>
              <b-card-text class="text-muted" v-if="property.description"><small>{{ property.description() }}</small></b-card-text>
            </div>
            <b-card-sub-title>{{ property.value }}</b-card-sub-title>
            <a href="#" class="stretched-link" @click.prevent="property.action" v-if="property.action" />
          </b-card-body>
        </b-card>
      </b-col>
    </b-row>
    <div v-if="hasLocation">
      <LocationMap ref="imageMap" :locations="[{ locationLatitude: image.imageExif.gpsLatitude, locationLongitude: image.imageExif.gpsLongitude, locationElevation: image.imageExif.gpsAltitude }]" v-if="showMap" :showLinks="false"/>
    </div>
  </b-modal>
</template>

<script>
import LocationMap from '@/components/map/LocationMap'

export default {
  components: {
    LocationMap
  },
  props: {
    image: {
      type: Object,
      default: () => null
    }
  },
  data: function () {
    return {
      showMap: false
    }
  },
  computed: {
    properties: function () {
      if (this.image) {
        let flash = null
        if (this.image.imageExif.flash) {
          flash = this.image.imageExif.flash.toLowerCase().startsWith('flash fired')
        }
        return [{
          key: 'cameraMake',
          img: require('@/assets/img/image-icon-camera.svg'),
          text: () => this.$t('widgetExifCameraMake'),
          value: `${this.image.imageExif.cameraMake} ${this.image.imageExif.cameraModel || ''}`
        }, {
          key: 'lensMake',
          img: require('@/assets/img/image-icon-lens.svg'),
          text: () => this.$t('widgetExifLensMake'),
          value: `${this.image.imageExif.lensMake} ${this.image.imageExif.lensModel || ''}`
        }, {
          key: 'focalLength',
          img: require('@/assets/img/image-icon-focal-length.svg'),
          text: () => this.$t('widgetExifFocalLength'),
          value: this.image.imageExif.focalLength
        }, {
          key: 'fNumber',
          img: require('@/assets/img/image-icon-aperture.svg'),
          text: () => this.$t('widgetExifAperture'),
          value: this.image.imageExif.fNumber
        }, {
          key: 'exposureTime',
          img: require('@/assets/img/image-icon-exposure.svg'),
          text: () => this.$t('widgetExifExposure'),
          value: this.image.imageExif.exposureTime
        }, {
          key: 'isoSpeedRatings',
          img: require('@/assets/img/image-icon-iso.svg'),
          text: () => this.$t('widgetExifIso'),
          value: this.image.imageExif.isoSpeedRatings
        }, {
          key: 'flash',
          img: flash ? require('@/assets/img/image-icon-flash.svg') : require('@/assets/img/image-icon-flash-no.svg'),
          text: () => this.$t('widgetExifFlash'),
          value: this.image.imageExif.flash
        }, {
          key: 'gpsLatitude',
          img: require('@/assets/img/image-icon-gps.svg'),
          text: () => this.$t('widgetExifLocation'),
          description: () => this.$t('widgetExifLocationClickToSee'),
          value: `${this.image.imageExif.gpsLatitude ? this.image.imageExif.gpsLatitude.toFixed(4) : ''}, ${this.image.imageExif.gpsLongitude ? this.image.imageExif.gpsLongitude.toFixed(4) : ''}`,
          action: () => this.toggleMap()
        }]
      } else {
        return []
      }
    },
    availableProperties: function () {
      if (this.image && this.image.imageExif) {
        return this.properties.filter(p => this.image.imageExif[p.key])
      } else {
        return []
      }
    },
    hasLocation: function () {
      return this.image && this.image.imageExif && this.image.imageExif.gpsLatitude !== undefined && this.image.imageExif.gpsLatitude !== null && this.image.imageExif.gpsLongitude !== undefined && this.image.imageExif.gpsLongitude
    }
  },
  methods: {
    show: function () {
      this.showMap = false
      this.$refs.imageExifModal.show()
    },
    toggleMap: function () {
      this.showMap = !this.showMap
    }
  }
}
</script>

<style scoped>
.exif-icon {
  max-height: 100px;
}
</style>
