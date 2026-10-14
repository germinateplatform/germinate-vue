<template>
  <div class="custom-page passport-page">
    <!-- Header -->
    <section :class="['pp-card', 'pp-header', { 'pp-header-has-image': referenceImages.length > 0 }]">
      <!-- Reference images of the accession, blurred behind the header. Several ones fade into each other. -->
      <div class="pp-header-backdrop" v-if="referenceImages.length > 0" aria-hidden="true">
        <div v-for="(image, index) in referenceImages"
             :key="'pp-header-image-' + image.imageId"
             :class="['pp-header-image', { active: index === referenceImageIndex }]"
             :style="{ backgroundImage: `url('${getReferenceImageSrc(image)}')` }" />
        <div class="pp-header-veil" />
      </div>

      <div class="pp-header-main">
        <div class="pp-header-crop">
          <!-- Germplasm group of the accession, with the icon of its flagship crop like on the home page -->
          <template v-if="cropGroup">
            <span :class="['pp-crop-icon', `cp-crop-${cropGroup.crop ? cropGroup.crop.key : 'other'}`]"><MdiIcon :path="cropGroup.crop ? cropGroup.crop.icon : icons.group" :size="20" /></span>
            <span class="pp-crop-name">{{ cropGroup.groupName }}</span>
          </template>
          <!-- In-situ when the accession has the attribute IN-SITU with value 1, ex-situ otherwise -->
          <span class="pp-status-badge" v-if="conservation">{{ conservation }}</span>
        </div>
        <!-- Accession number, with the accession name next to it (cut with "..." when too long) -->
        <h1 class="pp-title" v-if="accessionNumber">
          <span class="pp-title-main">{{ accessionNumber }}</span>
          <small class="pp-title-secondary" v-if="accessionName" :title="accessionName">{{ accessionName }}</small>
        </h1>
        <!-- Genus, species and species authority -->
        <div class="pp-taxonomy" v-if="taxonomy">{{ taxonomy }}</div>
      </div>

      <div class="pp-header-actions">
        <!-- Same as the checkbox on the original passport page: adds the accession to, or removes it from, the marked germplasm -->
        <button type="button"
                :class="['pp-action-button', { marked: isMarked }]"
                :aria-pressed="isMarked"
                :disabled="!germplasm"
                :title="$t('tooltipGermplasmMarkedItem')"
                @click="toggleMarked">
          <span class="pp-action-icon pp-action-mark"><MdiIcon :path="isMarked ? icons.checked : icons.unchecked" :size="22" /></span>
          {{ isMarked ? 'Unmark Germplasm' : 'Mark Germplasm' }}
        </button>
        <!-- Same as the original passport page: opens Humbug with this accession in a new window -->
        <a :href="barcodeUrl" target="_blank" rel="noopener noreferrer" class="pp-action-button" title="Generate barcode using Humbug">
          <span class="pp-action-icon pp-action-barcode"><MdiIcon :path="icons.barcode" :size="22" /></span>
          Generate Barcode
        </a>
        <!-- Passport Data Completeness Index, out of 10 -->
        <div class="pp-pdci">
          <div class="pp-pdci-bar" role="progressbar" aria-valuemin="0" aria-valuemax="10" :aria-valuenow="pdci === null ? 0 : pdci" aria-label="PDCI">
            <span class="pp-pdci-fill" :style="{ width: `${pdciFillPercent}%` }" />
          </div>
          <span class="pp-pdci-text">PDCI: {{ pdciText }}</span>
          <!-- Same help as next to the PDCI title on the original passport page -->
          <button type="button" class="pp-info pp-info-button" @click="$refs.pdciModal.show()" :title="$t('pagePassportPdciTitle')" :aria-label="$t('pagePassportPdciTitle')">
            <MdiIcon :path="icons.info" :size="16" />
          </button>
          <b-modal :title="$t('pagePassportPdciTitle')" ok-only ref="pdciModal">
            <div v-html="$t('pagePassportPdciModal')" />
          </b-modal>
        </div>
      </div>
    </section>

    <!-- Tabs: Passport is the default one -->
    <b-tabs class="pp-tabs" nav-class="pp-tabs-nav" content-class="pp-tabs-content" v-model="tabIndex">
      <b-tab title="Passport" active>
        <div class="pp-tab-content">
          <div class="pp-main" v-if="mcpd">
            <!-- The Overview fields are MCPD descriptors -->
            <p class="pp-standard-note">
              <MdiIcon :path="icons.standard" :size="18" />
              <span>{{ $t('pagePassportMcpdStandardNote') }}</span>
            </p>

            <!-- Overview: the MCPD fields of the original passport page -->
            <section class="pp-card pp-panel">
              <button type="button" class="pp-panel-header" :aria-expanded="open.overview" @click="toggle('overview')">
                <h2 class="pp-panel-title">Overview</h2>
                <span :class="['pp-panel-chevron', { closed: !open.overview }]"><MdiIcon :path="icons.chevronUp" :size="22" /></span>
              </button>
              <div v-show="open.overview">
                <div class="pp-field" v-for="(field, index) in overviewFields" :key="'pp-field-' + index">
                  <div class="pp-field-name">
                    <div class="pp-field-code">
                      {{ field.code }}
                      <!-- MCPD description of the field -->
                      <button type="button" class="pp-info pp-info-button" :aria-label="'About ' + field.code" v-b-popover.hover.focus.right="{ title: field.code, content: field.description }">
                        <MdiIcon :path="icons.info" :size="14" />
                      </button>
                    </div>
                    <div class="pp-field-label">{{ field.label }}</div>
                  </div>
                  <div :class="['pp-field-value', { italic: field.italic }]">
                    <template v-if="field.value">
                      <span :class="`fi fi-${field.flag}`" v-if="field.flag" /> {{ field.value }}
                      <!-- The PUID is a DOI: open it on doi.org in a new window -->
                      <a v-if="field.link" :href="field.link" target="_blank" rel="noopener noreferrer" class="pp-field-link" :title="field.link"><MdiIcon :path="icons.openInNew" :size="16" /></a>
                    </template>
                    <span class="pp-field-empty" v-else>—</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div class="pp-side">
            <!-- Location: same map as the original passport page, only shown when the accession has coordinates -->
            <section class="pp-card pp-panel" v-if="location">
              <button type="button" class="pp-panel-header" :aria-expanded="open.location" @click="toggle('location')">
                <h2 class="pp-panel-title">Location</h2>
                <span :class="['pp-panel-chevron', { closed: !open.location }]"><MdiIcon :path="icons.chevronUp" :size="22" /></span>
              </button>
              <div class="pp-map" v-show="open.location">
                <LocationMap :locations="[location]" baseLayer="osm" :openPopup="false" :showLinks="false" :initialZoom="6" ref="map" />
              </div>
            </section>

            <!-- Datasets: same data as the datasets table of the original passport page.
                 Only shown when there are any, or to data curators so they can add one. -->
            <section class="pp-card pp-panel" v-if="datasetTotal > 0 || isDataCurator">
              <!-- The header holds two buttons (add, collapse), so it is not a button itself -->
              <div class="pp-panel-header" @click="toggle('datasets')">
                <div class="pp-panel-heading">
                  <h2 class="pp-panel-title">Datasets</h2>
                  <!-- Same as "Add dataset" in the datasets table of the original passport page -->
                  <button type="button" class="pp-panel-add" v-if="isDataCurator" @click.stop="addDataset" :title="$t('buttonAddDataset')" :aria-label="$t('buttonAddDataset')">
                    <MdiIcon :path="icons.plus" :size="18" />
                  </button>
                </div>
                <button type="button" class="pp-panel-toggle" :aria-expanded="open.datasets" @click.stop="toggle('datasets')" aria-label="Show or hide datasets">
                  <span :class="['pp-panel-chevron', { closed: !open.datasets }]"><MdiIcon :path="icons.chevronUp" :size="22" /></span>
                </button>
              </div>
              <div v-show="open.datasets">
                <div class="pp-item pp-item-empty" v-if="datasetTotal === 0">No datasets yet</div>
                <!-- The whole row is the link, following the same rules as the dataset name in the original table -->
                <component v-for="dataset in datasets"
                           :key="'pp-dataset-' + dataset.datasetId"
                           :is="getDatasetLink(dataset).tag"
                           v-bind="getDatasetLink(dataset).attributes"
                           :class="['pp-item', { 'pp-item-link': getDatasetLink(dataset).tag !== 'div' }]">
                  <span class="pp-item-icon" :style="getDatasetTypeStyle(dataset)"><MdiIcon :path="getDatasetType(dataset).path" :size="16" /></span>
                  <div class="pp-item-body">
                    <div class="pp-item-title" :title="dataset.datasetName">{{ dataset.datasetName }}</div>
                    <div class="pp-item-subtitle">{{ getDatasetType(dataset).text() }}</div>
                  </div>
                  <span class="pp-item-external" v-if="getDatasetLink(dataset).tag === 'a'"><MdiIcon :path="icons.openInNew" :size="16" /></span>
                </component>

                <DatasetEditModal v-if="isDataCurator" :dataset="null" @changed="loadDatasets(datasetPage)" ref="datasetEditModal" />

                <!-- More than 4 datasets -->
                <div class="pp-pager" v-if="datasetPageCount > 1">
                  <button type="button" class="pp-pager-button" :disabled="datasetPage <= 1" @click="loadDatasets(datasetPage - 1)" aria-label="Previous datasets">
                    <MdiIcon :path="icons.chevronLeft" :size="20" />
                  </button>
                  <span class="pp-pager-text">{{ datasetPage }} / {{ datasetPageCount }}</span>
                  <button type="button" class="pp-pager-button" :disabled="datasetPage >= datasetPageCount" @click="loadDatasets(datasetPage + 1)" aria-label="Next datasets">
                    <MdiIcon :path="icons.chevronRight" :size="20" />
                  </button>
                </div>
              </div>
            </section>

            <!-- Institutions: same data as the institutions table of the original passport page, only shown when there are any -->
            <section class="pp-card pp-panel" v-if="institutions.length > 0">
              <button type="button" class="pp-panel-header" :aria-expanded="open.institutions" @click="toggle('institutions')">
                <h2 class="pp-panel-title">Institutions</h2>
                <span :class="['pp-panel-chevron', { closed: !open.institutions }]"><MdiIcon :path="icons.chevronUp" :size="22" /></span>
              </button>
              <div v-show="open.institutions">
                <!-- The whole row opens the FAO WIEWS page of the institution code in a new window, like the code in the original table -->
                <component v-for="(institution, index) in institutionsOnPage"
                           :key="'pp-institution-' + institution.institutionId + '-' + institution.institutionType + '-' + index"
                           :is="institution.institutionCode ? 'a' : 'div'"
                           v-bind="institution.institutionCode ? { href: getWiewsOrganisationUrl(institution.institutionCode), target: '_blank', rel: 'noopener noreferrer' } : {}"
                           :class="['pp-item', 'pp-institution', { 'pp-item-link': !!institution.institutionCode }]">
                  <span class="pp-item-icon" :style="getInstitutionTypeStyle(institution)"><MdiIcon :path="getInstitutionType(institution).path" :size="16" /></span>
                  <div class="pp-item-body">
                    <div class="pp-institution-head">
                      <strong class="pp-institution-code">{{ institution.institutionCode || 'N/A' }}</strong>
                      <span class="pp-item-subtitle pp-institution-type">{{ getInstitutionType(institution).text() }}</span>
                    </div>
                    <div class="pp-item-title pp-institution-name" :title="getInstitutionName(institution)">{{ getInstitutionName(institution) }}</div>
                  </div>
                </component>

                <!-- More than 4 institutions -->
                <div class="pp-pager" v-if="institutionPageCount > 1">
                  <button type="button" class="pp-pager-button" :disabled="institutionPage <= 1" @click="institutionPage--" aria-label="Previous institutions">
                    <MdiIcon :path="icons.chevronLeft" :size="20" />
                  </button>
                  <span class="pp-pager-text">{{ institutionPage }} / {{ institutionPageCount }}</span>
                  <button type="button" class="pp-pager-button" :disabled="institutionPage >= institutionPageCount" @click="institutionPage++" aria-label="Next institutions">
                    <MdiIcon :path="icons.chevronRight" :size="20" />
                  </button>
                </div>
              </div>
            </section>

            <!-- Publications: same data as the publications of the original passport page.
                 Only shown when there are any, or to data curators so they can add one. -->
            <section class="pp-card pp-panel" v-if="publications.length > 0 || isDataCurator">
              <div class="pp-panel-header" @click="toggle('publications')">
                <div class="pp-panel-heading">
                  <h2 class="pp-panel-title">Publications</h2>
                  <!-- Same as "Add publication" on the original passport page: added by DOI and referenced to this accession -->
                  <button type="button" class="pp-panel-add" v-if="isDataCurator" @click.stop="addPublication" :title="$t('buttonAddPublication')" :aria-label="$t('buttonAddPublication')">
                    <MdiIcon :path="icons.plus" :size="18" />
                  </button>
                </div>
                <button type="button" class="pp-panel-toggle" :aria-expanded="open.publications" @click.stop="toggle('publications')" aria-label="Show or hide publications">
                  <span :class="['pp-panel-chevron', { closed: !open.publications }]"><MdiIcon :path="icons.chevronUp" :size="22" /></span>
                </button>
              </div>
              <div v-show="open.publications">
                <div class="pp-item pp-item-empty" v-if="publications.length === 0">No publications yet</div>

                <!-- The whole row opens the publication ("Read more" on the original page) in a new window.
                     The link is stretched over the row so the delete button can sit on top of it. -->
                <div v-for="publication in publicationsOnPage"
                     :key="'pp-publication-' + publication.id"
                     :class="['pp-item', 'pp-publication', { 'pp-item-link': !!publication.url }]">
                  <span class="pp-item-icon pp-item-icon-neutral"><MdiIcon :path="icons.publication" :size="16" /></span>
                  <div class="pp-item-body">
                    <a v-if="publication.url" :href="publication.url" target="_blank" rel="noopener noreferrer" class="pp-item-title pp-stretched-link" :title="publication.title">{{ publication.title }}</a>
                    <div v-else class="pp-item-title" :title="publication.title">{{ publication.title }}</div>
                    <div class="pp-item-subtitle pp-publication-meta" v-if="getPublicationMeta(publication)" :title="getPublicationMeta(publication)">{{ getPublicationMeta(publication) }}</div>
                    <!-- Same as "Delete" on the publication cards of the original page: removes the link to this accession only -->
                    <b-button v-if="isDataCurator" variant="link" class="pp-publication-delete text-danger" @click="deletePublicationReference(publication)">{{ $t('buttonDelete') }}</b-button>
                  </div>
                </div>

                <!-- More than 4 publications -->
                <div class="pp-pager" v-if="publicationPageCount > 1">
                  <button type="button" class="pp-pager-button" :disabled="publicationPage <= 1" @click="publicationPage--" aria-label="Previous publications">
                    <MdiIcon :path="icons.chevronLeft" :size="20" />
                  </button>
                  <span class="pp-pager-text">{{ publicationPage }} / {{ publicationPageCount }}</span>
                  <button type="button" class="pp-pager-button" :disabled="publicationPage >= publicationPageCount" @click="publicationPage++" aria-label="Next publications">
                    <MdiIcon :path="icons.chevronRight" :size="20" />
                  </button>
                </div>

                <AddPublicationModal v-if="isDataCurator && germplasm" referenceType="germplasm" :referencingId="germplasm.germplasmId" @publication-added="onPublicationAdded" ref="addPublicationModal" />
              </div>
            </section>
          </div>
        </div>
      </b-tab>

      <b-tab title="Metadata" lazy>
        <p class="pp-tab-empty">There is no metadata to show yet.</p>
      </b-tab>

      <!-- Image gallery of the accession, same features as the images of the original passport page -->
      <b-tab :title="$t('pagePassportImageTitle')" lazy>
        <div class="pp-tab-panel">
          <PassportImageGallery v-if="germplasm" referenceTable="germinatebase" :foreignId="germplasm.germplasmId" @images-changed="loadReferenceImages" />
        </div>
      </b-tab>

      <!-- Pedigree: same tables and chart as the pedigree section of the original passport page -->
      <b-tab :title="$t('datasetTypePedigree')" lazy>
        <div class="pp-tab-panel" v-if="germplasm">
          <p class="pp-tab-intro" v-html="$t('pagePassportPedigreeText')" />

          <section class="pp-card pp-tab-card">
            <h2 class="pp-tab-card-title">Pedigree definitions</h2>
            <!-- Only the table scrolls sideways, not the page -->
            <div class="pp-scroll">
              <PedigreeDefinitionTable :getData="getPedigreeDefinitionData" :filterOn="pedigreeDefinitionFilter" />
            </div>
          </section>

          <section class="pp-card pp-tab-card">
            <h2 class="pp-tab-card-title">Parents and progeny</h2>
            <div class="pp-scroll">
              <PedigreeTable :getData="getPedigreeData" :filterOn="pedigreeFilter" />
            </div>
          </section>

          <!-- The chart shows itself only when there are pedigree datasets -->
          <section class="pp-card pp-tab-card pp-pedigree-chart">
            <div class="pp-scroll">
              <PedigreeChart :germplasm="germplasm" />
            </div>
          </section>
        </div>
      </b-tab>

      <!-- Entity: same content as the entity data section of the original passport page -->
      <b-tab title="Entity" lazy>
        <div class="pp-tab-panel" v-if="germplasm">
          <p class="pp-tab-intro" v-html="$t('pagePassportEntityText')" />

          <!-- The entity hierarchy, with the level of this germplasm highlighted -->
          <ol class="pp-entity-levels" aria-label="Entity hierarchy">
            <li v-for="(level, index) in entityLevels"
                :key="'pp-entity-level-' + level.name"
                :class="['pp-entity-level', { current: level.name === germplasm.entityTypeName }]"
                :aria-current="level.name === germplasm.entityTypeName ? 'true' : null">
              <MdiIcon v-if="index > 0" :path="icons.chevronRight" :size="18" class-name="pp-entity-arrow" />
              <span class="pp-entity-icon" :style="getEntityLevelStyle(level)"><MdiIcon :path="level.type.path" :size="16" /></span>
              <span>{{ level.type.text() }}</span>
            </li>
          </ol>

          <section class="pp-card pp-tab-card">
            <h2 class="pp-tab-card-title">{{ $t('pagePassportEntityTitle') }}</h2>
            <!-- Only the table scrolls sideways, not the page -->
            <div class="pp-scroll">
              <EntityTable :getData="getEntityData" :filterOn="entityFilter" />
            </div>
          </section>
        </div>
      </b-tab>

      <!-- Trait performance: only when the germplasm has trait data, like the section of the original passport page -->
      <b-tab title="Trait Performance" lazy v-if="traitStatsCount > 0">
        <div class="pp-tab-panel" v-if="germplasm">
          <p class="pp-tab-intro">{{ $t('pagePassportTraitStatsText') }}</p>

          <section class="pp-card pp-tab-card pp-trait-stats">
            <h2 class="pp-tab-card-title">{{ $t('pagePassportTraitStatsTitle') }}</h2>
            <!-- The traits wrap onto new rows, so nothing has to scroll -->
            <GermplasmTraitStats :germplasmId="germplasm.germplasmId" @has-data="count => traitStatsCount = count" />
          </section>
        </div>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import LocationMap from '@/components/map/LocationMap'
