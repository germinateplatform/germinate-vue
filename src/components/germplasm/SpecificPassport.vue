<template>
  <div>
    <div v-if="germplasm">
      <!-- Scrollspy navigation bar -->
      <b-navbar sticky class="scrollspy-sticky d-none d-sm-block passport-navbar" type="dark" variant="dark" v-b-scrollspy="scrollSpyConfig" ref="scrollSpy" v-if="!isPopup">
        <b-navbar-nav class="align-items-center">
          <b-nav-item href="#mcpd" @click="scrollIntoView">{{ $t('pagePassportMcpdTitle') }}</b-nav-item>
          <b-nav-item href="#institution" @click="scrollIntoView">{{ $t('pagePassportInstitutionTitle') }}</b-nav-item>
          <b-nav-item href="#publications" @click="scrollIntoView">{{ $t('pagePassportPublicationsTitle') }}</b-nav-item>
          <b-nav-item href="#links" @click="scrollIntoView">{{ $t('pagePassportLinksTitle') }}</b-nav-item>
          <b-nav-item href="#performance" @click="scrollIntoView" v-if="performanceDataCount > 0">{{ $t('pagePassportTraitStatsTitle') }}</b-nav-item>
          <b-nav-item href="#datasets" @click="scrollIntoView">{{ $t('pagePassportDatasetTitle') }}</b-nav-item>
          <b-nav-item href="#pedigree" @click="scrollIntoView">{{ $t('pagePassportPedigreeTitle') }}</b-nav-item>
          <b-nav-item href="#location" @click="scrollIntoView" v-if="germplasm.declatitude && germplasm.declongitude">{{ $t('pagePassportLocationTitle') }}</b-nav-item>
          <b-nav-item href="#images" @click="scrollIntoView">{{ $t('pagePassportImageTitle') }}</b-nav-item>
          <b-nav-item href="#groups" @click="scrollIntoView">{{ $t('pagePassportGroupTitle') }}</b-nav-item>
          <b-nav-item href="#entity" @click="scrollIntoView">{{ $t('pagePassportEntityTitle') }}</b-nav-item>
          <b-nav-item href="#attributes" @click="scrollIntoView">{{ $t('pagePassportAttributeTitle') }}</b-nav-item>
          <b-nav-item href="#comments" @click="scrollIntoView" v-if="serverSettings && serverSettings.commentsEnabled === true">{{ $t('pagePassportCommentTitle') }}</b-nav-item>
          <b-nav-item class="ml-auto">
            <!-- Marked item checkbox -->
            <i :class="`mdi mdi-18px fix-alignment text-white ${markedStyle}`" @click="onToggleMarked()" v-b-tooltip.hover.bottom :title="$t('tooltipGermplasmMarkedItem')"/>
          </b-nav-item>
        </b-navbar-nav>
      </b-navbar>
      <div id="nav-scroller">
        <h1 class="mt-3">{{ $t('pagePassportTitle') }}</h1>
        <hr />
        <!-- Heading -->
        <h2 class="mdi-heading" id="mcpd">
          <span>{{ title }}</span>
          <small v-if="germplasm.entitytype"> {{ germplasm.entitytype }} </small>
          <i :class="`mdi mdi-36px text-primary passport-checkbox ${markedStyle}`" @click="onToggleMarked()" v-b-tooltip.hover :title="$t('tooltipGermplasmMarkedItem')"/>
        </h2>
        <p v-html="$t('pagePassportText')" />

        <!-- PDCI -->
        <template v-if="germplasmTableData && germplasmTableData.pdci">
          <hr />
          <h2 class="mdi-heading"><i class="mdi mdi-36px mdi-chart-donut text-primary" /> <span> {{ $t('pagePassportPdciTitle') }} </span><small><a href="#" @click.prevent="showPdciModal"><i class="mdi mdi-18px mdi-help-circle"/></a></small></h2>
          <p><strong>{{ $t('pagePassportPdciText', { pdci: germplasmTableData.pdci.toFixed(2) }) }}</strong></p>
        </template>
        <hr />
        <b-row>
          <b-col cols=12 lg=6>
            <!-- MCPD -->
            <Mcpd :germplasm="germplasm"/>
          </b-col>
          <b-col cols=12 lg=6>
            <!-- Synonyms -->
            <template v-if="germplasmTableData && germplasmTableData.synonyms">
              <h2 class="mdi-heading"><i class="mdi mdi-36px text-primary mdi-tag-text-outline"/><span> {{ $t('pagePassportSynonymsTitle') }}</span></h2>
              <ul>
                <li v-for="(synonym, index) in germplasmTableData.synonyms" :key="`germplasm-synonym-${index}`">
                  {{ synonym }}
                </li>
              </ul>
            </template>

            <!-- Institution -->
            <Institution v-if="germplasmTableData" :institutionId="germplasmTableData.institutionId" id="institution"/>
          </b-col>
        </b-row>

        <hr />
        <h2 class="mdi-heading" id="publications"><i class="mdi mdi-36px text-primary mdi-text-box-check-outline"/><span> {{ $t('pagePassportPublicationsTitle') }}</span></h2>
        <p v-html="$t('pagePassportPublicationsText')" />

        <PublicationsWidget :referencingId="this.germplasmId" referenceType="germplasm" />

        <hr />
        <h2 class="mdi-heading" id="links"><i class="mdi mdi-36px text-primary mdi-link-variant"/><span> {{ $t('pagePassportLinksTitle') }}</span></h2>
        <p v-html="$t('pagePassportLinksText')" />
        <!-- Links -->
        <Links :foreignId="currentGermplasmId" targetTable="germinatebase" />

        <div v-show="performanceDataCount > 0">
          <hr />
          <h2 class="mdi-heading" id="performance"><i class="mdi mdi-36px text-primary mdi-speedometer" /><span> {{ $t('pagePassportTraitStatsTitle') }}</span></h2>
          <p>{{ $t('pagePassportTraitStatsText') }}</p>
          <b-button v-b-toggle.trait-collapse variant="primary">{{ $t('buttonToggle') }}</b-button>
          <b-collapse id="trait-collapse" class="mt-2" :visible="performanceDataCount <= 48">
            <GermplasmTraitStats :germplasmId="germplasmId" @has-data="onTraitStatsDataChanged" ref="performanceData" />
          </b-collapse>
        </div>

        <hr />
        <h2 class="mdi-heading" id="datasets"><i class="mdi mdi-36px text-primary mdi-database"/><span> {{ $t('pagePassportDatasetTitle') }}</span></h2>
        <p v-html="$t('pagePassportDatasetText')" />
        <!-- Datasets containing this germplasm -->
        <DatasetTable :getData="getDatasetData" />

        <hr />
        <h2 class="mdi-heading" id="pedigree"><i class="mdi mdi-36px mdi-tournament mdi-rotate-90 text-primary" /> <span> {{ $t('pagePassportPedigreeTitle') }}</span></h2>
        <p v-html="$t('pagePassportPedigreeText')" />
        <PedigreeDefinitionTable :getData="getPedigreeDefinitionData" :filterOn="pedigreeDefinitionFilter" />
        <!-- Pedigree table -->
        <PedigreeTable :getData="getPedigreeData" :filterOn="pedigreeFilter" />
        <!-- Pedigree chart -->
        <PedigreeChart :germplasm="germplasm" v-if="germplasm" />

        <!-- Location map -->
        <template v-if="germplasm.declatitude && germplasm.declongitude">
          <hr />
          <h2 class="mdi-heading" id="location"><i class="mdi mdi-36px mdi-map-marker text-primary" /> <span> {{ $t('pagePassportLocationTitle') }}</span></h2>
          <p v-html="$t('pagePassportLocationText')" />

          <LocationMap :locations="[location]"
                       :selectionMode="mapSelectionMode"
                       :isEditMode="mapSelectionMode === 'point'"
                       @selection-changed="onLocationChanged"
                       @cancel-selection="toggleMapSelection()"
                       ref="map"/>
          
          <div v-if="isAtLeastDataCurator" class="mt-3">
            <h3>{{ $t('modalTitleSelectGermplasmLocation') }}</h3>
            <b-button-group>
              <b-button @click="$refs.locationSelectionModal.show()"><i class="mdi fix-alignment mdi-18px mdi-table" /> {{ $t('modalButtonSelectGermplasmLocationSelectFromTable') }}</b-button>
              <b-button @click="toggleMapSelection()"><i class="mdi fix-alignment mdi-18px mdi-map-marker" /> {{ $t('modalButtonSelectGermplasmLocationSelectOnMap') }}</b-button>
            </b-button-group>
          </div>
        </template>

        <hr />
        <h2 class="mdi-heading" id="images"><i class="mdi mdi-36px text-primary mdi-image-multiple"/><span> {{ $t('pagePassportImageTitle') }}</span></h2>
        <p v-html="$t('pagePassportImageText')" />
        <!-- Image gallery -->
        <ImageGallery :foreignId="germplasm.id" referenceTable="germinatebase" :downloadName="germplasm.accenumb" />

        <hr />
        <h2 class="mdi-heading" id="groups"><i class="mdi mdi-36px text-primary mdi-group"/><span> {{ $t('pagePassportGroupTitle') }}</span></h2>
        <p v-html="$t('pagePassportGroupText')" />
        <!-- Groups containing this germplasm -->
        <GroupTable :getData="getGroupData" />

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
        <!-- Entity data table -->
        <EntityTable :getData="getEntityData" :filterOn="entityFilter" />

        <hr />
        <h2 class="mdi-heading" id="attributes"><i class="mdi mdi-36px text-primary mdi-playlist-plus"/><span> {{ $t('pagePassportAttributeTitle') }}</span></h2>
        <p v-html="$t('pagePassportAttributeText')" />
        <!-- Germplasm attributes -->
        <GermplasmAttributeTable :filterOn="attributeFilter" :getData="getGermplasmAttributeData" />

        <template v-if="serverSettings && serverSettings.commentsEnabled === true">
          <hr />
          <h2 class="mdi-heading" id="comments"><i class="mdi mdi-36px text-primary mdi-comment-account-outline"/><span> {{ $t('pagePassportCommentTitle') }}</span></h2>
          <p v-html="$t('pagePassportCommentText')" />
          <!-- Comments  (if enabled) -->
          <CommentTable :getData="getCommentData" ref="commentTable" :commentTypeId="1" :referenceId="currentGermplasmId" />
        </template>
      </div>
    </div>
    <!-- Loading indicator -->
    <div class="text-center" v-else>
      <b-spinner style="width: 3rem; height: 3rem;" variant="primary" type="grow" />
    </div>
    <!-- Information about PDCI -->
    <b-modal :title="$t('pagePassportPdciTitle')" ok-only ref="pdciModal">
      <div v-html="$t('pagePassportPdciModal')" />
    </b-modal>

    <LocationSelectionModal @location-selected="updateGermplasmLocation" ref="locationSelectionModal" />
    <LocationCountrySelectionModal @selection-changed="updateGermplasmLocationName" ref="locationCountrySelectionModal" />
  </div>
