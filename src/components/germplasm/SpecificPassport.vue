<template>
  <div>
    <div v-if="germplasmTableData">
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
          <b-nav-item href="#location" @click="scrollIntoView" v-if="germplasmTableData.latitude && germplasmTableData.longitude">{{ $t('pagePassportLocationTitle') }}</b-nav-item>
          <b-nav-item href="#images" @click="scrollIntoView">{{ $t('pagePassportImageTitle') }}</b-nav-item>
          <b-nav-item href="#groups" @click="scrollIntoView">{{ $t('pagePassportGroupTitle') }}</b-nav-item>
          <b-nav-item href="#entity" @click="scrollIntoView">{{ $t('pagePassportEntityTitle') }}</b-nav-item>
          <b-nav-item href="#attributes" @click="scrollIntoView">{{ $t('pagePassportAttributeTitle') }}</b-nav-item>
          <b-nav-item href="#comments" @click="scrollIntoView" v-if="storeServerSettings && storeServerSettings.commentsEnabled === true">{{ $t('pagePassportCommentTitle') }}</b-nav-item>
          <b-nav-item class="ml-auto">
            <!-- Marked item checkbox -->
            <span class="text-white" @click="onToggleMarked()" v-b-tooltip.hover.bottom :title="$t('tooltipGermplasmMarkedItem')">
              <MdiIcon :path="mdiCheckboxMarked" v-if="isMarked" />
              <MdiIcon :path="mdiCheckboxBlankOutline" v-else />
            </span>
          </b-nav-item>
        </b-navbar-nav>
      </b-navbar>
      <div id="nav-scroller">
        <h1 class="mt-3">{{ $t('pagePassportTitle') }}</h1>
        <hr />
        <!-- Heading -->
        <h2 class="mdi-heading" id="mcpd">
          <span>
            <span>{{ title }}</span>
            <small v-if="germplasmTableData && germplasmTableData.entityTypeName"> {{ entityTypes[germplasmTableData.entityTypeName].text() }} </small>
          </span>
          <span class="text-primary"  @click="onToggleMarked()" v-b-tooltip.hover :title="$t('tooltipGermplasmMarkedItem')">
            <MdiIcon :path="mdiCheckboxMarked" v-if="isMarked" />
            <MdiIcon :path="mdiCheckboxBlankOutline" v-else />
          </span>
        </h2>
        <p v-html="$t('pagePassportText')" />

        <hr />

        <b-row>
          <b-col cols=12 lg=6>
            <!-- MCPD -->
            <Mcpd :germplasmId="germplasmTableData.germplasmId"/>
          </b-col>
          <b-col cols=12 lg=6>
            <!-- PDCI -->
            <template v-if="germplasmTableData && germplasmTableData.pdci">
              <h2 class="mdi-heading">
                <span class="text-primary"><MdiIcon :path="mdiChartDonut" /></span> <span> {{ $t('pagePassportPdciTitle') }} </span><small><a href="#" @click.prevent="showPdciModal">
                  <span class="text-muted"><MdiIcon :path="mdiHelpCircle" /></span>
                </a></small></h2>
              <p><strong>{{ $t('pagePassportPdciText', { pdci: germplasmTableData.pdci.toFixed(2) }) }}</strong></p>
            </template>
            <!-- Synonyms -->
            <template v-if="germplasmTableData && germplasmTableData.synonyms">
              <h2 class="mdi-heading"><span class="text-primary"><MdiIcon :path="mdiTagTextOutline" /></span><span> {{ $t('pagePassportSynonymsTitle') }}</span></h2>
              <ul>
                <li v-for="(synonym, index) in germplasmTableData.synonyms" :key="`germplasm-synonym-${index}`">
                  {{ synonym }}
                </li>
              </ul>
            </template>

            <h2 class="mdi-heading" id="links"><span class="text-primary"><MdiIcon :path="mdiLinkVariant" /></span><span> {{ $t('pagePassportLinksTitle') }}</span></h2>
            <p v-html="$t('pagePassportLinksText')" />
            <!-- Links -->
            <Links :foreignId="currentGermplasmId" targetTable="germinatebase" />

            <b-button target="_blank" :href="`https://cropgeeks.github.io/humbug/#/import?barcodes=${germplasmTableData.germplasmName}`">
              <MdiIcon :path="mdiBarcode" /> {{ $t('pagePassportGenerateBarcode') }}
            </b-button>
          </b-col>
        </b-row>

        <hr />
        <!-- Institution -->
        <div v-if="germplasmTableData">
          <h2 class="mdi-heading"><span class="text-primary"><MdiIcon :path="mdiCity" /></span> <span> {{ $t('pagePassportInstitutionTitle') }} </span></h2>
          <InstitutionTable :getData="getGermplasmInstitutionData" id="institution"/>
        </div>

        <hr />
        <h2 class="mdi-heading" id="publications"><span class="text-primary"><MdiIcon :path="mdiTextBoxCheckOutline" /></span><span> {{ $t('pagePassportPublicationsTitle') }}</span></h2>
        <p v-html="$t('pagePassportPublicationsText')" />

        <PublicationsWidget :referencingId="germplasmTableData.germplasmId" referenceType="germplasm" />

        <div v-show="performanceDataCount > 0">
          <hr />
          <h2 class="mdi-heading" id="performance"><span class="text-primary"><MdiIcon :path="mdiSpeedometer" /></span><span> {{ $t('pagePassportTraitStatsTitle') }}</span></h2>
          <p>{{ $t('pagePassportTraitStatsText') }}</p>
          <b-button v-b-toggle.trait-collapse variant="primary">{{ $t('buttonToggle') }}</b-button>
          <b-collapse id="trait-collapse" class="mt-2" :visible="performanceDataCount <= 48">
            <GermplasmTraitStats :germplasmId="germplasmTableData.germplasmId" @has-data="onTraitStatsDataChanged" ref="performanceData" />
          </b-collapse>
        </div>

        <hr />
        <h2 class="mdi-heading" id="datasets"><span class="text-primary"><MdiIcon :path="mdiDatabase" /></span><span> {{ $t('pagePassportDatasetTitle') }}</span></h2>
        <p v-html="$t('pagePassportDatasetText')" />
        <!-- Datasets containing this germplasm -->
        <DatasetTable :getData="getDatasetData" />

        <hr />
        <h2 class="mdi-heading" id="pedigree"><span class="text-primary"><MdiIcon :path="mdiFamilyTree" /></span> <span> {{ $t('pagePassportPedigreeTitle') }}</span></h2>
        <p v-html="$t('pagePassportPedigreeText')" />
        <PedigreeDefinitionTable :getData="getPedigreeDefinitionData" :filterOn="pedigreeDefinitionFilter" />
        <!-- Pedigree table -->
        <PedigreeTable :getData="getPedigreeData" :filterOn="pedigreeFilter" />
        <!-- Pedigree chart -->
        <PedigreeChart :germplasmId="germplasmTableData.germplasmId" v-if="germplasmTableData" />

        <!-- Location map -->
        <template v-if="germplasmTableData.latitude && germplasmTableData.longitude">
          <hr />
          <h2 class="mdi-heading" id="location"><span class="text-primary"><MdiIcon :path="mdiMapMarker" /></span> <span> {{ $t('pagePassportLocationTitle') }}</span></h2>
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
              <b-button @click="$refs.locationSelectionModal.show()"><MdiIcon :path="mdiTable" /> {{ $t('modalButtonSelectGermplasmLocationSelectFromTable') }}</b-button>
              <b-button @click="toggleMapSelection()"><MdiIcon :path="mdiMapMarker" /> {{ $t('modalButtonSelectGermplasmLocationSelectOnMap') }}</b-button>
            </b-button-group>
          </div>
        </template>

        <hr />
        <h2 class="mdi-heading" id="images"><span class="text-primary"><MdiIcon :path="mdiImageMultiple" /></span> <span> {{ $t('pagePassportImageTitle') }}</span></h2>
        <p v-html="$t('pagePassportImageText')" />
        <!-- Image gallery -->
        <ImageGallery :foreignId="germplasmTableData.germplasmId" referenceTable="germinatebase" :downloadName="germplasmTableData.germplasmName" />

        <hr />
        <h2 class="mdi-heading" id="groups"><span class="text-primary"><MdiIcon :path="mdiGroup" /></span><span> {{ $t('pagePassportGroupTitle') }}</span></h2>
        <p v-html="$t('pagePassportGroupText')" />
        <!-- Groups containing this germplasm -->
        <GroupTable :getData="getGroupData" />

        <hr />
        <h2 class="mdi-heading" id="entity"><span class="text-primary"><MdiIcon :path="mdiFileTree" /></span> <span> {{ $t('pagePassportEntityTitle') }}</span></h2>
        <p v-html="$t('pagePassportEntityText')" />
        <ul class="no-bullet-list">
          <li><MdiIcon :path="mdiCircleMedium" /> {{ entityTypes['Accession'].text() }}</li>
          <ul>
            <li><MdiIcon :path="mdiSubdirectoryArrowRight" /> {{ entityTypes['Plant/Plot'].text() }}</li>
            <ul>
              <li><MdiIcon :path="mdiSubdirectoryArrowRight" /> {{ entityTypes['Sample'].text() }}</li>
            </ul>
          </ul>
        </ul>
        <!-- Entity data table -->
        <EntityTable :getData="getEntityData" :filterOn="entityFilter" />

        <hr />
        <h2 class="mdi-heading" id="attributes"><span class="text-primary"><MdiIcon :path="mdiPlaylistPlus" /></span><span> {{ $t('pagePassportAttributeTitle') }}</span></h2>
        <p v-html="$t('pagePassportAttributeText')" />
        <!-- Germplasm attributes -->
        <GermplasmAttributeTable :filterOn="attributeFilter" :getData="getGermplasmAttributeData" />

        <template v-if="storeServerSettings && storeServerSettings.commentsEnabled === true">
          <hr />
          <h2 class="mdi-heading" id="comments"><span class="text-primary"><MdiIcon :path="mdiCommentAccountOutline" /></span><span> {{ $t('pagePassportCommentTitle') }}</span></h2>
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
import { mapGetters } from 'vuex'

