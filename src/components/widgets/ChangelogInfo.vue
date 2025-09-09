<template>
  <div>
    <v-pagination v-model="page" :length="length" />

    <v-list class="changelog">
      <template
        v-for="(version, index) in visibleChangelog"
        :key="`changelog-${version.version}`"
      >
        <v-divider v-if="index > 0" />
        <v-list-item
          :title="version.version"
        >
          <template #title="{ title }">
            <div class="d-flex justify-space-between mt-3">
              <div class="mb-2"><v-icon size="large" color="primary" icon="mdi-tag" /> <span class="text-h5">v{{ title }}</span></div>
              <v-chip color="muted" prepend-icon="mdi-calendar" label>{{ new Date(version.date).toLocaleDateString() }}</v-chip>
            </div>
          </template>

          <v-row class="my-3">
            <template
              v-for="(item, iindex) in version.items"
              :key="`changelog-${version.version}-${iindex}`"
            >
              <v-col cols="12" md="4">
                <div><v-chip label :color="badges[item.type].color" :text="badges[item.type].text" /> {{ item.title }}</div>
                <div>
                  <v-chip
                    v-for="cat in item.categories"
                    :key="`changelog-${version.version}-${iindex}-${cat}`"
                    label
                    class="mt-2 me-2"
                    variant="tonal"
                    :color="categories[cat].color"
                    :text="categories[cat].text"
                  />
                </div>
              </v-col>
              <v-col cols="12" md="8">
                <span v-html="item.text" />
              </v-col>
            </template>
          </v-row>
        </v-list-item>
      </template>
    </v-list>
  </div>
</template>

<script setup lang="ts">
  import cd from '@/plugins/changelog/index.json'
  import type { ChangelogEntry } from '@/plugins/types/changelog'
  import { getTemplateColor } from '@/plugins/util/colors'

  import semver from 'semver'
  import { useI18n } from 'vue-i18n'

  interface Item {
    color: string
    text: string
  }

  const sorting = (a: ChangelogEntry, b: ChangelogEntry) => {
    if (semver.eq(a.version, b.version)) {
      return 0
    } else if (semver.gt(a.version, b.version)) {
      return -1
    } else {
      return 1
    }
  }

  cd.sort(sorting)

  const { t } = useI18n()
  const compProps = defineProps<{
    prevVersion?: string
  }>()

  const changelogItems = ref<ChangelogEntry[]>(cd)
  const page = ref(1)
  const perPage = ref(5)
  const length = computed(() => Math.ceil(changelogItems.value.length / perPage.value))
  const totalChangelog = computed(() => {
    let cl = []
    if (!compProps.prevVersion) {
      cl = changelogItems.value
    } else {
      const parsed = semver.valid(compProps.prevVersion)

      if (parsed) {
        cl = changelogItems.value.filter(c => semver.gt(c.version, compProps.prevVersion || ''))
      } else {
        cl = changelogItems.value
      }
    }
    return cl
  })
  const visibleChangelog = computed(() => {
    if (totalChangelog.value) {
      return totalChangelog.value.slice((page.value - 1) * perPage.value, page.value * perPage.value)
    } else {
      return []
    }
  })
  const badges: ComputedRef<{ [key: string]: Item }> = computed(() => {
    return {
      new: { color: 'success', text: t('widgetChangelogTypeNew') },
      update: { color: 'info', text: t('widgetChangelogTypeUpdate') },
      bugfix: { color: 'warning', text: t('widgetChangelogTypeFix') },
    }
  })
  const categories: ComputedRef<{ [key: string]: Item }> = computed(() => {
    return {
      user: { color: getTemplateColor(0), text: t('widgetChangelogCategoryUser') },
      admin: { color: getTemplateColor(1), text: t('widgetChangelogCategoryAdmin') },
    }
  })
</script>

<style>
.changelog .v-list-item__prepend {
  align-self: flex-start;
}
</style>
