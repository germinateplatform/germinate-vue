<template>
  <v-container fluid>
    <div id="about-page">
      <h1 class="text-headline-large mb-3">{{ $t('pageAboutGerminateTitle') }}</h1>
      <v-divider class="mb-3" />

      <v-row class="my-5 card-icon-avatar">
        <v-col>
          <v-card color="primary">
            <div class="d-flex flex-column flex-sm-row justify-space-between align-center pa-3">
              <div class="pb-2">
                <v-card-title class="text-display-medium">{{ $t('pageAboutGerminateTitle') }}</v-card-title>
                <v-card-subtitle class="text-title-large pb-4 text-wrap">{{ $t('pageAboutGerminateSubtitle') }}</v-card-subtitle>

                <v-card-text class="py-2">
                  <v-icon :icon="mdiTag" /> {{ $t('pageFooterVersion', { version: germinateVersion }) }}
                </v-card-text>
                <v-card-text class="py-2">
                  <v-icon :icon="mdiInformationOutline" /> <a class="text-white-important" href="#" @click.prevent="emitter.emit('show-changelog')">{{ $t('pageAboutGerminateChangelog') }}</a>
                </v-card-text>
              </div>
              <v-avatar
                class="ma-5"
                rounded="0"
                size="160"
              >
                <v-img :cover="false" src="/img/germinate-square-name-white.svg" />
              </v-avatar>
            </div>
          </v-card>
        </v-col>
        <v-col class="card-icon-avatar">
          <v-row>
            <v-col v-for="(banner, index) in banners" :key="'banner-' + banner.key">
              <v-card :color="getTemplateColor(index)" :href="banner.link">
                <div class="d-flex flex-no-wrap align-center justify-space-between">
                  <div>
                    <v-card-title class="text-title-large text-white">
                      {{ banner.text() }}
                    </v-card-title>
                  </div>

                  <v-avatar
                    class="ma-3"
                    rounded="0"
                    size="64"
                  >
                    <v-icon size="64">{{ banner.path }}</v-icon>
                  </v-avatar>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <p v-html="$t('pageAboutGerminateText')" />

      <h2 class="mt-10 mb-3">{{ $t('pageAboutGerminateTeamTitle') }}<small class="text-muted"> - {{ $t('pageAboutGerminateTeamSubtitle') }}</small></h2>
      <v-row>
        <v-col
          v-for="member in team"
          :key="`team-member-${member.name}`"
          class="d-flex"
          cols="12"
          md="6"
          xl="4"
        >
          <v-card color="surface-variant" class="pa-5 d-flex">
            <v-row>
              <v-col cols="12" lg="4">
                <div class="d-flex flex-column align-center">
                  <v-avatar :size="lg ? 120 : 160" :image="`./img/team/${member.img}`" />
                  <v-chip variant="tonal" label color="success" class="mt-3" :prepend-icon="mdiCalendar">Since {{ member.since }}</v-chip>
                </div>
              </v-col>
              <v-col cols="12" lg="8">
                <div class="text-headline-small mb-1 font-weight-bold d-flex align-center">
                  <span class="me-3">{{ member.name }}</span>
                  <a
                    v-for="link in member.links"
                    :key="`team-member-${member.name}-${link.title}`"
                    :href="link.href"
                    class="d-inline-flex text-decoration-none me-1" rel="noopener" target="_blank"
                  >
                    <v-icon size="small" :icon="link.path" v-tooltip:bottom="link.title" />
                  </a>
                </div>

                <div class="text-subtitle d-flex align-center my-2">
                  <v-icon :color="getTemplateColor(1)" :icon="mdiBriefcaseVariant" class="me-2" /> {{ member.job() }}
                </div>
                <div class="text-subtitle d-flex align-start my-2">
                  <v-icon :color="getTemplateColor(2)" :icon="mdiInformation" class="me-2" /> {{ member.about() }}
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <h2 class="mt-10 mb-3">{{ $t('pageAboutGerminateTeamOthersTitle') }}<small class="text-muted"> - {{ $t('pageAboutGerminateTeamOthersSubtitle') }}</small></h2>
      <div v-html="$t('pageAboutGerminateTeamOthersText')" />

      <h2 class="mt-10 mb-3">{{ $t('pageAboutGerminateLocationTitle') }}<small class="text-muted"> - {{ $t('pageAboutGerminateLocationSubtitle') }}</small></h2>
      <LocationMap :show-links="false" :locations="[location]" class="mb-5" />

      <template v-if="store.storeServerSettings?.donationsSectionEnabled">
        <h2 class="mt-10 mb-3">{{ $t('pageAboutGerminateDonationsTitle') }}<small class="text-muted"> - {{ $t('pageAboutGerminateDonationsSubtitle') }}</small></h2>
        <div v-html="$t('pageAboutGerminateDonationsText')" />
      </template>

      <h2 class="mt-10 mb-3">{{ $t('pageAboutGerminateFundersTitle') }}<small class="text-muted"> - {{ $t('pageAboutGerminateFundersSubtitle') }}</small></h2>
      <p>{{ $t('pageAboutGerminateFundersText') }}</p>
      <v-row class="funders">
        <v-col cols="12" sm="6" md="4" lg="3" xxl="2" v-for="(funder, i) in funders" :key="'about-funders-' + i" class="text-center pb-5 col-xxl-2">
          <div class="pa-3 pa-xl-4 img-container">
            <a :href="funder.href" :title="funder.name" target="_blank" rel="noopener noreferrer" v-if="funder.href">
              <v-img height="100" :src="`./img/funders/${funder.logo}`" alt="Funder logo" />
            </a>
            <v-img height="100" :src="`./img/funders/${funder.logo}`" alt="Funder logo" v-else />
          </div>
        </v-col>
      </v-row>
      <p v-html="$t('pageAboutGerminateFundersExtra')" />
    </div>
  </v-container>
