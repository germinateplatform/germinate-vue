<template>
  <LocationMap :locations="locations" ref="map" />
</template>

<script>
import { apiPostDatasetExport } from '@/mixins/api/dataset'

const d3Dsv = require('d3-dsv')
const emitter = require('tiny-emitter/instance')

export default {
  components: {
    LocationMap: () => import('@/components/map/LocationMap')
  },
  props: {
    datasetIds: {
      type: Array,
      default: () => []
    },
    shown: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      locations: null
    }
  },
  watch: {
    shown: function () {
      if (!this.locations) {
        this.update()
      }
    }
  },
  methods: {
    update: function () {
      if (!this.datasetIds && this.datasetIds.length < 1) {
        return
      }

      const query = {
        xGroupIds: null,
        xIds: null,
        yGroupIds: null,
        yIds: null,
        datasetIds: this.datasetIds
      }

      emitter.emit('show-loading', true)
      apiPostDatasetExport('trial', query, result => {
        const reader = new FileReader()
        reader.onload = () => {
          // Remove the first row (Flapjack header)
          const dirtyTsv = reader.result
          const firstEOL = dirtyTsv.indexOf('\r\n')
          const data = d3Dsv.tsvParse(dirtyTsv.substring(firstEOL + 2), d3Dsv.autoType)

          const locs = data.map(d => {
            const res = {
              locationName: d.name,
              locationLatitude: d.latitude,
              locationLongitude: d.longitude
            }
            Object.freeze(res)
            return res
          })

          Object.freeze(locs)
          this.locations = locs
        }
        reader.readAsText(result)

        emitter.emit('show-loading', false)
      }, {
        codes: [404],
        callback: () => {
          // Do nothing here, it just means there is no data.
          emitter.emit('show-loading', false)
        }
      })
    },
    invalidateSize: function () {
      this.$nextTick(() => this.$refs.map.invalidateSize())
    }
  },
  mounted: function () {
    if (this.shown) {
      this.update()
    }
  }
}
</script>

<style>

</style>
