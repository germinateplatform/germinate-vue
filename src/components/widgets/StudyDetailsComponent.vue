<template>
  <v-list class="text-wrap">
    <v-list-item :title="$t('widgetStudyDetailsStartDate')" :subtitle="new Date(studyDetails.studyStartDate).toLocaleDateString()" v-if="studyDetails.studyStartDate" />
    <v-list-item :title="$t('widgetStudyDetailsEndDate')" :subtitle="new Date(studyDetails.studyEndDate).toLocaleDateString()" v-if="studyDetails.studyEndDate" />
    <v-list-item :title="$t('widgetStudyDetailsExperimentalDesignType')" :subtitle="studyDetails.experimentDesignType" v-if="studyDetails.experimentDesignType" />
    <v-list-item :title="$t('widgetStudyDetailsExperimentalDesignDescription')" :subtitle="studyDetails.experimentDesignDescription" v-if="studyDetails.experimentDesignDescription" />
    <v-list-item :title="$t('widgetStudyDetailsExperimentalDesignMap')" :subtitle="studyDetails.experimentDesignMap" v-if="studyDetails.experimentDesignMap" />
    <v-list-item :title="$t('widgetStudyDetailsObservationUnitDescription')" :subtitle="studyDetails.observationUnitDescription" v-if="studyDetails.observationUnitDescription" />
    <v-list-item :title="$t('widgetStudyDetailsGrowthFacilityType')" :subtitle="studyDetails.growthFacilityType" v-if="studyDetails.growthFacilityType" />
    <v-list-item :title="$t('widgetStudyDetailsGrowthFacilityDescription')" :subtitle="studyDetails.growthFacilityDescription" v-if="studyDetails.growthFacilityDescription" />
    <v-list-item :title="$t('widgetStudyDetailsCulturalPractices')" :subtitle="studyDetails.culturalPractice" v-if="studyDetails.culturalPractice" />
  </v-list>
</template>

<script setup lang="ts">
  import type { StudyDetailsCore } from '@/plugins/types/germinate'

  defineProps<{
    studyDetails: StudyDetailsCore
  }>()
</script>
