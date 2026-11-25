<template>
  <v-row v-if="properties">
    <v-col v-for="property in properties" :key="'exif-property-' + property.key">
      <v-card :href="property.link" target="_blank">
        <div class="d-flex flex-no-wrap justify-space-between">
          <div>
            <v-card-title class="text-headline-small">
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
  import { isSet } from '@/plugins/util'

  const compProps = defineProps<{
    image?: ViewTableImages
  }>()

  interface Prop {
    key: string
    img: string
    text: string
    description?: string
    value: string
    link?: string
  }

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

      const exif = compProps.image.imageExif

      if (exif.flash) {
        f = exif.flash.toLowerCase().startsWith('flash fired')
      }

      const result: Prop[] = [{
        key: 'cameraMake',
        img: CameraIcon,
        text: t('widgetExifCameraMake'),
        value: `${exif.cameraMake} ${exif.cameraModel || ''}`,
      }, {
        key: 'lensMake',
        img: LensIcon,
        text: t('widgetExifLensMake'),
        value: `${exif.lensMake} ${exif.lensModel || ''}`,
      }, {
        key: 'focalLength',
        img: FLengthIcon,
        text: t('widgetExifFocalLength'),
        value: exif.focalLength,
      }, {
        key: 'fNumber',
        img: ApertureIcon,
        text: t('widgetExifAperture'),
        value: exif.fNumber,
      }, {
        key: 'exposureTime',
        img: ExposureIcon,
        text: t('widgetExifExposure'),
        value: exif.exposureTime,
      }, {
        key: 'isoSpeedRatings',
        img: IsoIcon,
        text: t('widgetExifIso'),
        value: exif.isoSpeedRatings,
      }, {
        key: 'flash',
        img: f ? FlashIcon : NoFlashIcon,
        text: t('widgetExifFlash'),
        value: exif.flash,
      }]

      if (isSet(exif.gpsLatitude) && isSet(exif.gpsLongitude)) {
        result.push({
          key: 'gpsLatitude',
          img: GpsIcon,
          text: t('widgetExifLocation'),
          description: t('widgetExifLocationClickToSee'),
          value: `${exif.gpsLatitude ? exif.gpsLatitude.toFixed(4) : ''}, ${exif.gpsLongitude ? exif.gpsLongitude.toFixed(4) : ''}`,
          link: (exif.gpsLatitude && exif.gpsLongitude) ? `https://geohack.toolforge.org/geohack.php?params=${exif.gpsLatitude};${exif.gpsLongitude}` : undefined,
        })
      }

      result.push({
        key: 'dateTime',
        img: DateIcon,
        text: t('widgetExifDateTime'),
        value: `${dateTime.value ? new Date(dateTime.value).toLocaleString() : ''}`,
      })

      console.log(result)

      return result.filter(p => p.value !== undefined && p.value.trim() !== 'undefined')
    } else {
      return []
    }
  })
</script>
