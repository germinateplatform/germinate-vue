<template>
  <div>
    <div v-if="germplasm">
      <b-navbar sticky class="scrollspy-sticky" type="dark" variant="primary" v-b-scrollspy="scrollSpyConfig" ref="scrollSpy">
        <b-navbar-nav>
          <b-nav-item href="#mcpd" @click="scrollIntoView">{{ $t('pagePassportMcpdTitle') }}</b-nav-item>
          <b-nav-item href="#institution" @click="scrollIntoView">{{ $t('pagePassportInstitutionTitle') }}</b-nav-item>
          <b-nav-item href="#pedigree" @click="scrollIntoView">{{ $t('pagePassportPedigreeTitle') }}</b-nav-item>
          <b-nav-item href="#entity" @click="scrollIntoView">{{ $t('pagePassportEntityTitle') }}</b-nav-item>
          <b-nav-item href="#location" @click="scrollIntoView" v-if="germplasm.declatitude && germplasm.declongitude">{{ $t('pagePassportLocationTitle') }}</b-nav-item>
          <b-nav-item href="#images" @click="scrollIntoView">{{ $t('pagePassportImageTitle') }}</b-nav-item>
          <b-nav-item href="#groups" @click="scrollIntoView">{{ $t('pagePassportGroupTitle') }}</b-nav-item>
          <b-nav-item href="#datasets" @click="scrollIntoView">{{ $t('pagePassportDatasetTitle') }}</b-nav-item>
          <b-nav-item href="#attributes" @click="scrollIntoView">{{ $t('pagePassportAttributeTitle') }}</b-nav-item>
        </b-navbar-nav>
      </b-navbar>
      <div id="nav-scroller">
        <h1 class="mt-3">{{ $t('pagePassportTitle') }}</h1>

        <hr />
        <h2 class="mdi-heading" id="mcpd">
          <i :class="'mdi mdi-36px text-primary passport-checkbox ' + getMarkedStyle()" @click="onToggleMarked()" v-b-tooltip.hover title="Click to mark/unmark Germplasm"/>
          <span> {{ getTitle() }}</span>
          <small v-if="germplasm.entitytype">{{ germplasm.entitytype }}</small>
        </h2>
        <p v-html="$t('pagePassportText')" />

        <template v-if="germplasmTableData && germplasmTableData.pdci">
          <hr />
          <h2 class="mdi-heading"><i class="mdi mdi-36px mdi-chart-donut text-primary" /> <span> {{ $t('pagePassportPdciTitle') }} </span><small><a href="#" @click.prevent="showPdciModal"><i class="mdi mdi-18px mdi-help-circle"/></a></small></h2>
          <p><strong>{{ $t('pagePassportPdciText', { pdci: germplasmTableData.pdci.toFixed(2) }) }}</strong></p>
        </template>

        <hr />
        <b-row>
          <b-col cols=12 lg=6>
            <Mcpd :germplasm="germplasm"/>
          </b-col>
          <b-col cols=12 lg=6>
            <Institution :institutionId="germplasmTableData.institutionId" id="institution"/>
          </b-col>
        </b-row>

        <hr />
        <h2 class="mdi-heading" id="pedigree"><i class="mdi mdi-36px mdi-sitemap text-primary" /> <span> {{ $t('pagePassportPedigreeTitle') }}</span></h2>
        <p v-html="$t('pagePassportPedigreeText')" />
        <PedigreeTable :getData="getPedigreeData" :filterOn="pedigreeFilter" />

        <PedigreeChart :germplasmId="germplasmId" />

        <hr />
        <h2 class="mdi-heading" id="entity"><i class="mdi mdi-36px mdi-file-tree text-primary" /> <span> {{ $t('pagePassportEntityTitle') }}</span></h2>
        <p v-html="$t('pagePassportEntityText')" />
        <ul class="no-bullet-list">
          <li><i class="mdi mdi-18px fix-alignment mdi-circle-medium" />{{ entityTypes['Accession'].text() }}</li>
          <ul>
            <li><i class="mdi mdi-18px fix-alignment mdi-subdirectory-arrow-right" />{{ entityTypes['Plant/Plot'].text() }}</li>
            <ul>
              <li><i class="mdi mdi-18px fix-alignment mdi-subdirectory-arrow-right" />{{ entityTypes['Sample'].text() }}</li>
            </ul>
          </ul>
        </ul>
        <EntityTable :getData="getEntityData" :filterOn="entityFilter" />

        <template v-if="germplasm.declatitude && germplasm.declongitude">
          <hr />
          <h2 class="mdi-heading" id="location"><i class="mdi mdi-36px mdi-map-marker text-primary" /> <span> {{ $t('pagePassportLocationTitle') }}</span></h2>
          <p v-html="$t('pagePassportLocationText')" />
          <LocationMap :locations="[getLocation()]" ref="map"/>
        </template>

        <hr />
        <h2 class="mdi-heading" id="images"><i class="mdi mdi-36px text-primary mdi-image-multiple"/><span> {{ $t('pagePassportImageTitle') }}</span></h2>
        <p v-html="$t('pagePassportImageText')" />
        <ImageGallery :getImages="getImages" />

        <hr />
        <h2 class="mdi-heading" id="groups"><i class="mdi mdi-36px text-primary mdi-group"/><span> {{ $t('pagePassportGroupTitle') }}</span></h2>
        <p v-html="$t('pagePassportGroupText')" />
        <GroupTable :getData="getGroupData" />

        <hr />
        <h2 class="mdi-heading" id="datasets"><i class="mdi mdi-36px text-primary mdi-database"/><span> {{ $t('pagePassportDatasetTitle') }}</span></h2>
        <p v-html="$t('pagePassportDatasetText')" />
        <DatasetTable :getData="getDatasetData" />

        <hr />
        <h2 class="mdi-heading" id="attributes"><i class="mdi mdi-36px text-primary mdi-playlist-plus"/><span> {{ $t('pagePassportAttributeTitle') }}</span></h2>
        <p v-html="$t('pagePassportAttributeText')" />
        <GermplasmAttributeTable :getData="getGermplasmAttributeData" />
      </div>
    </div>
    <div class="text-center" v-else>
      <b-spinner style="width: 3rem; height: 3rem;" variant="primary" type="grow" />
    </div>
  </div>