import DatasetEditModal from '@/components/modals/DatasetEditModal'
import AddPublicationModal from '@/components/modals/AddPublicationModal'
import PassportImageGallery from '@/components/images/PassportImageGallery'
import PedigreeDefinitionTable from '@/components/tables/PedigreeDefinitionTable'
import PedigreeTable from '@/components/tables/PedigreeTable'
import PedigreeChart from '@/components/charts/PedigreeChart'
import EntityTable from '@/components/tables/EntityTable'
import GermplasmTraitStats from '@/components/germplasm/GermplasmTraitStats'

import { mapGetters } from 'vuex'

import { apiPostGermplasmTable, apiPostGermplasmDatasetTable, apiGetGermplasmMcpd, apiPostGermplasmGroupTable, apiPostGermplasmAttributeTable, apiPostPedigreeTable, apiPostPedigreedefinitionTable, apiPostEntityTable, apiGetGermplasmStatsTraits } from '@/mixins/api/germplasm'
import { findFlagshipCrop } from '@/mixins/crops'
import { MAX_JAVA_INTEGER } from '@/mixins/api/base'
import { getImageUrl } from '@/mixins/image'
import { MCPD_SAMPSTAT, MCPD_COLLSRC, MCPD_STORAGE, formatMcpdCodes, getCountryFlagCode, getCountryName } from '@/mixins/mcpd'
import { apiPostGermplasmInstitutionTable, apiGetPublications, apiDeletePublicationReference, apiPostImages } from '@/mixins/api/misc'
import { datasetTypes, germplasmInstitutionTypes, entityTypes } from '@/mixins/types'
import { getWiewsOrganisationUrl, getWiewsInstitutionName } from '@/mixins/fao-wiews'
import { getHighContrastTextColor } from '@/mixins/colors'
import { isPageAvailable } from '@/mixins/util'
import { userIsAtLeast, USER_TYPE_DATA_CURATOR } from '@/mixins/api/auth'

