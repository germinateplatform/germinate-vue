<template>
  <v-btn :icon="mdiHelpCircleOutline" @click="showHelp = true" v-if="hasHelp" />

  <v-dialog
    :model-value="isDrawerOpen"
    scrollable
    max-width="min(800px, 50vw)"
    max-height="75vh"
    @update:model-value="v => { showHelp = v }"
  >
    <v-card
      :title="$t('widgetHelpTitle')"
    >
      <template #text>
        <v-list>
          <v-list-item
            v-for="entry in resolvedEntries"
            :key="entry.id"
            class="help-item"
            :title="entry.label"
            :subtitle="entry.url"
            :href="entry.url"
            target="_blank"
            :append-icon="entry.url ? mdiOpenInNew : undefined"
          >
            <p v-if="entry.content" v-html="entry.content" />
            <!-- Target slot for pages/components using <Teleport> -->
            <div v-if="entry.teleportTargetId" :id="entry.teleportTargetId" />
          </v-list-item>
        </v-list>
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { useHelpRegistryProvider, type HelpEntry } from '@/plugins/composables/useHelp'
  import { mdiHelpCircleOutline, mdiOpenInNew } from '@mdi/js'

  const GERMINATE_DOCS = 'https://germinateplatform.github.io/germinate-server'

  const {
    entries,
    hasHelp,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
  } = useHelpRegistryProvider()

  const resolvedEntries = computed(() => {
    if (entries.value) {
      const copy = JSON.parse(JSON.stringify(entries.value)) as HelpEntry[]
      return copy.map(e => {
        const url = e.url

        if (url && !url.startsWith('http') && !url.startsWith('#')) {
          e.url = `${GERMINATE_DOCS}${url}`
        }

        return e
      })
    } else {
      return []
    }
  })

  const showHelp = ref(false)

  watch(showHelp, async newValue => {
    if (newValue) {
      openDrawer()
    } else {
      closeDrawer()
    }
  })
</script>