</template>

<script>
import DatasetTable from '@/components/tables/DatasetTable'
import EntityTable from '@/components/tables/EntityTable'
import GermplasmAttributeTable from '@/components/tables/GermplasmAttributeTable'
import GroupTable from '@/components/tables/GroupTable'
import Institution from '@/components/institution/Institution'
import Mcpd from '@/components/germplasm/Mcpd'
import LocationMap from '@/components/map/LocationMap'
import ImageGallery from '@/components/images/ImageGallery'
import PedigreeChart from '@/components/charts/PedigreeChart'
import PedigreeTable from '@/components/tables/PedigreeTable'

export default {
  data: function () {
    return {
      germplasm: null,
      germplasmTableData: null,
      pedigreeFilter: null,
      entityFilter: null,
      currentGermplasmId: null,
      scrollSpyConfig: {
        offset: 112,
        throttle: 100
      }
    }
  },
  props: {
    germplasmId: {
      type: Number,
      default: null
    }
  },
  components: {
    DatasetTable,
    EntityTable,
    GermplasmAttributeTable,
    GroupTable,
    ImageGallery,
    Institution,
    LocationMap,
    Mcpd,
    PedigreeChart,
    PedigreeTable
  },
  methods: {
    scrollIntoView: function (evt) {
      evt.preventDefault()
      const href = evt.target.getAttribute('href')
      const el = href ? document.querySelector(href) : null
      if (el) {
        console.log(el)
        el.scrollIntoView(true)
        window.scrollBy(0, -65 - this.$refs.scrollSpy.offsetHeight)
      }
    },
    showPdciModal: function () {
      // TODO
      console.log('SHOW PDCI')
    },
    getGermplasmAttributeData: function (data, callback) {
      return this.apiPostGermplasmAttributeTable(this.currentGermplasmId, data, callback)
    },
    getDatasetData: function (data, callback) {
      return this.apiPostGermplasmDatasetTable(this.currentGermplasmId, data, callback)
    },
    getGroupData: function (data, callback) {
      return this.apiPostGermplasmGroupTable(this.currentGermplasmId, data, callback)
    },
    getEntityData: function (data, callback) {
      return this.apiPostEntityTable(data, callback)
    },
    getPedigreeData: function (data, callback) {
      return this.apiPostPedigreeTable(data, callback)
    },
    getImages: function (data, onSuccess, onError) {
      data.filter = [{
        column: 'imageForeignId',
        comparator: 'equals',
        operator: 'and',
        values: [this.currentGermplasmId]
      }, {
        column: 'imageRefTable',
        comparator: 'equals',
        operator: 'and',
        values: ['germinatebase']
      }]
      this.apiPostImages(data, onSuccess, onError)
    },
    getLocation: function () {
      return {
        locationId: -1,
        locationLatitude: this.germplasm.declatitude,
        locationLongitude: this.germplasm.declongitude,
        locationName: this.germplasm.collsite,
        locationType: 'collectingsites',
        countryName: null,
        countryCode2: null,
        countryCode3: this.germplasm.origcty
      }
    },
    getTitle: function () {
      var parts = []
      parts.push(this.germplasm.accenumb)
      parts.push(this.germplasm.accename)

      return parts.filter(p => p !== null).join(' / ')
    },
    getMarkedStyle: function () {
      const isMarked = this.markedIds.germplasm.indexOf(this.currentGermplasmId) !== -1
      return isMarked ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline'
    },
    onToggleMarked: function () {
      const isMarked = this.markedIds.germplasm.indexOf(this.currentGermplasmId) !== -1
      if (isMarked) {
        this.$store.dispatch('ON_MARKED_IDS_REMOVE', { type: 'germplasm', ids: [this.currentGermplasmId] })
      } else {
        this.$store.dispatch('ON_MARKED_IDS_ADD', { type: 'germplasm', ids: [this.currentGermplasmId] })
      }
    },
    invalidateSize: function () {
      if (this.$refs.map) {
        this.$nextTick(() => this.$refs.map.invalidateSize())
      }
    }
  },
  created: function () {
    var urlParam = this.$route.params.germplasmId

    if (this.germplasmId) {
      this.currentGermplasmId = this.germplasmId
    } else if (urlParam) {
      this.currentGermplasmId = parseInt(urlParam)
    }

    this.pedigreeFilter = [{
      column: {
        name: 'parentId',
        type: Number
      },
      comparator: 'equals',
      operator: 'or',
      values: [this.currentGermplasmId],
      canBeChanged: false
    }, {
      column: {
        name: 'childId',
        type: Number
      },
      comparator: 'equals',
      operator: 'or',
      values: [this.currentGermplasmId],
      canBeChanged: false
    }]

    this.entityFilter = [{
      column: {
        name: 'entityParentId',
        type: Number
      },
      comparator: 'equals',
      operator: 'or',
      values: [this.currentGermplasmId],
      canBeChanged: false
    }, {
      column: {
        name: 'entityChildId',
        type: Number
      },
      comparator: 'equals',
      operator: 'or',
      values: [this.currentGermplasmId],
      canBeChanged: false
    }]
  },
  mounted: function () {
    this.apiGetGermplasmMcpd(this.currentGermplasmId, result => {
      this.germplasm = result
    })

    var request = {
      page: 1,
      limit: 1,
      filter: [{
        column: 'germplasmId',
        comparator: 'equals',
        operator: 'and',
        values: [this.currentGermplasmId]
      }]
    }
    this.apiPostGermplasmTable(request, result => {
      if (result && result.data && result.data.length > 0) {
        this.germplasmTableData = result.data[0]
      }
    })

    this.$store.dispatch('ON_HELP_KEY_CHANGED', 'helpPassport')
  }
}
</script>

<style scoped>
.passport-checkbox:hover {
  cursor: pointer;
}
.no-bullet-list {
  padding-inline-start: 0;
}
.no-bullet-list,
.no-bullet-list ul {
  list-style-type: none;
}
.scrollspy-sticky {
  position: -webkit-sticky;
  position: sticky;
  top: 55px;
  align-self: flex-start;
  z-index: 9999;
}
.scrollspy-sticky > .navbar-nav {
  flex-wrap: wrap;
}
</style>