import { mdiBarley, mdiBarcode, mdiCheckboxBlankOutline, mdiCheckboxMarkedOutline, mdiChevronUp, mdiInformationOutline, mdiShovel, mdiHomeCity, mdiHandHeartOutline, mdiBookOpenVariant, mdiChevronLeft, mdiChevronRight, mdiOpenInNew, mdiDatabase, mdiPlus, mdiGroup, mdiShieldCheckOutline } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

const DATASETS_PER_PAGE = 4

// How long each reference image stays in the header background
const REFERENCE_IMAGE_INTERVAL = 15000

// Fields of the Overview block, in the order and with the labels of the MCPD block of the original passport page.
// "code" is the MCPD acronym and "description" its MCPD definition, both shown in the popover of the field.
const OVERVIEW_FIELDS = [{
  key: 'puid',
  i18n: 'widgetMcpdPuid',
  doi: true,
  code: 'PUID',
  description: 'Any persistent, unique identifier assigned to the accession so it can be unambiguously referenced at the global level and the information associated with it harvested through automated means.'
}, {
  key: 'accename',
  i18n: 'widgetMcpdAccessionName',
  code: 'ACCENAME',
  description: 'Either a registered or other designation given to the material received, other than the donor’s accession number or collecting number.'
}, {
  key: 'accenumb',
  i18n: 'widgetMcpdAccessionNumber',
  code: 'ACCENUMB',
  description: 'This is the unique identifier for accessions within a genebank, and is assigned when a sample is entered into the genebank collection.'
}, {
  key: 'sampstat',
  i18n: 'widgetMcpdBiologicalStatus',
  codes: MCPD_SAMPSTAT,
  code: 'SAMPSTAT',
  description: 'Biological status of the accession (e.g., wild, weedy, traditional cultivar/landrace, breeding material). The coding scheme proposed can be used at 3 different levels of detail: either by using the general codes (in boldface) such as 100, 200, 300, 400, or by using the more specific codes such as 110, 120, etc.'
}, {
  key: 'collsrc',
  i18n: 'widgetMcpdCollectingSource',
  values: MCPD_COLLSRC,
  code: 'COLLSRC',
  description: 'The source of the sample (e.g., wild habitat, farm, market). The coding scheme proposed can be used at 2 different levels of detail: either by using the general codes (in boldface) such as 10, 20, 30, 40, etc., or by using the more specific codes, such as 11, 12, etc.'
}, {
  key: 'collnumb',
  i18n: 'widgetMcpdCollectingNumber',
  code: 'COLLNUMB',
  description: 'Original identifier assigned by the collector(s) of the sample, normally composed of the name or initials of the collector(s) followed by a number.'
}, {
  key: 'genus',
  i18n: 'widgetMcpdGenus',
  italic: true,
  code: 'GENUS',
  description: 'Genus name for taxon. Initial uppercase letter required.'
}, {
  key: 'species',
  i18n: 'widgetMcpdSpecies',
  italic: true,
  code: 'SPECIES',
  description: 'Specific epithet portion of the scientific name in lowercase letters. Only the following abbreviation is allowed: ‘sp.’'
}, {
  key: 'cropname',
  i18n: 'widgetMcpdCropName',
  code: 'CROPNAME',
  description: 'Common name of the crop.'
}, {
  key: 'spauthor',
  i18n: 'widgetMcpdSpeciesAuth',
  code: 'SPAUTHOR',
  description: 'Provide the authority for the species name.'
}, {
  key: 'subtaxa',
  i18n: 'widgetMcpdSubtaxon',
  code: 'SUBTAXA',
  description: 'Subtaxon can be used to store any additional taxonomic identifier. The following abbreviations are allowed: ‘subsp.’ (for subspecies); ‘convar.’ (for convariety); ‘var.’ (for variety); ‘f.’ (for form); ‘Group’ (for ‘cultivar group’).'
}, {
  key: 'subtauthor',
  i18n: 'widgetMcpdSubtaxonAuth',
  code: 'SUBTAUTHOR',
  description: 'Provide the subtaxon authority at the most detailed taxonomic level.'
}, {
  key: 'origcty',
  i18n: 'widgetMcpdCountry',
  country: true,
  code: 'ORIGCTY',
  description: '3-letter ISO 3166-1 code of the country in which the sample was originally collected.'
}, {
  key: 'colldate',
  i18n: 'widgetMcpdColldate',
  code: 'COLLDATE',
  description: 'Collecting date of the sample, where YYYY is the year, MM is the month, and DD is the day.'
}, {
  key: 'storage',
  i18n: 'widgetMcpdStorage',
  codes: MCPD_STORAGE,
  code: 'STORAGE',
  description: 'If germplasm is maintained under different types of storage.'
}, {
  key: 'mlsstat',
  i18n: 'widgetMcpdMlsStatus',
  // Only 0 and 1 are valid, anything else counts as no value
  format: value => ({ 0: '0 - No', 1: '1 - Yes' })[`${value}`.trim()] || null,
  code: 'MLSSTAT',
  description: 'The status of an accession with regards to the Multilateral System (MLS) of the International Treaty on Plant Genetic Resources for Food and Agriculture.'
}, {
  // The synonyms of the original passport page, which come with the germplasm row instead of the MCPD
  key: 'synonyms',
  source: 'germplasm',
  i18n: 'widgetMcpdOtherIdentifiers',
  code: 'OTHERNUMB',
  description: 'Any other identifiers known to exist in other collections for this accession.'
}]
const INSTITUTIONS_PER_PAGE = 4

