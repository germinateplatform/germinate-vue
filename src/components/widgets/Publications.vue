<template>
  <div>
    <v-row>
      <v-col
        v-for="publication in publicationsOnPage"
        :key="`publication-card-${publication.publicationId}`"
        cols="12"
        sm="6"
        md="4"
        xl="3"
      >
        <PublicationCard :publication="publication" @delete="onDelete(publication)" />
      </v-col>
    </v-row>

    <v-pagination :length="totalPages" v-model="page" v-if="totalPages > 1" />
  </div>
</template>

<script setup lang="ts">
  import { apiDeletePublicationReference, apiGetPublications } from '@/plugins/api/misc'
  import type { ViewTablePublications } from '@/plugins/types/germinate'
  import PublicationCard from '@/components/cards/PublicationCard.vue'

  import emitter from 'tiny-emitter/instance'
  import { useI18n } from 'vue-i18n'

  const props = defineProps<{
    referenceType: string
    referencingId?: number
  }>()

  const emit = defineEmits([
    'publication-count-changed',
  ])

  const { t } = useI18n()

  const page = ref(1)
  const itemsPerPage = ref(8)
  const publications = ref<ViewTablePublications[]>([])

  const totalPages = computed(() => Math.ceil(publications.value.length / itemsPerPage.value))

  const publicationsOnPage = computed(() => {
    const startIndex = Math.min(publications.value.length, (page.value - 1) * itemsPerPage.value)
    const endIndex = Math.min(publications.value.length, startIndex + itemsPerPage.value)

    return publications.value.slice(startIndex, endIndex)
  })

  function update () {
    apiGetPublications(props.referenceType, props.referencingId, (result: ViewTablePublications[]) => {
      publications.value = result

      emit('publication-count-changed', result.length)
    })
  }

  function onDelete (publication: ViewTablePublications) {
    if (!publication) {
      return
    }

    emitter.emit('show-confirm', {
      title: t('modalTitleConfirm'),
      message: t('modalTitleSure'),
      okTitle: t('genericYes'),
      cancelTitle: t('genericNo'),
      okVariant: 'error',
      callback: (result: boolean) => {
        if (result === true) {
          apiDeletePublicationReference(publication.publicationId, props.referenceType, props.referencingId, () => update())
        }
      },
    })
  }

  update()
</script>
