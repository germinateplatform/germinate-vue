<template>
  <b-modal :title="$t('modalTitleChangelog')"
           :ok-title="$t('buttonClose')"
           ok-only
           size="xl"
           ref="changelogModal">
    <p>{{ $t('modalTextChangelog') }}</p>

    <b-pagination :per-page="perPage" :total-rows="totalCount" v-model="page" v-if="totalCount > perPage" />

    <b-card v-for="version in visibleChangelog" :key="`changelog-${version.version}`" class="mb-3">
      <b-card-title>
        <MdiIcon :path="mdiTag" /> {{ version.version }}
      </b-card-title>
      <b-card-sub-title v-if="version.date" class="mb-3">
        <MdiIcon :path="mdiCalendarClockOutline" /> {{ new Date(version.date).toLocaleDateString() }}
      </b-card-sub-title>
      <dl class="row mb-0">
        <template v-for="(item, index) in version.items">
          <dt :key="`changelog-${version.version}-dt-${index}`" class="col-md-4"><div><b-badge :variant="badge[item.type].variant">{{ badge[item.type].text }}</b-badge> {{ item.title }}</div><b-badge v-for="cat in item.categories.sort()" variant="light" :key="`changelog-${version.version}-dd-${index}-cats-${cat}`" class="border mr-2" :style="{ borderColor: `${categories[cat].bgColor} !important` }">{{ categories[cat].text }}</b-badge></dt>
          <dd :key="`changelog-${version.version}-dd-${index}`" class="col-md-8"><span v-html="item.text" /></dd>
          <template v-if="item.categories">
            <dt :key="`changelog-${version.version}-dt-${index}-cats`" class="col-md-4"></dt>
            <dd :key="`changelog-${version.version}-dd-${index}-cats`" class="col-md-8"></dd>
          </template>
        </template>
      </dl>
    </b-card>

    <b-pagination :per-page="perPage" :total-rows="totalCount" v-model="page" v-if="totalCount > perPage" />
  </b-modal>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import changelogData from '@/plugins/changelog/'
import { getTemplateColor } from '@/mixins/colors'

import { mdiCalendarClockOutline, mdiTag } from '@mdi/js'

const semver = require('semver')

const sorting = (a, b) => {
  if (semver.eq(a.version, b.version)) {
    return 0
  } else if (semver.gt(a.version, b.version)) {
    return -1
  } else {
    return 1
  }
}

export default {
  components: {
    MdiIcon
  },
  props: {
    prevVersion: {
      type: String,
      default: null
    }
  },
  data: function () {
    return {
      mdiCalendarClockOutline,
      mdiTag,
      page: 1,
      perPage: 5
    }
  },
  computed: {
    badge: function () {
      return {
        new: { variant: 'success', text: this.$t('widgetChangelogTypeNew') },
        update: { variant: 'info', text: this.$t('widgetChangelogTypeUpdate') },
        bugfix: { variant: 'warning', text: this.$t('widgetChangelogTypeFix') }
      }
    },
    categories: function () {
      return {
        user: { bgColor: getTemplateColor(0), text: this.$t('widgetChangelogCategoryUser') },
        admin: { bgColor: getTemplateColor(1), text: this.$t('widgetChangelogCategoryAdmin') }
      }
    },
    totalCount: function () {
      if (this.changelog) {
        return this.totalChangelog.length
      } else {
        return 0
      }
    },
    changelog: function () {
      return changelogData.sort(sorting)
    },
    totalChangelog: function () {
      let cl = []
      if (!this.prevVersion) {
        cl = this.changelog
      } else {
        const parsed = semver.valid(this.prevVersion)

        if (parsed) {
          cl = this.changelog.filter(c => semver.gt(c.version, this.prevVersion))
          if (cl.length === 0) {
            cl = this.changelog
          }
        } else {
          cl = this.changelog
        }
      }

      return cl
    },
    visibleChangelog: function () {
      if (this.totalChangelog) {
        return this.totalChangelog.slice((this.page - 1) * this.perPage, this.page * this.perPage)
      } else {
        return []
      }
    }
  },
  methods: {
    /**
     * Shows and resets modal dialog
     */
    show: function () {
      this.$refs.changelogModal.show()
    },
    /**
     * Hides the modal dialog
     */
    hide: function () {
      this.$nextTick(() => this.$refs.changelogModal.hide())
    }
  }
}
</script>

<style scoped>
</style>