</template>

<route lang="yaml">
name: aboutGerminate
</route>

<script setup lang="ts">
  import LocationMap from '@/components/map/LocationMap.vue'
  import type { ViewTableLocations } from '@/plugins/types/germinate'
  import { bskyIcon, germinateVersion } from '@/plugins/util'
  import { getTemplateColor } from '@/plugins/util/colors'
  import { useI18n } from 'vue-i18n'
  import emitter from 'tiny-emitter/instance'
  import { useDisplay } from 'vuetify'
  import { mdiBriefcaseVariant, mdiCalendar, mdiEarth, mdiFileDocument, mdiGithub, mdiGlasses, mdiInformation, mdiInformationOutline, mdiTag, mdiTwitter, mdiWeb } from '@mdi/js'
  import { coreStore } from '@/stores/app'

  const { t } = useI18n()
  const { lg } = useDisplay()
  const store = coreStore()

  interface TeamMember {
    name: string
    job: Function
    img: string
    since: number
    about: Function
    links: Link[]
  }

  interface Link {
    path: string | string[]
    title: string
    href: string
  }

  interface Funder {
    name: string
    href?: string
    logo: string
  }

  interface Banner {
    key: string
    text: Function
    path: string
    link: string
  }

  const banners = ref<Banner[]>([
    {
      key: 'homepage',
      text: () => t('pageAboutGerminateCardHomepageText'),
      path: mdiWeb,
      link: 'https://ics.hutton.ac.uk/get-germinate',
    },
    {
      key: 'github',
      text: () => t('pageAboutGerminateCardGithubText'),
      path: mdiGithub,
      link: 'https://github.com/germinateplatform/germinate-vue',
    },
    {
      key: 'publication',
      text: () => t('pageAboutGerminateCardPublicationText'),
      path: mdiFileDocument,
      link: 'https://dl.sciencesocieties.org/publications/cs/articles/57/3/1259',
    },
    {
      key: 'documentation',
      text: () => t('pageAboutGerminateCardDocumentationText'),
      path: mdiGlasses,
      link: 'https://germinateplatform.github.io/germinate-server',
    },
  ])

  const funders = ref<Funder[]>([
    {
      name: 'The James Hutton Institute',
      href: 'https://www.hutton.ac.uk/',
      logo: 'hutton.svg',
    },
    {
      name: 'Crop Trust',
      href: 'https://www.croptrust.org/',
      logo: 'crop-trust.svg',
    },
    {
      name: 'The Crop Wild Relatives Project',
      href: 'https://www.cwrdiversity.org/',
      logo: 'cwr.svg',
    },
    {
      name: 'Norway',
      href: 'https://www.norway.no/',
      logo: 'norway.svg',
    },
    {
      name: 'Norwegian Ministry of Foreign Affairs',
      href: 'https://www.regjeringen.no/en/dep/ud/id833/',
      logo: 'norwegian-ministry-of-foreign-affairs.svg',
    },
    {
      name: 'CIMMYT',
      href: 'https://www.cimmyt.org/',
      logo: 'cimmyt.svg',
    },
    {
      name: 'University of Dundee',
      href: 'https://www.dundee.ac.uk/',
      logo: 'uod.svg',
    },
    {
      name: 'UK Research and Innovation',
      href: 'https://www.ukri.org/',
      logo: 'ukri.svg',
    },
    {
      name: 'Biotechnology and Biological Sciences Research Council',
      href: 'https://bbsrc.ukri.org/',
      logo: 'bbsrc.svg',
    },
    {
      name: 'UKRI Innovate UK',
      href: 'https://www.gov.uk/government/organisations/innovate-uk',
      logo: 'innovate-uk.svg',
    },
    {
      name: 'Rural & Environment Science & Analytical Services',
      href: undefined,
      logo: 'resas.svg',
    },
    {
      name: 'The Scottish Government',
      href: 'https://www.gov.scot/',
      logo: 'scottish-government.svg',
    },
    {
      name: 'Scottish Environment, Food and Agriculture Research Institutes',
      href: 'https://sefari.scot/',
      logo: 'sefari.svg',
    },
    {
      name: 'James Hutton Institute Scientific Services',
      href: 'https://www.hutton.ac.uk/scientific-services/',
      logo: 'jhiss.svg',
    },
    {
      name: 'International Barley Hub',
      href: 'https://www.barleyhub.org/',
      logo: 'ibh.svg',
    },
    {
      name: 'CRP Maize',
      href: 'https://maize.org/',
      logo: 'crp-maize.svg',
    },
    {
      name: 'CRP Wheat',
      href: 'https://wheat.org/',
      logo: 'crp-wheat.svg',
    },
    {
      name: 'International Wheat Yield Partnership',
      href: 'https://iwyp.org/',
      logo: 'iwyp.svg',
    },
    {
      name: 'Secretaría de Agricultura y Desarrollo Rural',
      href: 'https://www.gob.mx/agricultura',
      logo: 'sader.svg',
    },
    {
      name: 'DivSeek International Network',
      href: 'https://divseekintl.org/',
      logo: 'divseek.png',
    },
    {
      name: 'European Union',
      href: 'https://europa.eu/',
      logo: 'eu.svg',
    },
    {
      name: 'Department for Environment, Food and Rural Affairs',
      href: 'https://www.gov.uk/government/organisations/department-for-environment-food-rural-affairs',
      logo: 'defra.svg',
    },
    {
      name: 'Templeton World Charity Foundation',
      href: 'https://www.templetonworldcharity.org/',
      logo: 'templeton.svg',
    },
  ])

  const location: ComputedRef<ViewTableLocations> = computed(() => {
    return {
      locationId: -1,
      locationLatitude: 56.4574,
      locationLongitude: -3.0686,
      locationName: t('pageAboutGerminateLocationText'),
      locationType: undefined,
      countryName: undefined,
      countryCode2: 'GB',
      countryCode3: 'GBR',
    }
  })

  const team = ref<TeamMember[]>([
    {
      name: 'Sebastian Raubach',
      job: () => t('pageAboutGerminateTeamJobSebastian'),
      img: 'sebastian-raubach.jpg',
      about: () => t('pageAboutGerminateTeamSebastian'),
      since: 2012,
      links: [{
        path: [bskyIcon],
        title: 'Bluesky',
        href: 'https://bsky.app/profile/bazraubach.bsky.social',
      }, {
        path: mdiTwitter,
        title: 'Twitter',
        href: 'https://twitter.com/BazRaubach',
      }, {
        path: mdiEarth,
        title: 'Website',
        href: 'https://www.hutton.ac.uk/staff/sebastian-raubach',
      }],
    },
    {
      name: 'Iain Milne',
      job: () => t('pageAboutGerminateTeamJobIain'),
      img: 'iain-milne.jpg',
      about: () => t('pageAboutGerminateTeamIain'),
      since: 2010,
      links: [{
        path: mdiEarth,
        title: 'Website',
        href: 'https://www.hutton.ac.uk/staff/iain-milne',
      }],
    },
    {
      name: 'Paul Shaw',
      job: () => t('pageAboutGerminateTeamJobPaul'),
      img: 'paul-shaw.jpg',
      about: () => t('pageAboutGerminateTeamPaul'),
      since: 2004,
      links: [{
        path: [bskyIcon],
        title: 'Bluesky',
        href: 'https://bsky.app/profile/cardinalb.bsky.social',
      }, {
        path: mdiTwitter,
        title: 'Twitter',
        href: 'https://twitter.com/cardinalb',
      }, {
        path: mdiEarth,
        title: 'Website',
        href: 'https://www.hutton.ac.uk/staff/paul-shaw',
      }],
    },
  ])

</script>
