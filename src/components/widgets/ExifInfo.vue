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

          <v-img
            class="ma-3"
            rounded="0"
            aspect-ratio="1/1"
            width="64"
            height="64"
            inline
            :src="property.img"
          />
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
  import type { ViewTableImages } from '@/plugins/types/germinate'
  import camera from '@/assets/img/image-icon-camera.svg?url'
  import lens from '@/assets/img/image-icon-lens.svg?url'
  import fLength from '@/assets/img/image-icon-focal-length.svg?url'
  import aperture from '@/assets/img/image-icon-aperture.svg?url'
  import exposure from '@/assets/img/image-icon-exposure.svg?url'
  import iso from '@/assets/img/image-icon-iso.svg?url'
  import flash from '@/assets/img/image-icon-flash.svg?url'
  import noFlash from '@/assets/img/image-icon-flash-no.svg?url'
  import gps from '@/assets/img/image-icon-gps.svg?url'
  import date from '@/assets/img/image-icon-date.svg?url'
  import { useI18n } from 'vue-i18n'

  console.log(gps)

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
        img: camera,
        text: t('widgetExifCameraMake'),
        value: `${compProps.image.imageExif.cameraMake} ${compProps.image.imageExif.cameraModel || ''}`,
      }, {
        key: 'lensMake',
        img: lens,
        text: t('widgetExifLensMake'),
        value: `${compProps.image.imageExif.lensMake} ${compProps.image.imageExif.lensModel || ''}`,
      }, {
        key: 'focalLength',
        img: fLength,
        text: t('widgetExifFocalLength'),
        value: compProps.image.imageExif.focalLength,
      }, {
        key: 'fNumber',
        img: aperture,
        text: t('widgetExifAperture'),
        value: compProps.image.imageExif.fNumber,
      }, {
        key: 'exposureTime',
        img: exposure,
        text: t('widgetExifExposure'),
        value: compProps.image.imageExif.exposureTime,
      }, {
        key: 'isoSpeedRatings',
        img: iso,
        text: t('widgetExifIso'),
        value: compProps.image.imageExif.isoSpeedRatings,
      }, {
        key: 'flash',
        img: f ? flash : noFlash,
        text: t('widgetExifFlash'),
        value: compProps.image.imageExif.flash,
      }, {
        key: 'gpsLatitude',
        img: gps,
        text: t('widgetExifLocation'),
        description: t('widgetExifLocationClickToSee'),
        value: `${compProps.image.imageExif.gpsLatitude ? compProps.image.imageExif.gpsLatitude.toFixed(4) : ''}, ${compProps.image.imageExif.gpsLongitude ? compProps.image.imageExif.gpsLongitude.toFixed(4) : ''}`,
        link: (compProps.image.imageExif.gpsLatitude && compProps.image.imageExif.gpsLongitude) ? `https://geohack.toolforge.org/geohack.php?params=${compProps.image.imageExif.gpsLatitude};${compProps.image.imageExif.gpsLongitude}` : undefined,
      }, {
        key: 'dateTime',
        img: date,
        text: t('widgetExifDateTime'),
        value: `${dateTime.value ? new Date(dateTime.value).toLocaleString() : ''}`,
      }]
    } else {
      return []
    }
  })
</script>