import MdiIcon from '@/components/icons/MdiIcon'
import CommentTable from '@/components/tables/CommentTable'
import DatasetTable from '@/components/tables/DatasetTable'
import EntityTable from '@/components/tables/EntityTable'
import GermplasmAttributeTable from '@/components/tables/GermplasmAttributeTable'
import GermplasmTraitStats from '@/components/germplasm/GermplasmTraitStats'
import GroupTable from '@/components/tables/GroupTable'
import InstitutionTable from '@/components/tables/InstitutionTable'
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
import authApi from '@/mixins/api/auth'
import germplasmApi from '@/mixins/api/germplasm'
import miscApi from '@/mixins/api/misc'
import typesMixin from '@/mixins/types'

import { mdiPlaylistPlus, mdiCommentAccountOutline, mdiCheckboxBlankOutline, mdiCity, mdiCheckboxMarked, mdiBarcode, mdiChartDonut, mdiHelpCircle, mdiTagTextOutline, mdiTextBoxCheckOutline, mdiLinkVariant, mdiSpeedometer, mdiDatabase, mdiFamilyTree, mdiMapMarker, mdiTable, mdiImageMultiple, mdiGroup, mdiFileTree, mdiCircleMedium, mdiSubdirectoryArrowRight } from '@mdi/js'