// Maintenance institutions are always listed first, the others keep the order they come in
const sortInstitutions = institutions => institutions
  .map((institution, index) => ({ institution, index, first: institution.institutionType === 'maintenance' ? 0 : 1 }))
  .sort((a, b) => a.first - b.first || a.index - b.index)
  .map(item => item.institution)
const PUBLICATIONS_PER_PAGE = 4

// CSL fields can be a plain value or a list, and titles can contain markup like <i>
const getCslText = value => {
  const text = Array.isArray(value) ? value[0] : value
  return text ? `${text}`.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : null
}

// Reads what the publication card of the original page shows from the cached citation ("publicationFallbackCache")
const toPassportPublication = publication => {
  let cache = {}

  try {
    cache = publication.publicationFallbackCache ? JSON.parse(publication.publicationFallbackCache) : {}
  } catch (e) {
    cache = {}
  }

  const dateParts = cache.issued && cache.issued['date-parts'] && cache.issued['date-parts'][0]
  const doi = publication.publicationDoi

  return {
    id: publication.publicationId,
    title: getCslText(cache.title) || 'N/A',
    year: dateParts && dateParts.length > 0 ? dateParts[0] : null,
    source: getCslText(cache['container-title']),
    // "Read more" on the original page uses the citation URL, else the DOI
    url: cache.URL || (doi ? (doi.startsWith('http') ? doi : `https://doi.org/${doi}`) : null)
  }
}

// Institution names that mean "unknown": the name is then looked up on FAO WIEWS
const isMissingName = name => !name || `${name}`.trim() === '' || `${name}`.trim().toUpperCase() === 'N/A'

// Used for dataset types this page does not know
const UNKNOWN_DATASET_TYPE = {
  path: mdiDatabase,
  color: () => null,
  text: () => ''
}

