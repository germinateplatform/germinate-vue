<template>
  <v-container fluid>
    <h1 class="text-h4 mb-3">{{ $t('pageExportFormatsTitle') }}</h1>
    <v-divider class="mb-3" />
    <p v-html="$t('pageExportFormatsText')" />

    <v-chip-group v-model="selectedTag" mandatory>
      <v-chip
        v-for="(tag, name) in tags"
        :key="`export-format-tag-${name}`"
        :color="tag.color"
        filter
        label
        append-icon="mdi-tag"
        :value="name"
        :text="tag.title"
      />
    </v-chip-group>

    <v-chip-group v-model="selectedType" mandatory>
      <v-chip
        v-for="(type, name) in types"
        :key="`export-format-type-${name}`"
        :color="type.color"
        filter
        label
        :append-icon="type.icon"
        :value="name"
        :text="type.title"
      />
    </v-chip-group>

    <v-row>
      <v-col
        v-for="format in filteredExportFormats"
        :key="`export-format-${format.name}`"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        xl="2"
        class="d-flex"
      >
        <v-card class="d-flex flex-column">
          <v-img max-height="200" class="ma-4" contain :src="`./img/${format.logo}`" />
          <div class="bg-surface-variant d-flex flex-column flex-grow-1 justify-space-between">
            <div>
              <v-card-title>{{ format.name }}</v-card-title>
              <v-card-text class="flex-grow-1">{{ format.text() }}</v-card-text>
            </div>
            <v-card-text class="flex-grow-0">
              <div>
                <v-chip v-for="tag in format.tags" :key="`export-format-${format.name}-tag-${tag}`" label variant="flat" size="small" class="me-2 mb-1" :prepend-icon="tags[tag].icon" :color="tags[tag].color" :text="tags[tag].title" />
              </div>
              <div>
                <v-chip v-for="type in format.types" :key="`export-format-${format.name}-type-${type}`" label variant="flat" size="small" class="me-2 mb-1" :prepend-icon="types[type].icon" :color="types[type].color" :text="types[type].title" />
              </div>
            </v-card-text>
          </div>
          <v-btn
            color="primary rounded-t-0"
            :prepend-icon="format.linkType === 'download' ? 'mdi-download' : 'mdi-open-in-new'"
            :text="format.linkType === 'download' ? $t('buttonDownload') : $t('buttonShow')"
            :href="format.link"
            target="_blank"
            ref="noopener noreferrer"
          />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import { getTemplateColor } from '@/plugins/util/colors'
  import { exportFormats, type FormatState } from '@/plugins/util/types'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const selectedTag = ref('all')
  const selectedType = ref('all')

  interface TagType {
    icon: string
    title: string
    color: string
  }

  const tags: ComputedRef<{ [key: string]: TagType }> = computed(() => {
    return {
      all: {
        icon: 'mdi-tag',
        title: t('exportFormatDataTypeAll'),
        color: getTemplateColor(0),
      },
      genotype: {
        icon: 'mdi-tag',
        title: t('exportFormatDataTypeGenotype'),
        color: getTemplateColor(1),
      },
      phenotype: {
        icon: 'mdi-tag',
        title: t('exportFormatDataTypePhenotype'),
        color: getTemplateColor(2),
      },
      pedigree: {
        icon: 'mdi-tag',
        title: t('exportFormatDataTypePedigree'),
        color: getTemplateColor(3),
      },
      pca: {
        icon: 'mdi-tag',
        title: t('exportFormatDataTypePca'),
        color: getTemplateColor(4),
      },
    }
  })

  const types: ComputedRef<{ [key: string]: TagType }> = computed(() => {
    return {
      all: {
        icon: 'mdi-cloud',
        title: t('exportFormatDataTypeAll'),
        color: getTemplateColor(0),
      },
      provider: {
        icon: 'mdi-cloud-download',
        title: t('exportFormatTypeProvider'),
        color: getTemplateColor(1),
      },
      receiver: {
        icon: 'mdi-cloud-upload',
        title: t('exportFormatTypeConsumer'),
        color: getTemplateColor(2),
      },
    }
  })

  const filteredExportFormats: ComputedRef<FormatState[]> = computed(() => {
    if ((selectedTag.value && selectedTag.value !== 'all') || (selectedType.value && selectedType.value !== 'all')) {
      return Object.keys(exportFormats)
        .filter(f => exportFormats[f].tags.includes(selectedTag.value) || exportFormats[f].types.includes(selectedType.value))
        .map(f => exportFormats[f])
    } else {
      return Object.values(exportFormats)
    }
  })
</script>
