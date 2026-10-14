<template>
  <!-- Same features as ImageGallery (original passport page), in the look of the custom pages -->
  <div class="pig">
    <!-- Toolbar: tag filter on the left, download and upload on the right -->
    <div class="pig-toolbar" v-if="tags.length > 0 || imageCount > 0 || canEdit">
      <div class="pig-tags" v-if="tags.length > 0">
        <span class="pig-tags-label">{{ $t('widgetImageTagsTitle') }}:</span>
        <button type="button" :class="['pig-chip', { active: selectedTag === null }]" :aria-pressed="selectedTag === null" @click="selectTag(null)">All</button>
        <button type="button"
                v-for="tag in tags"
                :key="'pig-tag-' + tag.tagId"
                :class="['pig-chip', { active: selectedTag !== null && selectedTag.tagId === tag.tagId }]"
                :aria-pressed="selectedTag !== null && selectedTag.tagId === tag.tagId"
                @click="selectTag(tag)">
          <MdiIcon :path="icons.tag" :size="14" /> {{ tag.tagName }}
        </button>
      </div>

      <div class="pig-actions">
        <button type="button" class="pig-button" @click="download" v-if="imageCount > 0">
          <MdiIcon :path="icons.download" :size="18" /> {{ $t('buttonDownloadImages') }}
        </button>
        <button type="button" class="pig-button pig-button-primary" @click="$refs.imageUploadModal.show()" v-if="canEdit">
          <MdiIcon :path="icons.upload" :size="18" /> {{ $t('buttonUpload') }}
        </button>
      </div>
    </div>

    <!-- Loading placeholders -->
    <div class="pig-grid" v-if="images === null">
      <div class="pig-card pig-card-placeholder" v-for="i in IMAGES_PER_PAGE" :key="'pig-placeholder-' + i">
        <div class="pig-thumb" />
      </div>
    </div>

    <!-- No images -->
    <div class="pig-empty" v-else-if="images.length === 0">
      <MdiIcon :path="icons.images" :size="40" />
      <p>{{ selectedTag ? 'There are no images with this tag.' : 'There are no images of this germplasm yet.' }}</p>
    </div>

    <template v-else>
      <div class="pig-grid">
        <div class="pig-card" v-for="(image, index) in images" :key="'pig-image-' + image.imageId">
          <!-- Thumbnail, opens the lightbox -->
          <button type="button" class="pig-thumb" @click="lightboxIndex = index" :aria-label="image.imageDescription || 'Open image'">
            <img :src="getSrc(image, 'small')" :alt="image.imageDescription || ''" loading="lazy" @load="$set(loaded, image.imageId, true)" />
            <span class="pig-thumb-loading" v-if="!loaded[image.imageId]" />
          </button>
          <span class="pig-reference" v-if="image.imageIsReference">{{ $t('tableColumnImageIsReference') }}</span>
          <button type="button" class="pig-delete" v-if="canEdit" @click="deleteImage(image)" :title="$t('buttonDelete')" :aria-label="$t('buttonDelete')">
            <MdiIcon :path="icons.delete" :size="16" />
          </button>

          <div class="pig-card-body">
            <!-- Date first, the description below it -->
            <div class="pig-meta" v-if="image.createdOn">
              <MdiIcon :path="icons.calendar" :size="14" /> {{ formatDate(image.createdOn) }}
            </div>

            <!-- Description: editable for data curators -->
            <template v-if="canEdit">
              <div class="pig-description-edit">
                <textarea v-model="image.imageDescription" rows="2" class="pig-textarea" :aria-label="'Description of image ' + (index + 1)" />
                <button type="button" class="pig-icon-button" @click="saveImage(image)" :title="$t('buttonUpdate')" :aria-label="$t('buttonUpdate')">
                  <MdiIcon :path="savedImageId === image.imageId ? icons.saved : icons.save" :size="18" />
                </button>
              </div>
              <b-form-checkbox switch v-model="image.imageIsReference" @change="saveImage(image)" class="pig-switch">
                {{ $t('tableColumnImageIsReference') }}
              </b-form-checkbox>
            </template>
            <p class="pig-description" v-else-if="image.imageDescription" :title="image.imageDescription">{{ image.imageDescription }}</p>

            <div class="pig-image-tags" v-if="(image.tags && image.tags.length > 0) || canEdit">
              <span class="pig-tag" v-for="(tag, tagIndex) in image.tags" :key="'pig-image-tag-' + image.imageId + '-' + tagIndex">{{ tag.tagName }}</span>
              <button type="button" class="pig-link" v-if="canEdit" @click="editTags(image)">
                <MdiIcon :path="icons.edit" :size="14" /> {{ $t('tooltipTagEdit') }}
              </button>
            </div>

            <button type="button" class="pig-link" v-if="hasExif(image)" @click="showExif(image)">
              <MdiIcon :path="icons.exif" :size="14" /> {{ $t('buttonShowExif') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination, 8 images per page -->
      <nav class="pig-pager" v-if="pageCount > 1" aria-label="Image pages">
        <button type="button" class="pig-pager-button" :disabled="page <= 1" @click="loadImages(page - 1)" aria-label="Previous page">
          <MdiIcon :path="icons.chevronLeft" :size="20" />
        </button>
        <button type="button"
                v-for="p in pageCount"
                :key="'pig-page-' + p"
                :class="['pig-pager-button', { active: p === page }]"
                :aria-current="p === page ? 'page' : null"
                @click="loadImages(p)">
          {{ p }}
        </button>
        <button type="button" class="pig-pager-button" :disabled="page >= pageCount" @click="loadImages(page + 1)" aria-label="Next page">
          <MdiIcon :path="icons.chevronRight" :size="20" />
        </button>
      </nav>
    </template>

    <CoolLightBox :items="lightboxItems" :index="lightboxIndex" effect="fade" @close="lightboxIndex = null" />

    <!-- The modals of the original gallery -->
    <ImageUploadModal v-if="canEdit" :foreignId="foreignId" :referenceTable="referenceTable" @images-updated="onImagesUploaded" ref="imageUploadModal" />
    <EditTagModal v-if="canEdit && tagImage" :imageId="tagImage.imageId" :allTags="tags" :prefilledTags="tagImage.tags || []" @tags-changed="onTagsChanged" ref="editTagModal" />
    <ImageExifModal v-if="exifImage" :image="exifImage" ref="imageExifModal" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CoolLightBox from 'vue-cool-lightbox'
import 'vue-cool-lightbox/dist/vue-cool-lightbox.min.css'

import MdiIcon from '@/components/icons/MdiIcon'
import ImageUploadModal from '@/components/modals/ImageUploadModal'
import EditTagModal from '@/components/modals/EditTagModal'
import ImageExifModal from '@/components/modals/ImageExifModal'

import { apiPostImages, apiPostImagesExport, apiGetImageTagsForId, apiDeleteImage, apiPatchImage } from '@/mixins/api/misc'
import { getImageUrl } from '@/mixins/image'
import { userIsAtLeast, USER_TYPE_DATA_CURATOR } from '@/mixins/api/auth'

import { mdiDownload, mdiUpload, mdiTag, mdiDelete, mdiContentSave, mdiCheck, mdiCalendarClock, mdiPencil, mdiImageText, mdiImageMultiple, mdiChevronLeft, mdiChevronRight } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

const IMAGES_PER_PAGE = 8

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default {
  components: {
    CoolLightBox,
    EditTagModal,
    ImageExifModal,
    ImageUploadModal,
    MdiIcon
  },
  props: {
    referenceTable: {
      type: String,
      default: 'germinatebase'
    },
    foreignId: {
      type: Number,
      default: null
    }
  },
  data: function () {
    return {
      IMAGES_PER_PAGE,
      // Images on the current page. Null until loaded.
      images: null,
      imageCount: 0,
      page: 1,
      // Tags of the images of this item, and the one used as filter (null shows all)
      tags: [],
      selectedTag: null,
      lightboxIndex: null,
      // Thumbnails that finished loading, keyed by image id
      loaded: {},
      tagImage: null,
      exifImage: null,
      // Image whose changes were just saved, to show a confirmation on its save button
      savedImageId: null,
      icons: {
        download: mdiDownload,
        upload: mdiUpload,
        tag: mdiTag,
        delete: mdiDelete,
        save: mdiContentSave,
        saved: mdiCheck,
        calendar: mdiCalendarClock,
        edit: mdiPencil,
        exif: mdiImageText,
        images: mdiImageMultiple,
        chevronLeft: mdiChevronLeft,
        chevronRight: mdiChevronRight
      }
    }
  },
  computed: {
    ...mapGetters([
      'storeToken'
    ]),
    // Same rights as the original gallery: data curators can upload, edit and delete
    canEdit: function () {
      return !!this.storeToken && !!this.storeToken.userType && userIsAtLeast(this.storeToken.userType, USER_TYPE_DATA_CURATOR)
    },
    pageCount: function () {
      return Math.ceil(this.imageCount / IMAGES_PER_PAGE)
    },
    lightboxItems: function () {
      return (this.images || []).map(i => ({ src: this.getSrc(i, 'large'), title: i.imageDescription }))
    }
  },
  watch: {
    foreignId: function () {
      this.refresh()
    }
  },
  methods: {
    getSrc: function (image, size) {
      return getImageUrl(image.imagePath, {
        name: image.imagePath,
        token: this.storeToken ? this.storeToken.imageToken : null,
        type: 'database',
        size: size
      })
    },
    // "12 Jan 2023"
    formatDate: function (value) {
      const date = new Date(value)
      return isNaN(date.getTime()) ? '' : `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
    },
    hasExif: function (image) {
      return !!image.imageExif && Object.keys(image.imageExif).length > 0
    },
    getFilter: function () {
      const filter = [{
        column: 'imageForeignId',
        comparator: 'equals',
        operator: 'and',
        values: [this.foreignId]
      }, {
        column: 'imageRefTable',
        comparator: 'equals',
        operator: 'and',
        values: [this.referenceTable]
      }]

      if (this.selectedTag) {
        filter.push({
          column: 'tags',
          comparator: 'contains',
          operator: 'and',
          values: [this.selectedTag.tagName]
        })
      }

      return filter
    },
    loadImages: function (page) {
      if (!this.foreignId) {
        return
      }

      apiPostImages({
        limit: IMAGES_PER_PAGE,
        page: page,
        orderBy: 'createdOn',
        ascending: 0,
        prevCount: -1,
        filter: this.getFilter()
      }, result => {
        this.images = (result && result.data) ? result.data : []
        this.imageCount = (result && result.count) || 0
        this.page = page
      })
    },
    loadTags: function () {
      if (!this.foreignId) {
        return
      }

      apiGetImageTagsForId(this.referenceTable, this.foreignId, result => {
        this.tags = (result && result.data) ? result.data : []
      })
    },
    refresh: function () {
      this.loadTags()
      this.loadImages(1)
    },
    selectTag: function (tag) {
      this.selectedTag = tag
      this.loadImages(1)
    },
    // Same as the download button of the original gallery: starts an export job shown in the downloads sidebar
    download: function () {
      emitter.emit('show-loading', true)
      apiPostImagesExport({ filter: this.getFilter() }, result => {
        result.forEach(r => this.$store.commit('ON_ASYNC_JOB_UUID_ADD_MUTATION', r.uuid))
        emitter.emit('toggle-aside', 'download')
        emitter.emit('show-loading', false)
      })
    },
    // Saves the description and the reference flag, like the original image cards
    saveImage: function (image) {
      apiPatchImage(image, () => {
        this.$emit('images-changed')
        this.savedImageId = image.imageId
        setTimeout(() => {
          if (this.savedImageId === image.imageId) {
            this.savedImageId = null
          }
        }, 2000)
      })
    },
    deleteImage: function (image) {
      this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
        okVariant: 'danger',
        okTitle: this.$t('genericYes'),
        cancelTitle: this.$t('genericNo')
      })
        .then(value => {
          if (value) {
            apiDeleteImage(image.imageId, result => {
              if (result) {
                this.refresh()
                this.$emit('images-changed')
              }
            })
          }
        })
    },
    editTags: function (image) {
      this.tagImage = image
      this.$nextTick(() => this.$refs.editTagModal.show())
    },
    onImagesUploaded: function () {
      this.refresh()
      this.$emit('images-changed')
    },
    onTagsChanged: function () {
      this.loadTags()
      this.loadImages(this.page)
    },
    showExif: function (image) {
      this.exifImage = image
      this.$nextTick(() => this.$refs.imageExifModal.show())
    }
  },
  mounted: function () {
    this.refresh()
  }
}
</script>

<style scoped>
/* Toolbar */
.pig-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1.5rem;
  margin-bottom: 1.25rem;
}
.pig-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
.pig-tags-label {
  font-size: 0.85rem;
  color: var(--cp-muted);
}
.pig-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.9rem;
  border: 1px solid var(--cp-border);
  border-radius: 999px;
  background: var(--cp-surface);
  color: var(--cp-text-subtle);
  font: inherit;
  font-size: 0.85rem;
  cursor: pointer;
}
.pig-chip.active {
  background: var(--cp-green-soft);
  border-color: var(--cp-green);
  color: var(--cp-green);
}
.pig-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}
.pig-button {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--cp-border);
  border-radius: 10px;
  background: var(--cp-surface);
  color: var(--cp-text);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.pig-button:hover {
  background: var(--cp-surface-hover);
  border-color: var(--cp-green);
}
.pig-button-primary {
  border-color: var(--cp-button);
  background: var(--cp-button);
  color: var(--cp-on-button);
}
.pig-button-primary:hover {
  border-color: var(--cp-button-hover);
  background: var(--cp-button-hover);
}

/* Grid: four images per row, eight per page */
.pig-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.25rem;
}
.pig-card {
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--cp-border);
  border-radius: 12px;
  background: var(--cp-surface);
  overflow: hidden;
}
.pig-thumb {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  padding: 0;
  border: none;
  background: var(--cp-neutral-bg);
  cursor: zoom-in;
  overflow: hidden;
}
.pig-thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s;
}
.pig-thumb:hover img {
  transform: scale(1.03);
}
.pig-thumb-loading {
  position: absolute;
  inset: 0;
  background: var(--cp-neutral-bg);
}
.pig-card-placeholder .pig-thumb {
  cursor: default;
}
.pig-reference {
  position: absolute;
  top: 0.6rem;
  left: 0.6rem;
  padding: 0.1rem 0.6rem;
  border-radius: 999px;
  background: var(--cp-button);
  color: var(--cp-on-button);
  font-size: 0.75rem;
  font-weight: 500;
}
.pig-delete {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  color: #ffffff;
  cursor: pointer;
  transition: background 0.15s;
}
.pig-delete:hover {
  background: #dc3545;
}

.pig-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.9rem 1rem 1rem;
}
.pig-description {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.pig-description-edit {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
}
.pig-textarea {
  flex: 1;
  min-width: 0;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--cp-border);
  border-radius: 8px;
  background: var(--cp-surface);
  color: var(--cp-text);
  font: inherit;
  font-size: 0.85rem;
  resize: vertical;
}
.pig-textarea:focus {
  outline: none;
  border-color: var(--cp-green);
}
.pig-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border: 1px solid var(--cp-green);
  border-radius: 8px;
  background: var(--cp-green-soft);
  color: var(--cp-green);
  cursor: pointer;
}
.pig-icon-button:hover {
  background: var(--cp-green);
  color: var(--cp-on-button);
}
.pig-switch {
  font-size: 0.85rem;
}
.pig-meta {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: var(--cp-muted);
}
.pig-image-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
}
.pig-tag {
  padding: 0.05rem 0.5rem;
  border-radius: 4px;
  background: var(--cp-neutral-bg);
  color: var(--cp-text-subtle);
  font-size: 0.78rem;
}
.pig-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  align-self: flex-start;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--cp-green);
  font: inherit;
  font-size: 0.8rem;
  cursor: pointer;
}
.pig-link:hover {
  color: var(--cp-green-hover);
  text-decoration: underline;
}

.pig-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  border: 1px dashed var(--cp-border);
  border-radius: 12px;
  color: var(--cp-muted);
  text-align: center;
}
.pig-empty p {
  margin: 0;
}

/* Pagination */
.pig-pager {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 1.75rem;
}
.pig-pager-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 0.6rem;
  border: 1px solid var(--cp-border);
  border-radius: 8px;
  background: var(--cp-surface);
  color: var(--cp-text);
  font: inherit;
  font-size: 0.9rem;
  cursor: pointer;
}
.pig-pager-button:hover:not(:disabled):not(.active) {
  background: var(--cp-surface-hover);
  border-color: var(--cp-green);
}
.pig-pager-button.active {
  background: var(--cp-green-soft);
  border-color: var(--cp-green);
  color: var(--cp-green);
  font-weight: 600;
}
.pig-pager-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Four images per row, only phones get fewer: 2, then 1 */
@media (max-width: 767px) {
  .pig-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 479px) {
  .pig-grid {
    grid-template-columns: 1fr;
  }
}
</style>