export default {
  data: function () {
    return {
      mdiCheckboxBlankOutline,
      mdiCheckboxMarked,
      mdiBarcode,
      mdiChartDonut,
      mdiHelpCircle,
      mdiTagTextOutline,
      mdiTextBoxCheckOutline,
      mdiLinkVariant,
      mdiSpeedometer,
      mdiDatabase,
      mdiCity,
      mdiFamilyTree,
      mdiMapMarker,
      mdiTable,
      mdiImageMultiple,
      mdiGroup,
      mdiFileTree,
      mdiCircleMedium,
      mdiSubdirectoryArrowRight,
      mdiPlaylistPlus,
      mdiCommentAccountOutline,
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
    MdiIcon,
    CommentTable,
    DatasetTable,
    EntityTable,
    GermplasmAttributeTable,
    GermplasmTraitStats,
    GroupTable,
    ImageGallery,
    LocationCountrySelectionModal,
    InstitutionTable,
    Links,
    LocationMap,
    LocationSelectionModal,
    Mcpd,
    PedigreeChart,
    PedigreeTable,
    PedigreeDefinitionTable,
    PublicationsWidget
  },
  mixins: [authApi, germplasmApi, miscApi, typesMixin],
  computed: {
    ...mapGetters([
      'storeServerSettings',
      'storeToken',
      'storeMarkedGermplasm'
    ]),
    isAtLeastDataCurator: function () {
      if (this.storeToken) {
        return this.userIsAtLeast(this.storeToken.userType, 'Data Curator')
      } else {
        return false
      }
    },
    title: function () {
      if (this.germplasmTableData) {
        const parts = []
        parts.push(this.germplasmTableData.germplasmName)
        parts.push(this.germplasmTableData.germplasmNumber)

        return parts.filter(p => p !== null).join(' / ')
      } else {
        return ''
      }
    },
    isMarked: function () {
      return this.storeMarkedGermplasm.indexOf(this.currentGermplasmId) !== -1
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
      if (this.germplasmTableData) {
        return {
          locationId: this.germplasmTableData ? this.germplasmTableData.locationId : -1,
          locationLatitude: this.germplasmTableData.latitude,
          locationLongitude: this.germplasmTableData.longitude,
          locationElevation: this.germplasmTableData.elevation,
          locationName: this.germplasmTableData.location,
          locationType: 'collectingsites',
          countryName: this.germplasmTableData.countryName,
          countryCode2: this.germplasmTableData.countryCode,
          countryCode3: null
        }
      } else {
        return null
      }
    }
  },
  methods: {
    updateGermplasmLocation: function (location) {
      this.apiPatchGermplasmLocation(this.germplasmTableData.germplasmId, {
        id: location
      }, () => {
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
      })
    },
    updateGermplasmLocationName: function (locationInput) {
      if (locationInput && this.tempNewLocation) {
        this.apiPatchGermplasmLocation(this.germplasmTableData.germplasmId, {
          id: null,
          countryId: locationInput.countryId,
          siteName: locationInput.name,
          elevation: locationInput.elevation,
          latitude: this.tempNewLocation.locationLatitude,
          longitude: this.tempNewLocation.locationLongitude,
          locationtypeId: 1
        }, () => {
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
        window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - 72 - this.$refs.scrollSpy.$el.offsetHeight)
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
    getGermplasmInstitutionData: function (data, callback) {
      return this.apiPostGermplasmInstitutionTable(this.currentGermplasmId, data, callback)
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
      const isMarked = this.storeMarkedGermplasm.indexOf(this.currentGermplasmId) !== -1
      if (isMarked) {
        this.$store.dispatch('removeMarkedIds', { type: 'germplasm', ids: [this.currentGermplasmId] })
      } else {
        this.$store.dispatch('addMarkedIds', { type: 'germplasm', ids: [this.currentGermplasmId] })
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
    this.$store.dispatch('pushRecentIds', { type: 'germplasm', id: this.currentGermplasmId })

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

    this.$store.dispatch('setHelpKey', 'helpPassport')
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
  top: 72px;
  align-self: flex-start;
  z-index: 1019;
}
.scrollspy-sticky > .navbar-nav {
  flex-wrap: wrap;
}
</style>
