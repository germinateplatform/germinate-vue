<template>
  <div class="custom-page media-page">
    <!-- Heading -->
    <section class="media-hero">
      <div class="cp-eyebrow"><span class="cp-eyebrow-dot" /> Media library</div>
      <!-- Title on the left, category filter on the right -->
      <div class="media-title-row">
        <h1 class="cp-title">{{ $t('pageMediaTitle') }}</h1>
        <div class="media-filter" v-if="categories.length > 0">
          <label for="media-category-filter" class="media-filter-label">{{ $t('formLabelMediaCategoryFilter') }}</label>
          <div class="media-filter-select">
            <select id="media-category-filter" v-model="selectedCategory">
              <option :value="null">All</option>
              <option v-for="category in categories" :key="'media-category-' + category" :value="category">{{ category }}</option>
            </select>
            <MdiIcon :path="icons.chevronDown" :size="18" />
          </div>
        </div>
      </div>
      <p class="cp-lead">{{ $t('pageMediaText') }}</p>
    </section>

    <!-- Loading placeholders -->
    <div class="media-grid" v-if="videos === null">
      <div class="media-card media-card-placeholder" v-for="i in VIDEOS_PER_PAGE" :key="'media-placeholder-' + i">
        <div class="media-thumb" />
        <div class="media-card-body">
          <div class="media-placeholder-line" />
          <div class="media-placeholder-line short" />
        </div>
      </div>
    </div>

    <!-- No videos -->
    <div class="media-empty" v-else-if="filteredVideos.length === 0">
      <MdiIcon :path="icons.media" :size="40" />
      <p>{{ $t('pageMediaNoVideos') }}</p>
    </div>

    <template v-else>
      <!-- Gallery, up to four cards per row -->
      <div class="media-grid">
        <button type="button" class="media-card" v-for="video in videosOnPage" :key="'media-video-' + video.id" @click="playVideo(video)">
          <div class="media-thumb">
            <!-- The frame at one second is used as the thumbnail -->
            <video :src="`${video.url}#t=1`" preload="metadata" muted playsinline tabindex="-1" aria-hidden="true" @loadedmetadata="onThumbnailMetadata(video, $event)" />
            <span class="media-play"><MdiIcon :path="icons.play" :size="28" /></span>
            <span class="media-duration" v-if="durations[video.id]">{{ formatDuration(durations[video.id]) }}</span>
          </div>
          <div class="media-card-body">
            <span class="media-badge">{{ video.category }}</span>
            <h3 class="media-card-title" :title="video.title">{{ video.title }}</h3>
            <p class="media-card-text" v-if="video.description">{{ video.description }}</p>
          </div>
        </button>
      </div>

      <!-- Pagination, 8 videos per page -->
      <nav class="media-pager" v-if="pageCount > 1" aria-label="Video pages">
        <button type="button" class="media-pager-button" :disabled="page <= 1" @click="goToPage(page - 1)" aria-label="Previous page">
          <MdiIcon :path="icons.chevronLeft" :size="20" />
        </button>
        <button type="button"
                v-for="p in pageCount"
                :key="'media-page-' + p"
                :class="['media-pager-button', { active: p === page }]"
                :aria-current="p === page ? 'page' : null"
                @click="goToPage(p)">
          {{ p }}
        </button>
        <button type="button" class="media-pager-button" :disabled="page >= pageCount" @click="goToPage(page + 1)" aria-label="Next page">
          <MdiIcon :path="icons.chevronRight" :size="20" />
        </button>
      </nav>
    </template>

    <!-- Player -->
    <b-modal ref="playerModal"
             size="xl"
             centered
             hide-footer
             :title="selectedVideo ? selectedVideo.title : ''"
             @shown="createPlayer"
             @hidden="disposePlayer">
      <!-- Video.js replaces its element, so the element is created in code inside this container -->
      <div ref="playerContainer" class="media-player" />
      <p class="media-player-text" v-if="selectedVideo && selectedVideo.description">{{ selectedVideo.description }}</p>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

import MdiIcon from '@/components/icons/MdiIcon'

import { apiPostFileResourceTable } from '@/mixins/api/dataset'
import { MAX_JAVA_INTEGER } from '@/mixins/api/base'

import { mdiChevronDown, mdiChevronLeft, mdiChevronRight, mdiPlay, mdiTelevisionPlay } from '@mdi/js'

const VIDEOS_PER_PAGE = 12

// Video names follow "#<order>##<category>#<title>", e.g. "#1.1##Training#Germinate Docker Setup".
// The order can be decimal. Videos whose name does not follow this pattern are not listed.
const VIDEO_NAME_PATTERN = /^#(\d+(?:\.\d+)?)##([^#]+)#+(.+)$/