export default {
  components: {
    LocationMap,
    DatasetEditModal,
    AddPublicationModal,
    PassportImageGallery,
    PedigreeDefinitionTable,
    PedigreeTable,
    PedigreeChart,
    EntityTable,
    GermplasmTraitStats,
    MdiIcon
  },
  data: function () {
    return {
      // Static first version of the page. Every block will be connected to the passport data one at a time.
      // Index of the open tab, 0 is Passport
      tabIndex: 0,
      // Row of this accession from the germplasm table. Null until loaded.
      germplasm: null,
      // MCPD of this accession, as on the original passport page. Null until loaded.
      mcpd: null,
      // Germplasm groups the accession belongs to
      groups: [],
      // Value of the IN-SITU attribute of the accession. Undefined until loaded, null when it has none.
      inSituValue: undefined,
      // Images of the accession marked as reference image, shown in the header background
      referenceImages: [],
      referenceImageIndex: 0,
      referenceImageTimer: null,
      // Number of traits with performance data for this germplasm, the tab only shows when there are any
      traitStatsCount: 0,
      // Current page of the datasets of this accession
      datasets: [],
      datasetTotal: 0,
      datasetPage: 1,
      // All institutions of this accession (maintenance first), shown 4 at a time
      institutions: [],
      institutionPage: 1,
      // Names found on FAO WIEWS for institutions without one, keyed by institution code. Undefined while loading.
      wiewsNames: {},
      // All publications of this accession, shown 4 at a time
      publications: [],
      publicationPage: 1,
      // Which panels are expanded
      open: {
        overview: true,
        location: true,
        datasets: true,
        institutions: true,
        publications: true
      },
      icons: {
        wheat: mdiBarley,
        barcode: mdiBarcode,
        unchecked: mdiCheckboxBlankOutline,
        checked: mdiCheckboxMarkedOutline,
        chevronUp: mdiChevronUp,
        info: mdiInformationOutline,
        trials: mdiShovel,
        maintenance: mdiHandHeartOutline,
        collection: mdiHomeCity,
        publication: mdiBookOpenVariant,
        chevronLeft: mdiChevronLeft,
        chevronRight: mdiChevronRight,
        openInNew: mdiOpenInNew,
        plus: mdiPlus,
        group: mdiGroup,
        standard: mdiShieldCheckOutline
      }
    }
  },
  computed: {
    ...mapGetters([
      'storeToken',
      'storeMarkedGermplasm'
    ]),
    isMarked: function () {
      return !!this.germplasm && this.storeMarkedGermplasm.indexOf(this.germplasm.germplasmId) !== -1
    },
    isDataCurator: function () {
      return !!this.storeToken && userIsAtLeast(this.storeToken.userType, USER_TYPE_DATA_CURATOR)
    },
    publicationPageCount: function () {
      return Math.ceil(this.publications.length / PUBLICATIONS_PER_PAGE)
    },
    publicationsOnPage: function () {
      const start = (this.publicationPage - 1) * PUBLICATIONS_PER_PAGE
      return this.publications.slice(start, start + PUBLICATIONS_PER_PAGE)
    },
    // Accession > Plant/Plot > Sample
    entityLevels: function () {
      return ['Accession', 'Plant/Plot', 'Sample'].map(name => ({ name: name, type: entityTypes[name] }))
    },
    // Same filter as the entity table of the original passport page: this germplasm as parent or as child
    entityFilter: function () {
      const id = this.germplasm ? this.germplasm.germplasmId : null
      return [{
        column: { name: 'entityParentId', type: Number },
        comparator: 'equals',
        operator: 'or',
        values: [id],
        canBeChanged: false
      }, {
        column: { name: 'entityChildId', type: Number },
        comparator: 'equals',
        operator: 'or',
        values: [id],
        canBeChanged: false
      }]
    },
    // Same filters as the pedigree tables of the original passport page
    pedigreeFilter: function () {
      const id = this.germplasm ? this.germplasm.germplasmId : null
      return [{
        column: { name: 'parentId', type: Number },
        comparator: 'equals',
        operator: 'or',
        values: [id],
        canBeChanged: false
      }, {
        column: { name: 'childId', type: Number },
        comparator: 'equals',
        operator: 'or',
        values: [id],
        canBeChanged: false
      }]
    },
    pedigreeDefinitionFilter: function () {
      return [{
        column: { name: 'germplasmId', type: Number },
        comparator: 'equals',
        operator: 'and',
        values: [this.germplasm ? this.germplasm.germplasmId : null],
        canBeChanged: false
      }]
    },
    institutionsOnPage: function () {
      const start = (this.institutionPage - 1) * INSTITUTIONS_PER_PAGE
      return this.institutions.slice(start, start + INSTITUTIONS_PER_PAGE)
    },
    institutionPageCount: function () {
      return Math.ceil(this.institutions.length / INSTITUTIONS_PER_PAGE)
    },
    // The group shown in the header: the first germplasm group that is a flagship crop, else the first germplasm group
    // PDCI of the accession (0 to 10), null when it has none
    pdci: function () {
      const value = this.germplasm ? this.germplasm.pdci : null
      return value === null || value === undefined || isNaN(value) ? null : Math.min(10, Math.max(0, Number(value)))
    },
    pdciText: function () {
      return this.pdci === null ? '0.00/0' : `${this.pdci.toFixed(2)}/10`
    },
    // 10 fills the whole bar. The bar moves in whole steps: the PDCI is rounded to the nearest integer first.
    pdciFillPercent: function () {
      return this.pdci === null ? 0 : Math.round(this.pdci) * 10
    },
    accessionNumber: function () {
      return (this.mcpd && this.mcpd.accenumb) || (this.germplasm && this.germplasm.germplasmName) || null
    },
    accessionName: function () {
      return this.mcpd && this.mcpd.accename ? `${this.mcpd.accename}`.trim() : null
    },
    taxonomy: function () {
      if (!this.mcpd) {
        return null
      }

      return [this.mcpd.genus, this.mcpd.species, this.mcpd.spauthor]
        .filter(v => v !== null && v !== undefined && `${v}`.trim() !== '')
        .map(v => `${v}`.trim())
        .join(' ') || null
    },
    cropGroup: function () {
      const groups = this.groups
        .filter(g => g.groupType === 'germinatebase')
        .map(g => ({ groupName: g.groupName, crop: findFlagshipCrop(g.groupName) }))

      return groups.find(g => g.crop) || groups[0] || null
    },
    conservation: function () {
      if (this.inSituValue === undefined) {
        return null
      }

      return this.inSituValue !== null && `${this.inSituValue}`.trim() === '1' ? 'In-situ' : 'Ex-situ'
    },
    overviewFields: function () {
      if (!this.mcpd) {
        return []
      }

      return OVERVIEW_FIELDS.map(field => {
        const record = field.source === 'germplasm' ? (this.germplasm || {}) : this.mcpd
        let raw = record[field.key]

        // Lists (e.g. synonyms) are shown separated by "; "
        if (Array.isArray(raw)) {
          raw = raw.filter(v => v !== null && v !== undefined && `${v}`.trim() !== '').map(v => `${v}`.trim()).join('; ')
        }

        const hasValue = raw !== null && raw !== undefined && `${raw}`.trim() !== ''
        const result = {
          code: field.code,
          label: this.$t(field.i18n),
          description: field.description,
          italic: field.italic,
          value: hasValue ? `${raw}`.trim() : null
        }

        if (hasValue && field.format) {
          result.value = field.format(raw)
        } else if (hasValue && field.codes) {
          // "<code> - <name>", several codes separated by "; "
          result.value = formatMcpdCodes(raw, field.codes)
        } else if (hasValue && field.values) {
          // Coded values, shown with their description like on the original page
          result.value = field.values[raw] || result.value
        } else if (hasValue && field.country) {
          result.flag = getCountryFlagCode(result.value)
          result.value = getCountryName(result.value) || result.value
        } else if (hasValue && field.doi) {
          result.link = result.value.startsWith('http') ? result.value : `https://doi.org/${result.value}`
        }

        return result
      })
    },
    datasetPageCount: function () {
      return Math.ceil(this.datasetTotal / DATASETS_PER_PAGE)
    },
    // Same location object as on the original passport page, null without coordinates
    location: function () {
      const g = this.germplasm

      if (!g || g.latitude === null || g.latitude === undefined || g.longitude === null || g.longitude === undefined) {
        return null
      }

      return {
        locationId: g.locationId !== undefined ? g.locationId : -1,
        locationLatitude: g.latitude,
        locationLongitude: g.longitude,
        locationElevation: g.elevation,
        locationName: g.location,
        locationType: 'collectingsites',
        countryName: g.countryName,
        countryCode2: g.countryCode,
        countryCode3: null
      }
    },
    // Same as the original passport page: the barcode is made from the germplasm name
    barcodeUrl: function () {
      const name = this.germplasm ? this.germplasm.germplasmName : ''
      return `https://cropgeeks.github.io/humbug/#/import?barcodes=${encodeURIComponent(name || '')}`
    }
  },
  watch: {
    // The map was hidden while another tab was open, so Leaflet has to measure it again
    tabIndex: function (newValue) {
      if (newValue === 0 && this.$refs.map) {
        this.$nextTick(() => this.$refs.map.invalidateSize())
      }
    }
  },
  methods: {
    toggle: function (panel) {
      this.open[panel] = !this.open[panel]

      // Leaflet has to re-measure a map that was hidden
      if (panel === 'location' && this.open.location && this.$refs.map) {
        this.$refs.map.invalidateSize()
      }
    },
    getWiewsOrganisationUrl,
    // "2026 · CABI Agriculture and Bioscience"
    getPublicationMeta: function (publication) {
      return [publication.year, publication.source].filter(v => v).join(' · ')
    },
    deletePublicationReference: function (publication) {
      this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
        okVariant: 'danger',
        okTitle: this.$t('genericYes'),
        cancelTitle: this.$t('genericNo')
      })
        .then(value => {
          if (value) {
            apiDeletePublicationReference(publication.id, 'germplasm', this.germplasm.germplasmId, () => {
              this.loadPublications()
              // Germinate removes a publication left without any link, which changes the sidebar count
              emitter.emit('update-sidebar-menu')
            })
          }
        })
    },
    onPublicationAdded: function () {
      this.loadPublications()
      emitter.emit('update-sidebar-menu')
    },
    loadGroups: function () {
      apiPostGermplasmGroupTable(this.germplasm.germplasmId, { page: 1, limit: MAX_JAVA_INTEGER }, result => {
        this.groups = (result && result.data) ? result.data : []
      })
    },
    // Same attributes as the "Additional attributes" of the original passport page, only the one named exactly IN-SITU
    loadInSitu: function () {
      const query = {
        page: 1,
        limit: 1,
        filter: [{
          column: 'germplasmId',
          comparator: 'equals',
          operator: 'and',
          values: [this.germplasm.germplasmId]
        }, {
          column: 'attributeName',
          comparator: 'equals',
          operator: 'and',
          values: ['IN-SITU']
        }]
      }

      apiPostGermplasmAttributeTable(query, result => {
        const attribute = (result && result.data) ? result.data.find(a => a.attributeName === 'IN-SITU') : null
        this.inSituValue = attribute ? attribute.attributeValue : null
      })
    },
    getReferenceImageSrc: function (image) {
      return getImageUrl(image.imagePath, {
        name: image.imagePath,
        token: this.storeToken ? this.storeToken.imageToken : null,
        type: 'database',
        size: 'large'
      })
    },
    loadReferenceImages: function () {
      if (!this.germplasm) {
        return
      }

      const filter = [{
        column: 'imageForeignId',
        comparator: 'equals',
        operator: 'and',
        values: [this.germplasm.germplasmId]
      }, {
        column: 'imageRefTable',
        comparator: 'equals',
        operator: 'and',
        values: ['germinatebase']
      }, {
        column: 'imageIsReference',
        comparator: 'equals',
        operator: 'and',
        values: [1]
      }]

      apiPostImages({ page: 1, limit: MAX_JAVA_INTEGER, orderBy: 'createdOn', ascending: 0, filter: filter }, result => {
        this.referenceImages = ((result && result.data) || []).filter(i => i.imageIsReference)
        this.referenceImageIndex = 0
        this.startReferenceImageTimer()
      })
    },
    // Only runs with more than one reference image
    startReferenceImageTimer: function () {
      this.stopReferenceImageTimer()

      if (this.referenceImages.length > 1) {
        this.referenceImageTimer = setInterval(() => {
          this.referenceImageIndex = (this.referenceImageIndex + 1) % this.referenceImages.length
        }, REFERENCE_IMAGE_INTERVAL)
      }
    },
    stopReferenceImageTimer: function () {
      if (this.referenceImageTimer) {
        clearInterval(this.referenceImageTimer)
        this.referenceImageTimer = null
      }
    },
    // Same data as the trait performance section of the original passport page, here only to know whether to show the tab
    loadTraitStatsCount: function () {
      apiGetGermplasmStatsTraits(this.germplasm.germplasmId, result => {
        this.traitStatsCount = Array.isArray(result) ? result.length : 0
      })
    },
    loadMcpd: function () {
      if (!this.germplasm) {
        return
      }

      apiGetGermplasmMcpd(this.germplasm.germplasmId, result => {
        this.mcpd = result || null
      })
    },
    toggleMarked: function () {
      if (!this.germplasm) {
        return
      }

      const payload = { type: 'germplasm', ids: [this.germplasm.germplasmId] }
      this.$store.dispatch(this.isMarked ? 'removeMarkedIds' : 'addMarkedIds', payload)
    },
    getEntityData: function (data, callback) {
      return apiPostEntityTable(data, callback)
    },
    getEntityLevelStyle: function (level) {
      const color = level.type.color() || '#6b6f6c'
      return { background: color, color: getHighContrastTextColor(color) }
    },
    getPedigreeData: function (data, callback) {
      return apiPostPedigreeTable(data, callback)
    },
    getPedigreeDefinitionData: function (data, callback) {
      return apiPostPedigreedefinitionTable(data, callback)
    },
    addPublication: function () {
      this.$refs.addPublicationModal.show()
    },
    loadPublications: function () {
      if (!this.germplasm) {
        return
      }

      apiGetPublications('germplasm', this.germplasm.germplasmId, result => {
        this.publications = (result || []).map(toPassportPublication)
        this.publicationPage = Math.min(this.publicationPage, Math.max(1, this.publicationPageCount))
      })
    },
    addDataset: function () {
      this.$refs.datasetEditModal.show()
    },
    getInstitutionType: function (institution) {
      return germplasmInstitutionTypes[institution.institutionType] || UNKNOWN_DATASET_TYPE
    },
    // Icon background follows the institution type colour, the icon colour is picked for contrast
    getInstitutionTypeStyle: function (institution) {
      const color = this.getInstitutionType(institution).color() || '#6b6f6c'
      return { background: color, color: getHighContrastTextColor(color) }
    },
    // The Germinate name, or else the FAO WIEWS name, or else "N/A"
    getInstitutionName: function (institution) {
      if (!isMissingName(institution.institutionName)) {
        return institution.institutionName
      }

      const code = institution.institutionCode ? institution.institutionCode.toUpperCase() : null
      const found = code ? this.wiewsNames[code] : null

      if (found === undefined) {
        return '…'
      }

      return found || 'N/A'
    },
    lookUpMissingNames: function () {
      this.institutions
        .filter(i => isMissingName(i.institutionName) && i.institutionCode)
        .map(i => i.institutionCode.toUpperCase())
        .filter((code, index, codes) => codes.indexOf(code) === index && !(code in this.wiewsNames))
        .forEach(code => {
          this.$set(this.wiewsNames, code, undefined)
          getWiewsInstitutionName(code).then(name => {
            this.wiewsNames[code] = name
          })
        })
    },
    // All institutions are loaded so maintenance ones can come first across pages, then shown 4 at a time
    loadInstitutions: function () {
      if (!this.germplasm) {
        return
      }

      apiPostGermplasmInstitutionTable(this.germplasm.germplasmId, { page: 1, limit: MAX_JAVA_INTEGER }, result => {
        this.institutions = sortInstitutions((result && result.data) ? result.data : [])
        this.institutionPage = 1
        this.lookUpMissingNames()
      })
    },
    getDatasetType: function (dataset) {
      return datasetTypes[dataset.datasetType] || UNKNOWN_DATASET_TYPE
    },
    // Icon background follows the dataset type colour, the icon colour is picked for contrast
    getDatasetTypeStyle: function (dataset) {
      const color = this.getDatasetType(dataset).color() || '#6b6f6c'
      return { background: color, color: getHighContrastTextColor(color) }
    },
    // Same check as the datasets table: has the current user (or the anonymous user) accepted the licence
    isLicenseAccepted: function (dataset) {
      const userId = this.storeToken ? this.storeToken.id : -1000
      return !!dataset.acceptedBy && dataset.acceptedBy.indexOf(userId) !== -1
    },
    // Same rules as the dataset name in the datasets table: external hyperlink, else the page of the dataset type, else no link
    getDatasetLink: function (dataset) {
      const type = this.getDatasetType(dataset)

      if (dataset.hyperlink && dataset.isExternal) {
        return { tag: 'a', attributes: { href: dataset.hyperlink, target: '_blank', rel: 'noopener noreferrer' } }
      }

      if (!dataset.isExternal && type.pageName && isPageAvailable(dataset.datasetType) && (!dataset.licenseName || this.isLicenseAccepted(dataset))) {
        return { tag: 'router-link', attributes: { to: { name: type.pageName, params: { datasetIds: dataset.datasetId.toString() } } } }
      }

      return { tag: 'div', attributes: {} }
    },
    loadDatasets: function (page) {
      if (!this.germplasm) {
        return
      }

      const query = {
        page: page,
        limit: DATASETS_PER_PAGE,
        prevCount: -1,
        orderBy: 'datasetName',
        ascending: 1
      }

      apiPostGermplasmDatasetTable(this.germplasm.germplasmId, query, result => {
        this.datasets = (result && result.data) ? result.data : []
        this.datasetTotal = (result && result.count) || 0
        this.datasetPage = page
      })
    },
    // Like the original passport page: the URL holds the germplasm id, or else its name, display name or PUID
    loadGermplasm: function () {
      const param = this.$route.params.germplasmId
      let filter

      if (param === undefined || param === null || param === '') {
        return
      }

      if (isNaN(param)) {
        filter = ['germplasmName', 'germplasmDisplayName', 'germplasmPuid'].map(column => ({
          column: column,
          comparator: 'equals',
          operator: 'or',
          values: [param]
        }))
      } else {
        filter = [{
          column: 'germplasmId',
          comparator: 'equals',
          operator: 'and',
          values: [parseInt(param)]
        }]
      }

      apiPostGermplasmTable({ page: 1, limit: 1, filter: filter }, result => {
        this.germplasm = (result && result.data && result.data.length > 0) ? result.data[0] : null
        this.loadMcpd()
        this.loadGroups()
        this.loadInSitu()
        this.loadReferenceImages()
        this.loadTraitStatsCount()
        this.loadDatasets(1)
        this.loadInstitutions()
        this.loadPublications()
      })
    }
  },
  beforeDestroy: function () {
    this.stopReferenceImageTimer()
  },
  mounted: function () {
    this.loadGermplasm()
  }
}
</script>

