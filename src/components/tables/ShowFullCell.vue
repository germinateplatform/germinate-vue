<template>
  <div class="d-flex align-center ga-2" v-if="content && content.length > 0">
    <span :title="content" v-if="content">{{ truncateAfterWords(content, maxWords) }}</span>
    <a href="#" class="ms-2 table-icon-link" @click.prevent="showDetailsModal" v-if="isTruncatedAfterWords(content, maxWords)">
      <v-icon :icon="mdiPageNext" />
    </a>
  </div>
</template>

<script setup lang="ts">
  import { isTruncatedAfterWords, truncateAfterWords } from '@/plugins/util/formatting'
  import { mdiPageNext } from '@mdi/js'

  import emitter from 'tiny-emitter/instance'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const compProps = withDefaults(defineProps<{
    maxWords?: number
    content: string
    title: string
  }>(), {
    maxWords: 10,
  })

  function showDetailsModal () {
    emitter.emit('show-confirm', {
      title: t(compProps.title),
      message: compProps.content,
      okTitle: t('genericOk'),
      cancelTitle: undefined,
      okOnly: true,
      okVariant: 'primary',
    })
  }
</script>