const parseVideoName = name => {
  const match = name ? name.trim().match(VIDEO_NAME_PATTERN) : null

  if (!match) {
    return null
  }

  return {
    order: parseFloat(match[1]),
    category: match[2].trim(),
    title: match[3].trim()
  }
}

// Categories alphabetically, then the order number within each category
const compareVideos = (a, b) => a.category.localeCompare(b.category, undefined, { sensitivity: 'base' }) || a.order - b.order

// Data resources of type "Video"
const videoFilter = [{
  column: 'fileresourcetypeName',
  operator: 'and',
  comparator: 'equals',
  values: ['Video']
}]

// The download URL has no file extension, so the player is told the format from the stored file name
const VIDEO_TYPES = {
  mp4: 'video/mp4',
  m4v: 'video/mp4',
  webm: 'video/webm',
  ogv: 'video/ogg',
  ogg: 'video/ogg',
  mov: 'video/quicktime',
  m3u8: 'application/x-mpegURL'
}

const getVideoType = path => {
  const extension = path ? path.split('.').pop().toLowerCase() : null
  return VIDEO_TYPES[extension] || 'video/mp4'
}

export default {
  components: {
    MdiIcon
  },
  data: function () {
    return {
      VIDEOS_PER_PAGE,
      // All listed videos, sorted. Null until loaded.
      videos: null,
      // Null shows all categories
      selectedCategory: null,
      page: 1,
      // Video length in seconds, keyed by video id, read from the thumbnails
      durations: {},
      selectedVideo: null,
      player: null,
      icons: {
        chevronDown: mdiChevronDown,
        chevronLeft: mdiChevronLeft,
        chevronRight: mdiChevronRight,
        play: mdiPlay,
        media: mdiTelevisionPlay
      }
    }
  },
  computed: {
    ...mapGetters([
      'storeBaseUrl',
      'storeToken'
    ]),
    categories: function () {
      const categories = new Set((this.videos || []).map(v => v.category))
      return [...categories].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
    },
    filteredVideos: function () {
      const videos = this.videos || []
      return this.selectedCategory === null ? videos : videos.filter(v => v.category === this.selectedCategory)
    },
    // Pagination follows the category filter
    pageCount: function () {
      return Math.ceil(this.filteredVideos.length / VIDEOS_PER_PAGE)
    },
    videosOnPage: function () {
      const start = (this.page - 1) * VIDEOS_PER_PAGE
      return this.filteredVideos.slice(start, start + VIDEOS_PER_PAGE)
    }
  },
  watch: {
    selectedCategory: function () {
      this.page = 1
    }
  },
  methods: {
    // Same download URL as the data resources table
    getVideoUrl: function (resource) {
      return `${this.storeBaseUrl}fileresource/${resource.fileresourceId}/download?token=${this.storeToken ? this.storeToken.token : null}`
    },
    // Returns null for resources whose name does not follow the video name pattern
    toVideo: function (resource) {
      const name = parseVideoName(resource.fileresourceName)

      if (!name) {
        return null
      }

      return {
        id: resource.fileresourceId,
        order: name.order,
        category: name.category,
        title: name.title,
        description: resource.fileresourceDescription,
        url: this.getVideoUrl(resource),
        type: getVideoType(resource.fileresourcePath)
      }
    },
    // Sorting and filtering use the parsed names, so all videos are loaded and paginated here
    loadVideos: function () {
      const query = {
        page: 1,
        limit: MAX_JAVA_INTEGER,
        filter: videoFilter
      }

      apiPostFileResourceTable(query, result => {
        const resources = (result && result.data) ? result.data : []
        this.videos = resources.map(this.toVideo).filter(v => v).sort(compareVideos)
      })
    },
    goToPage: function (page) {
      this.page = page
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    onThumbnailMetadata: function (video, event) {
      const duration = event.target.duration

      if (duration && isFinite(duration)) {
        this.$set(this.durations, video.id, duration)
      }
    },
    // 75 -> "1:15", 3725 -> "1:02:05"
    formatDuration: function (seconds) {
      const total = Math.round(seconds)
      const h = Math.floor(total / 3600)
      const m = Math.floor((total % 3600) / 60)
      const s = `${total % 60}`.padStart(2, '0')

      return h > 0 ? `${h}:${`${m}`.padStart(2, '0')}:${s}` : `${m}:${s}`
    },
    playVideo: function (video) {
      this.selectedVideo = video
      this.$refs.playerModal.show()
    },
    createPlayer: function () {
      this.disposePlayer()

      const element = document.createElement('video-js')
      element.classList.add('vjs-big-play-centered')
      this.$refs.playerContainer.appendChild(element)

      this.player = videojs(element, {
        controls: true,
        autoplay: true,
        fluid: true,
        playbackRates: [0.5, 1, 1.25, 1.5, 2],
        sources: [{ src: this.selectedVideo.url, type: this.selectedVideo.type }]
      })
    },
    disposePlayer: function () {
      if (this.player) {
        this.player.dispose()
        this.player = null
      }
    }
  },
  mounted: function () {
    this.loadVideos()
  },
  beforeDestroy: function () {
    this.disposePlayer()
  }
}
</script>

<style src="@/assets/custom-page.css"></style>

<style scoped>
.media-page {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0.5rem 0 3rem;
}

.media-hero {
  margin-bottom: 2.5rem;
}

/* Title on the left, category filter pushed to the right of the same line */
.media-title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1.25rem;
}
.media-filter {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-left: auto;
  color: var(--cp-text);
}
.media-filter-label {
  margin: 0;
  font-size: 0.9rem;
  color: var(--cp-muted);
  white-space: nowrap;
}
.media-filter-select {
  position: relative;
  display: flex;
  align-items: center;
}
.media-filter select {
  appearance: none;
  min-width: 180px;
  height: 40px;
  padding: 0 2.5rem 0 1rem;
  border: 1px solid var(--cp-border);
  border-radius: 10px;
  background: var(--cp-surface);
  color: inherit;
  font: inherit;
  font-size: 0.95rem;
  cursor: pointer;
}
.media-filter select:focus {
  outline: none;
  border-color: var(--cp-green);
}
.media-filter >>> .mdi-icon-wrapper {
  position: absolute;
  right: 0.85rem;
  pointer-events: none;
  color: var(--cp-muted);
}