<style src="@/assets/custom-page.css"></style>

<style scoped>
.passport-page {
  /* Colours only used on this page, with their dark mode version below */
  --pp-code: #6a9a3c;
  --pp-mark: #000000;
  --pp-header-veil: rgba(255, 255, 255, 0.72);
  --pp-header-button: rgba(255, 255, 255, 0.85);
  --pp-barcode: #2c7da0;
  --pp-barcode-icon: #000000;

  /* Same content width as the home page */
  max-width: 1240px;
  margin: 0 auto;
  padding: 0.5rem 0 3rem;
}
body.dark-mode .passport-page {
  --pp-code: #9fd18f;
  /* Black would not be visible on the dark background */
  --pp-mark: #e8e6e3;
  --pp-header-veil: rgba(31, 34, 35, 0.78);
  --pp-header-button: rgba(31, 34, 35, 0.85);
  --pp-barcode: #7cc4e0;
  /* Black would not be visible on the dark background */
  --pp-barcode-icon: #e8e6e3;
}

.pp-card {
  background: var(--cp-surface);
  border: 1px solid var(--cp-border);
  border-radius: 12px;
}

/* Header */
.pp-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 1.75rem 2rem;
}
/* Takes the free space so a long accession name gets cut instead of pushing the buttons down */
.pp-header-main {
  flex: 1 1 320px;
  min-width: 0;
}

