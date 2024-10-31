<template>
  <b-card>
    <div v-if="stats && stats.length > 0">
      <b-form-group label-for="searchTerm" :label="$t('formLabelSearchTerm')">
        <template #description>
          <template v-if="searchTerm">
            <span class="mr-3"><MdiIcon :path="mdiPlaylistCheck" /> <a href="#" @click.prevent="markAll(true)">{{ $t('buttonSelectAll') }}</a></span>
            <span><MdiIcon :path="mdiPlaylistRemove" /> <a href="#" @click.prevent="markAll(false)">{{ $t('buttonDeselectAll') }}</a></span>
          </template>
        </template>
        <b-form-input type="search" v-model="searchTerm" id="searchTerm" />
      </b-form-group>

      <b-row>
        <b-col :cols="4" :sm="4" :md="3" :lg="2" v-for="trait in filteredStats" :key="`trait-stats-${trait.traitId}`" >
          <Scale :isSelected="trait.isSelected" :selectable="true" :min="trait.min" :max="trait.max" :marker="trait.avg" :count="trait.count" :heading="trait.traitName" :link="{ name: 'trait-details', params: { traitId: trait.traitId } }" @selection-changed="e => onTraitSelected(trait, e)" />
        </b-col>
      </b-row>

      <template v-if="radarChartData">
        <b-form-checkbox switch v-model="useTraitFullName"> {{ $t('formCheckboxShowTraitFullName') }}</b-form-checkbox>
        <RadarChart :baseFilename="`radar-chart-${germplasmId}`" :plotData="radarChartData" v-if="radarChartData" />
      </template>
      <div ref="chart" />
    </div>
    <p v-else>{{ $t('toastNoDataFound') }}</p>
  </b-card>
</template>

<script>
import Scale from '@/components/util/Scale'
import RadarChart from '@/components/charts/RadarChart'
import MdiIcon from '@/components/icons/MdiIcon'
import { apiGetGermplasmStatsTraits } from '@/mixins/api/germplasm'
import { getPrimaryColor } from '@/mixins/colors'
import { mdiPlaylistCheck, mdiPlaylistRemove } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

export default {
  props: {
    germplasmId: {
      type: Number,
      default: null
    }
  },
  data: function () {
    return {
      mdiPlaylistCheck,
      mdiPlaylistRemove,
      stats: null,
      searchTerm: null,
      useTraitFullName: false
    }
  },
  watch: {
    germplasmId: function () {
      this.update()
    }
  },
  computed: {
    filteredStats: function () {
      if (this.searchTerm) {
        const lower = this.searchTerm.toLowerCase()
        return this.stats.filter(s => s.traitName.toLowerCase().includes(lower))
      } else {
        return this.stats
      }
    },
    radarChartData: function () {
      if (this.stats && this.stats.length > 0) {
        const traitData = this.stats.filter(s => s.isSelected)

        if (traitData.length < 1) {
          return null
        }

        const result = {
          databaseId: this.germplasmId,
          displayName: traitData[0].germplasmName,
          dims: [],
          values: [],
          customdata: [],
          color: getPrimaryColor()
        }

        traitData.forEach(s => {
          const v = (s.avg - s.min) / (s.max - s.min) * 100

          result.customdata.push(s.avg)
          result.dims.push(this.useTraitFullName ? s.traitName : (s.traitNameShort || s.traitName))
          result.values.push(v)
        })

        if (result.customdata.length > 0) {
          result.customdata.push(result.customdata[0])
        }
        if (result.dims.length > 0) {
          result.dims.push(result.dims[0])
        }
        if (result.values.length > 0) {
          result.values.push(result.values[0])
        }

        return [result]
      } else {
        return null
      }
    }
  },
  components: {
    RadarChart,
    Scale,
    MdiIcon
  },
  methods: {
    markAll: function (toSelect) {
      const ids = this.filteredStats.map(fs => fs.traitId)

      this.stats.forEach(s => {
        if (ids.includes(s.traitId)) {
          s.isSelected = toSelect
        }
      })
    },
    onTraitSelected: function (trait, toSelect) {
      trait.isSelected = toSelect
    },
    update: function () {
      apiGetGermplasmStatsTraits(this.germplasmId, result => {
        if (result && result.length > 0) {
          result.forEach(r => { r.isSelected = false })
        }

        this.stats = result

        if (result) {
          this.$emit('has-data', result.length)
        } else {
          this.$emit('has-data', 0)
        }
      })
    }
  },
  mounted: function () {
    emitter.on('license-accepted', this.update)

    if (this.germplasmId) {
      this.update()
    }
  },
  beforeDestroy: function () {
    emitter.off('license-accepted', this.update)
  }
}
</script>

<style>

</style>