</template>

<script>
import CommentTable from '@/components/tables/CommentTable'
import DatasetTable from '@/components/tables/DatasetTable'
import EntityTable from '@/components/tables/EntityTable'
import GermplasmAttributeTable from '@/components/tables/GermplasmAttributeTable'
import GermplasmTraitStats from '@/components/germplasm/GermplasmTraitStats'
import GroupTable from '@/components/tables/GroupTable'
import Institution from '@/components/institution/Institution'
import LocationCountrySelectionModal from '@/components/modals/LocationCountrySelectionModal'
import LocationSelectionModal from '@/components/modals/LocationSelectionModal'
import Mcpd from '@/components/germplasm/Mcpd'
import Links from '@/components/util/Links'
import LocationMap from '@/components/map/LocationMap'
import ImageGallery from '@/components/images/ImageGallery'
import PedigreeChart from '@/components/charts/PedigreeChart'
import PedigreeTable from '@/components/tables/PedigreeTable'
import PedigreeDefinitionTable from '@/components/tables/PedigreeDefinitionTable'
import PublicationsWidget from '@/components/util/PublicationsWidget'
import germplasmApi from '@/mixins/api/germplasm.js'
import miscApi from '@/mixins/api/misc.js'
import typesMixin from '@/mixins/types.js'

