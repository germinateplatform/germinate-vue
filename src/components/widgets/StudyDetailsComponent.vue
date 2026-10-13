<template>
  <v-list class="text-wrap">
    <v-list-item :title="$t('widgetStudyDetailsStartDate')" :subtitle="new Date(studyDetails.studyStartDate).toLocaleDateString()" v-if="studyDetails.studyStartDate" />
    <v-list-item :title="$t('widgetStudyDetailsEndDate')" :subtitle="new Date(studyDetails.studyEndDate).toLocaleDateString()" v-if="studyDetails.studyEndDate" />
    <v-list-item
      :title="$t('widgetStudyDetailsExperimentalDesignType')"
      :subtitle="studyDetails.experimentDesignType"
      v-if="studyDetails.experimentDesignType"
    >
      <template #subtitle="{ subtitle }">
        <a :href="experimentalDesignLink" target="_blank" v-if="experimentalDesignLink">{{ subtitle }}</a>
        <span v-else>{{ subtitle }}</span>
      </template>
    </v-list-item>
    <v-list-item :title="$t('widgetStudyDetailsExperimentalDesignDescription')" :subtitle="studyDetails.experimentDesignDescription" v-if="studyDetails.experimentDesignDescription" />
    <v-list-item :title="$t('widgetStudyDetailsExperimentalDesignMap')" :subtitle="studyDetails.experimentDesignMap" v-if="studyDetails.experimentDesignMap" />
    <v-list-item :title="$t('widgetStudyDetailsObservationUnitDescription')" :subtitle="studyDetails.observationUnitDescription" v-if="studyDetails.observationUnitDescription" />
    <v-list-item
      :title="$t('widgetStudyDetailsGrowthFacilityType')"
      :subtitle="studyDetails.growthFacilityType"
      v-if="studyDetails.growthFacilityType"
    >
      <template #subtitle="{ subtitle }">
        <a :href="growthFacilityLink" target="_blank" v-if="growthFacilityLink">{{ subtitle }}</a>
        <span v-else>{{ subtitle }}</span>
      </template>
    </v-list-item>
    <v-list-item :title="$t('widgetStudyDetailsGrowthFacilityDescription')" :subtitle="studyDetails.growthFacilityDescription" v-if="studyDetails.growthFacilityDescription" />
    <v-list-item :title="$t('widgetStudyDetailsCulturalPractices')" :subtitle="studyDetails.culturalPractice" v-if="studyDetails.culturalPractice" />
  </v-list>
</template>

<script setup lang="ts">
  import type { StudyDetailsCore } from '@/plugins/types/germinate'
  import { toAgroPortalUrl } from '@/plugins/util/formatting'

  const compProps = defineProps<{
    studyDetails: StudyDetailsCore
  }>()

  const experimentalDesignLink = computed(() => toAgroPortalUrl(compProps.studyDetails?.experimentDesignType))
  const growthFacilityLink = computed(() => toAgroPortalUrl(compProps.studyDetails?.growthFacilityType))
</script>