/* Gallery: three cards per row on wide screens */
.media-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.75rem;
}

.media-card {
  display: flex;
  flex-direction: column;
  padding: 0;
  border: 1px solid var(--cp-border);
  border-radius: 12px;
  background: var(--cp-surface);
  color: var(--cp-text);
  text-align: left;
  font: inherit;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.15s, transform 0.15s;
}
.media-card:hover,
.media-card:focus-visible {
  box-shadow: 0 6px 20px var(--cp-shadow);
  transform: translateY(-2px);
}
.media-card:focus-visible {
  outline: 2px solid var(--cp-green);
  outline-offset: 2px;
}

.media-thumb {
  position: relative;
  aspect-ratio: 16 / 9;
  background: var(--cp-media-bg);
  overflow: hidden;
}
.media-thumb video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}
.media-play {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  color: #ffffff;
  transform: translate(-50%, -50%);
  transition: background 0.15s, transform 0.15s;
}
.media-card:hover .media-play {
  background: var(--cp-button);
  transform: translate(-50%, -50%) scale(1.06);
}
.media-duration {
  position: absolute;
  right: 0.5rem;
  bottom: 0.5rem;
  padding: 0.05rem 0.4rem;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 500;
}

.media-card-body {
  padding: 1.1rem 1.35rem 1.4rem;
}
/* Video category */
.media-badge {
  display: inline-block;
  max-width: 100%;
  margin-bottom: 0.6rem;
  padding: 0.1rem 0.6rem;
  border-radius: 999px;
  background: var(--cp-green-soft);
  color: var(--cp-green);
  font-size: 0.78rem;
  font-weight: 500;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.media-card-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
  line-height: 1.35;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
/* Description limited to three lines */
.media-card-text {
  margin: 0.45rem 0 0;
  font-size: 0.9rem;
  line-height: 1.45;
  color: var(--cp-muted);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Loading placeholders */
.media-card-placeholder {
  cursor: default;
}
.media-card-placeholder:hover {
  box-shadow: none;
  transform: none;
}
.media-card-placeholder .media-thumb {
  background: var(--cp-neutral-bg);
}
.media-placeholder-line {
  height: 0.8rem;
  border-radius: 4px;
  background: var(--cp-neutral-bg);
}
.media-placeholder-line.short {
  width: 60%;
  margin-top: 0.6rem;
}

.media-empty {
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
.media-empty p {
  margin: 0;
}

/* Pagination */
.media-pager {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 2.25rem;
}
.media-pager-button {
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
.media-pager-button:hover:not(:disabled):not(.active) {
  background: var(--cp-surface-hover);
  border-color: var(--cp-green);
}
.media-pager-button.active {
  background: var(--cp-green-soft);
  border-color: var(--cp-green);
  color: var(--cp-green);
  font-weight: 600;
}
.media-pager-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Player modal content */
.media-player {
  border-radius: 8px;
  overflow: hidden;
  background: #000000;
}
.media-player-text {
  margin: 1rem 0 0;
  line-height: 1.55;
}

/* Responsive: 2 and 1 cards per row */
@media (max-width: 991px) {
  .media-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 575px) {
  .media-grid {
    grid-template-columns: 1fr;
  }
}
</style>