/* Reference images behind the header: blurred, with a veil in the card colour so the text stays readable */
.pp-header {
  position: relative;
  overflow: hidden;
}
.pp-header > .pp-header-main,
.pp-header > .pp-header-actions {
  position: relative;
  z-index: 1;
}
.pp-header-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.pp-header-image {
  position: absolute;
  /* Larger than the header so the blurred edges stay outside of it */
  inset: -24px;
  background-position: center;
  background-size: cover;
  filter: blur(8px);
  opacity: 0;
  transition: opacity 2s ease-in-out;
}
.pp-header-image.active {
  opacity: 1;
}
.pp-header-veil {
  position: absolute;
  inset: 0;
  background: var(--pp-header-veil);
}
/* The buttons get a bit of the veil too, so they stand out on the image */
.pp-header-has-image .pp-action-button:not(.marked) {
  background: var(--pp-header-button);
}
@media (prefers-reduced-motion: reduce) {
  .pp-header-image {
    transition: none;
  }
}
.pp-header-crop {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.pp-crop-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border-width: 1px;
  border-style: solid;
}
.pp-crop-name {
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--cp-muted);
}
.pp-status-badge {
  font-style: italic;
  padding: 0.05rem 0.7rem;
  border: 1px solid var(--cp-green);
  border-radius: 6px;
  background: var(--cp-green-soft);
  color: var(--cp-green);
  font-size: 0.85rem;
}
.pp-title {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  min-width: 0;
  margin: 0.9rem 0 0.25rem;
  font-size: 2.2rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.pp-title-main {
  flex-shrink: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pp-title-secondary {
  flex: 0 1 auto;
  min-width: 0;
  font-size: 1.15rem;
  font-weight: 400;
  color: var(--cp-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pp-taxonomy {
  font-size: 1.1rem;
  font-style: italic;
  color: var(--cp-muted);
}

.pp-header-actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.75rem;
  min-width: 260px;
}
.pp-action-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1rem;
  border: 1px solid var(--cp-border);
  border-radius: 10px;
  background: var(--cp-surface);
  color: var(--cp-text);
  font: inherit;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.pp-action-button:hover {
  color: var(--cp-text);
  text-decoration: none;
  background: var(--cp-surface-hover);
  border-color: var(--cp-green);
}
.pp-action-icon {
  display: inline-flex;
}
.pp-action-mark {
  color: var(--pp-mark);
}
/* Marked: green, like the active "Search within" chip on the home page */
.pp-action-button.marked,
.pp-action-button.marked:hover {
  border-color: var(--cp-green);
  background: var(--cp-green-soft);
  color: var(--cp-green);
}
.pp-action-button.marked .pp-action-mark {
  color: var(--cp-green);
}
.pp-action-button:disabled {
  opacity: 0.6;
  cursor: default;
}
.pp-action-barcode {
  color: var(--pp-barcode-icon);
}
.pp-pdci {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding-top: 0.25rem;
}
.pp-pdci-bar {
  flex: 1;
  height: 12px;
  border-radius: 4px;
  background: var(--cp-neutral-bg);
  overflow: hidden;
}
.pp-pdci-fill {
  display: block;
  height: 100%;
  border-radius: 4px;
  background: var(--cp-green);
}
.pp-pdci-text {
  font-weight: 600;
  white-space: nowrap;
}
.pp-info {
  display: inline-flex;
  color: var(--cp-muted);
  cursor: help;
}
.pp-info-button {
  padding: 0;
  border: none;
  background: transparent;
}
.pp-info-button:hover,
.pp-info-button:focus-visible {
  color: var(--pp-code);
}

/* Tabs (Bootstrap), in the look of the custom pages. No scrolling: the tabs wrap when there is no room. */
.pp-tabs {
  margin-top: 1.5rem;
}
.pp-tabs >>> .pp-tabs-nav {
  flex-wrap: wrap;
  border-bottom: 1px solid var(--cp-border);
}
.pp-tabs >>> .pp-tabs-nav .nav-link {
  padding: 0.7rem 1.25rem;
  border: 1px solid transparent;
  border-radius: 10px 10px 0 0;
  color: var(--cp-muted);
  font-weight: 600;
}
.pp-tabs >>> .pp-tabs-nav .nav-link:hover,
.pp-tabs >>> .pp-tabs-nav .nav-link:focus {
  border-color: transparent;
  color: var(--cp-text);
}
.pp-tabs >>> .pp-tabs-nav .nav-link.active {
  border-color: var(--cp-border) var(--cp-border) var(--cp-surface);
  background: var(--cp-surface);
  color: var(--cp-text);
}
.pp-tab-panel {
  margin-top: 1.25rem;
}
/* Text that explains a tab, like the section texts of the original passport page */
.pp-tab-intro {
  margin: 0 0 1.25rem;
  line-height: 1.6;
  color: var(--cp-muted);
}
.pp-tab-card {
  min-width: 0;
  margin-bottom: 1.5rem;
  padding: 1.25rem 1.5rem;
}
.pp-tab-card-title {
  margin: 0 0 0.75rem;
  font-size: 1.05rem;
  font-weight: 600;
}
/* Wide tables and charts scroll inside their card, the page itself does not */
.pp-scroll {
  max-width: 100%;
  overflow-x: auto;
}
/* The trait performance component brings its own card, here it sits inside ours */
.pp-trait-stats >>> .card {
  border: none;
  background: transparent;
}
.pp-trait-stats >>> .card-body {
  padding: 0;
}
/* The traits come in a Bootstrap row, whose negative margins made the card scroll sideways.
   Here they form a grid that wraps onto as many rows as needed. */
.pp-trait-stats >>> .card-body > div > .row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin: 0 0 1rem;
}
.pp-trait-stats >>> .card-body > div > .row > [class*="col"] {
  max-width: none;
  padding: 0;
}

/* Entity hierarchy */
.pp-entity-levels {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1.5rem;
  padding: 0;
  list-style: none;
}
.pp-entity-level {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--cp-muted);
}
.pp-entity-level > span:last-child {
  padding: 0.3rem 0.8rem 0.3rem 0;
}
.pp-entity-level.current > span:last-child {
  color: var(--cp-text);
  font-weight: 600;
}
.pp-entity-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  opacity: 0.55;
}
.pp-entity-level.current .pp-entity-icon {
  opacity: 1;
  box-shadow: 0 0 0 3px var(--cp-green-soft);
}

