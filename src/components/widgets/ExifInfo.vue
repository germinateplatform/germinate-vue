<template>
  <v-row v-if="properties">
    <v-col v-for="property in properties" :key="'exif-property-' + property.key">
      <v-card :href="property.link" target="_blank">
        <div class="d-flex flex-no-wrap justify-space-between">
          <div>
            <v-card-title class="text-h5">
              {{ property.text }}
            </v-card-title>

            <v-card-subtitle>{{ property.value }}</v-card-subtitle>
          </div>

          <component :is="property.img" width="64" height="64" class="g-svg ma-2" />
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
  import type { ViewTableImages } from '@/plugins/types/germinate'
  import CameraIcon from '@/assets/img/image-icon-camera.svg'
  import LensIcon from '@/assets/img/image-icon-lens.svg'
  import FLengthIcon from '@/assets/img/image-icon-focal-length.svg'
  import ApertureIcon from '@/assets/img/image-icon-aperture.svg'
  import ExposureIcon from '@/assets/img/image-icon-exposure.svg'
  import IsoIcon from '@/assets/img/image-icon-iso.svg'
  import FlashIcon from '@/assets/img/image-icon-flash.svg'
  import NoFlashIcon from '@/assets/img/image-icon-flash-no.svg'
  import GpsIcon from '@/assets/img/image-icon-gps.svg'
  import DateIcon from '@/assets/img/image-icon-date.svg'
  import { useI18n } from 'vue-i18n'

  const compProps = defineProps<{
    image?: ViewTableImages
  }>()

  const { t } = useI18n()

  const dateTime = computed(() => {
    if (compProps.image) {
      if (compProps.image.imageExif.dateTime) {
        return compProps.image.imageExif.dateTime
      } else if (compProps.image.imageExif.dateTimeOriginal) {
        return compProps.image.imageExif.dateTimeOriginal
      } else if (compProps.image.createdOn) {
        return compProps.image.createdOn
      } else {
        return undefined
      }
    } else {
      return undefined
    }
  })

  const properties = computed(() => {
    if (compProps.image) {
      let f = undefined
      if (compProps.image.imageExif.flash) {
        f = compProps.image.imageExif.flash.toLowerCase().startsWith('flash fired')
      }

      return [{
        key: 'cameraMake',
        img: CameraIcon,
        text: t('widgetExifCameraMake'),
        value: `${compProps.image.imageExif.cameraMake} ${compProps.image.imageExif.cameraModel || ''}`,
      }, {
        key: 'lensMake',
        img: LensIcon,
        text: t('widgetExifLensMake'),
        value: `${compProps.image.imageExif.lensMake} ${compProps.image.imageExif.lensModel || ''}`,
      }, {
        key: 'focalLength',
        img: FLengthIcon,
        text: t('widgetExifFocalLength'),
        value: compProps.image.imageExif.focalLength,
      }, {
        key: 'fNumber',
        img: ApertureIcon,
        text: t('widgetExifAperture'),
        value: compProps.image.imageExif.fNumber,
      }, {
        key: 'exposureTime',
        img: ExposureIcon,
        text: t('widgetExifExposure'),
        value: compProps.image.imageExif.exposureTime,
      }, {
        key: 'isoSpeedRatings',
        img: IsoIcon,
        text: t('widgetExifIso'),
        value: compProps.image.imageExif.isoSpeedRatings,
      }, {
        key: 'flash',
        img: f ? FlashIcon : NoFlashIcon,
        text: t('widgetExifFlash'),
        value: compProps.image.imageExif.flash,
      }, {
        key: 'gpsLatitude',
        img: GpsIcon,
        text: t('widgetExifLocation'),
        description: t('widgetExifLocationClickToSee'),
        value: `${compProps.image.imageExif.gpsLatitude ? compProps.image.imageExif.gpsLatitude.toFixed(4) : ''}, ${compProps.image.imageExif.gpsLongitude ? compProps.image.imageExif.gpsLongitude.toFixed(4) : ''}`,
        link: (compProps.image.imageExif.gpsLatitude && compProps.image.imageExif.gpsLongitude) ? `https://geohack.toolforge.org/geohack.php?params=${compProps.image.imageExif.gpsLatitude};${compProps.image.imageExif.gpsLongitude}` : undefined,
      }, {
        key: 'dateTime',
        img: DateIcon,
        text: t('widgetExifDateTime'),
        value: `${dateTime.value ? new Date(dateTime.value).toLocaleString() : ''}`,
      }]
    } else {
      return []
    }
  })
</script>