export default {
  data: function () {
    return {
      germplasm: null,
      germplasmTableData: null,
      commentFilter: null,
      pedigreeFilter: null,
      pedigreeDefinitionFilter: null,
      entityFilter: null,
      currentGermplasmId: null,
      scrollSpyConfig: {
        offset: 152,
        throttle: 100
      },
      performanceDataCount: 0,
      mapSelectionMode: 'none'
    }
  },
  props: {
    germplasmId: {
      type: Number,
      default: null
    },
    isPopup: {
      type: Boolean,
      default: false
    }
  },
  components: {
    CommentTable,
    DatasetTable,
    EntityTable,
    GermplasmAttributeTable,
    GermplasmTraitStats,
    GroupTable,
    ImageGallery,
    LocationCountrySelectionModal,
    Institution,
    Links,
    LocationMap,
    LocationSelectionModal,
    Mcpd,
    PedigreeChart,
    PedigreeTable,
    PedigreeDefinitionTable,
    PublicationsWidget
  },
  mixins: [ germplasmApi, miscApi, typesMixin ],
  computed: {
    isAtLeastDataCurator: function () {
      if (this.token) {
        return this.userIsAtLeast(this.token.userType, 'Data Curator')
      } else {
        return false
      }
    },
    title: function () {
      if (this.germplasm) {
        let parts = []
        parts.push(this.germplasm.accenumb)
        parts.push(this.germplasm.accename)

        return parts.filter(p => p !== null).join(' / ')
      } else {
        return ''
      }
    },
    markedStyle: function () {
      const isMarked = this.markedGermplasm.indexOf(this.currentGermplasmId) !== -1
      return isMarked ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline'
    },
    attributeFilter: function () {
      return [{
        column: {
          name: 'germplasmId',
          type: Number
        },
        comparator: 'equals',
        operator: 'and',
        values: [this.currentGermplasmId],
        canBeChanged: false
      }]
    },
    location: function () {
      if (this.germplasm) {
        return {
          locationId: this.germplasmTableData ? this.germplasmTableData.locationId : -1,
          locationLatitude: this.germplasm.declatitude,
          locationLongitude: this.germplasm.declongitude,
          locationElevation: this.germplasm.elevation,
          locationName: this.germplasm.collsite,
          locationType: 'collectingsites',
          countryName: null,
          countryCode2: null,
          countryCode3: this.germplasm.origcty
        }
      } else {
        return null
      }
    }
  },
  methods: {
    updateGermplasmLocation: function (location) {
      this.apiPatchGermplasmLocation(this.germplasmId, {
        id: location
      }, () => {
        this.apiGetGermplasmMcpd(this.germplasmId, result => {
          this.germplasm = result
        })
      })
    },
    updateGermplasmLocationName: function (locationInput) {
      if (locationInput && this.tempNewLocation) {
        this.apiPatchGermplasmLocation(this.germplasmId, {
          id: null,
          countryId: locationInput.countryId,
          siteName: locationInput.name,
          elevation: locationInput.elevation,
          latitude: this.tempNewLocation.locationLatitude,
          longitude: this.tempNewLocation.locationLongitude,
          locationtypeId: 1
        }, () => {
          this.apiGetGermplasmMcpd(this.germplasmId, result => {
            this.germplasm = result
          })
          this.toggleMapSelection()
        })
      }

      this.tempNewLocation = null
    },
    onLocationChanged: function (newLocation) {
      if (newLocation) {
        this.tempNewLocation = newLocation
        this.$refs.locationCountrySelectionModal.show()
      }
    },
    toggleMapSelection: function () {
      if (this.mapSelectionMode === 'point') {
        this.mapSelectionMode = 'none'
      } else {
        this.mapSelectionMode = 'point'
      }
    },
    onTraitStatsDataChanged: function (traitCount) {
      this.performanceDataCount = traitCount
    },
    scrollIntoView: function (evt) {
      evt.preventDefault()
      const href = evt.target.getAttribute('href')
      const el = href ? document.querySelector(href) : null
      if (el) {
        window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - 65 - this.$refs.scrollSpy.$el.offsetHeight)
      }
    },
    showPdciModal: function () {
      this.$refs.pdciModal.show()
    },
    getGermplasmAttributeData: function (data, callback) {
      return this.apiPostGermplasmAttributeTable(data, callback)
    },
    getCommentData: function (data, callback) {
      return this.apiPostCommentsTable(data, callback)
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
    getPedigreeDefinitionData: function (data, callback) {
      return this.apiPostPedigreedefinitionTable(data, callback)
    },
    onToggleMarked: function () {
      const isMarked = this.markedGermplasm.indexOf(this.currentGermplasmId) !== -1
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
    const urlParam = this.$route.params.germplasmId

    if (this.germplasmId) {
      this.currentGermplasmId = this.germplasmId
    } else if (urlParam) {
      this.currentGermplasmId = parseInt(urlParam)
    }

    // Set up the pedigree filter
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

    this.pedigreeDefinitionFilter = [{
      column: {
        name: 'germplasmId',
        type: Number
      },
      comparator: 'equals',
      operator: 'and',
      values: [this.currentGermplasmId],
      canBeChanged: false
    }]

    // Set up the entity data filter
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
    // Add to recently viewed Germplasm ids
    this.$store.dispatch('ON_RECENT_IDS_PUSH', { type: 'germplasm', id: this.currentGermplasmId })

    // Get the germplasm MCPD based on the id
    this.apiGetGermplasmMcpd(this.currentGermplasmId, result => {
      this.germplasm = result
    })

    // Request information based on id
    const request = {
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
.passport-navbar {
  margin-left: -30px;
  margin-right: -30px;
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
  top: 65px;
  align-self: flex-start;
  z-index: 1019;
}
.scrollspy-sticky > .navbar-nav {
  flex-wrap: wrap;
}
</style>