/* The chart component has no content without pedigree datasets: hide the empty card */
.pp-pedigree-chart:not(:has(.pedigree-chart, select)) {
  display: none;
}
.pp-pedigree-chart >>> h4 {
  margin: 0 0 0.75rem;
  font-size: 1.05rem;
  font-weight: 600;
}
.pp-tab-empty {
  margin: 1.5rem 0;
  color: var(--cp-muted);
}

/* Passport tab: overview on the left, the other panels on the right */
.pp-tab-content {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 1.75rem;
  align-items: start;
  margin-top: 1.25rem;
}
.pp-main {
  min-width: 0;
}
.pp-standard-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
  color: var(--cp-muted);
}
.pp-standard-note >>> .mdi-icon-wrapper {
  display: inline-flex;
  flex-shrink: 0;
  color: var(--cp-green);
}
.pp-side {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;
}

/* Panels */
.pp-panel {
  overflow: hidden;
}
.pp-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1.1rem 1.5rem;
  border: none;
  border-bottom: 1px solid var(--cp-border);
  background: transparent;
  color: var(--cp-text);
  font: inherit;
  text-align: left;
  cursor: pointer;
}
/* Header with its own buttons (title + add, collapse) */
.pp-panel-heading {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
}
.pp-panel-add,
.pp-panel-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.pp-panel-add {
  width: 26px;
  height: 26px;
  border: 1px solid var(--cp-green);
  border-radius: 6px;
  background: var(--cp-green-soft);
  color: var(--cp-green);
}
.pp-panel-add:hover {
  background: var(--cp-green);
  color: var(--cp-on-button);
}
.pp-item-empty {
  color: var(--cp-muted);
  font-size: 0.9rem;
}
.pp-panel-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
}
.pp-panel-chevron {
  display: inline-flex;
  color: var(--cp-muted);
  transition: transform 0.2s;
}
.pp-panel-chevron.closed {
  transform: rotate(180deg);
}

/* Overview fields */
.pp-field {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 1rem;
  padding: 0.9rem 1.5rem;
}
.pp-field + .pp-field {
  border-top: 1px solid var(--cp-border);
}
.pp-field-code {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--pp-code);
}
.pp-field-label {
  margin-top: 0.15rem;
  font-size: 0.85rem;
  color: var(--cp-muted);
}
.pp-field-value {
  font-size: 1rem;
  overflow-wrap: anywhere;
}
.pp-field-value.italic {
  font-style: italic;
}
.pp-field-link {
  display: inline-flex;
  margin-left: 0.3rem;
  vertical-align: -2px;
  color: var(--cp-green);
}
.pp-field-link:hover {
  color: var(--cp-green-hover);
}
.pp-field-empty {
  color: var(--cp-muted);
}

/* Map */
/* The shared map component is 600px high, here it follows the size of the block */
.pp-map >>> .location-map {
  height: 260px !important;
}

/* Items of the side panels */
.pp-item {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.85rem 1.5rem;
}
.pp-item + .pp-item {
  border-top: 1px solid var(--cp-border);
}
.pp-item-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: #ffffff;
}
.pp-item-icon-neutral {
  background: var(--cp-green-soft);
  color: var(--cp-green);
}
.pp-item-body {
  min-width: 0;
}
.pp-item-title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.pp-item-title strong {
  margin-right: 0.3rem;
  font-weight: 600;
}
/* Rows that are links */
.pp-item-link {
  color: var(--cp-text);
  text-decoration: none;
  transition: background 0.15s;
}
.pp-item-link:hover,
.pp-item-link:focus-visible {
  background: var(--cp-surface-hover);
  color: var(--cp-text);
  text-decoration: none;
}
.pp-item-external {
  display: inline-flex;
  flex-shrink: 0;
  margin-left: auto;
  color: var(--cp-muted);
}

/* Institutions: code and type on the first line, name below */
.pp-institution {
  align-items: flex-start;
}
.pp-institution .pp-item-body {
  flex: 1 1 auto;
}
.pp-institution-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}
.pp-institution-code {
  font-weight: 600;
  white-space: nowrap;
}
.pp-institution-type {
  flex-shrink: 0;
  white-space: nowrap;
}
.pp-institution-name {
  margin-top: 0.1rem;
}

/* Publications: year with the journal (or other source) next to it */
/* Year and source on one line, cut with "..." when too long */
.pp-publication-meta {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
/* The title link covers the whole row */
.pp-publication {
  position: relative;
}
.pp-stretched-link {
  display: block;
  color: var(--cp-text);
  text-decoration: none;
}
.pp-stretched-link:hover {
  color: var(--cp-text);
  text-decoration: none;
}
.pp-stretched-link::after {
  content: '';
  position: absolute;
  inset: 0;
}
/* Sits above the stretched link so it can be clicked */
.pp-publication-delete {
  position: relative;
  z-index: 1;
  padding: 0;
  margin-top: 0.2rem;
  border: none;
  font-size: 0.85rem;
  line-height: 1.3;
}

/* Previous / next below a list */
.pp-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-top: 1px solid var(--cp-border);
}
.pp-pager-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--cp-text);
  cursor: pointer;
}
.pp-pager-button:hover:not(:disabled) {
  background: var(--cp-surface-hover);
}
.pp-pager-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.pp-pager-text {
  min-width: 3.5rem;
  font-size: 0.85rem;
  color: var(--cp-muted);
  text-align: center;
}

.pp-item-subtitle {
  font-size: 0.85rem;
  color: var(--cp-muted);
}

/* Responsive */
@media (max-width: 991px) {
  .pp-tab-content {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 575px) {
  .pp-header {
    padding: 1.25rem;
  }
  .pp-header-actions {
    min-width: 0;
    width: 100%;
  }
  .pp-title {
    font-size: 1.7rem;
  }
  .pp-field {
    grid-template-columns: 1fr;
    gap: 0.35rem;
  }
}
</style>
