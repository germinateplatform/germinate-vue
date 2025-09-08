<template>
  <v-container fluid>
    <div id="about-page">
      <h1 class="text-h4 mb-3">{{ $t('pageAboutGerminateTitle') }}</h1>
      <v-divider class="mb-3" />

      <v-row class="my-5">
        <v-col>
          <v-card color="primary">
            <div class="d-flex flex-column flex-sm-row justify-space-between align-center pa-3">
              <div class="pb-2">
                <v-card-title class="text-h3">{{ $t('pageAboutGerminateTitle') }}</v-card-title>
                <v-card-subtitle class="text-h6 pb-4 text-wrap">{{ $t('pageAboutGerminateSubtitle') }}</v-card-subtitle>

                <v-card-text class="py-2">
                  <v-icon icon="mdi-tag" /> {{ $t('pageFooterVersion', { version: germinateVersion }) }}
                </v-card-text>
                <v-card-text class="py-2">
                  <v-icon icon="mdi-information-outline" /> <a class="text-white" href="#" @click.prevent="emitter.emit('show-changelog')">{{ $t('pageAboutGerminateChangelog') }}</a>
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
        <v-col>
          <v-row>
            <v-col v-for="(banner, index) in banners" :key="'banner-' + banner.key">
              <v-card :color="getTemplateColor(index)" :href="banner.link">
                <div class="d-flex flex-no-wrap align-center justify-space-between">
                  <div>
                    <v-card-title class="text-h6">
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
        <v-col v-for="member in team" :key="`team-member-${member.name}`" class="d-flex">
          <v-card color="surface-variant" class="pa-5 d-flex">
            <div class="d-flex team-member">
              <div class="d-flex flex-column align-center">
                <v-avatar :image="`/img/${member.img}`" size="160" />
                <v-chip variant="tonal" label color="success" class="mt-3" prepend-icon="mdi-calendar">Since {{ member.since }}</v-chip>
              </div>

              <div class="ps-6">
                <div class="text-h5 mb-1 font-weight-bold d-flex align-center">
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
                  <v-icon :color="getTemplateColor(1)" icon="mdi-briefcase-variant" class="me-2" /> {{ member.job() }}
                </div>
                <div class="text-subtitle d-flex align-start my-2">
                  <v-icon :color="getTemplateColor(2)" icon="mdi-information" class="me-2" /> {{ member.about() }}
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <h2 class="mt-10 mb-3">{{ $t('pageAboutGerminateTeamOthersTitle') }}<small class="text-muted"> - {{ $t('pageAboutGerminateTeamOthersSubtitle') }}</small></h2>
      <div v-html="$t('pageAboutGerminateTeamOthersText')" />

      <h2 class="mt-10 mb-3">{{ $t('pageAboutGerminateLocationTitle') }}<small class="text-muted"> - {{ $t('pageAboutGerminateLocationSubtitle') }}</small></h2>
      <LocationMap :show-links="false" :locations="[location]" class="mb-5" />

      <h2 class="mt-10 mb-3">{{ $t('pageAboutGerminateFundersTitle') }}<small class="text-muted"> - {{ $t('pageAboutGerminateFundersSubtitle') }}</small></h2>
      <p>{{ $t('pageAboutGerminateFundersText') }}</p>
      <v-row class="funders">
        <v-col cols="12" sm="6" md="4" lg="3" xxl="2" v-for="(funder, i) in funders" :key="'about-funders-' + i" class="text-center pb-5 col-xxl-2">
          <div class="pa-3 pa-xl-4 img-container">
            <a :href="funder.href" :title="funder.name" target="_blank" rel="noopener noreferrer" v-if="funder.href">
              <v-img height="100" :src="`./img/${funder.logo}`" alt="Funder logo" />
            </a>
            <v-img height="100" :src="`./img/${funder.logo}`" alt="Funder logo" v-else />
          </div>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup lang="ts">
  import LocationMap from '@/components/map/LocationMap.vue'
  import type { ViewTableLocations } from '@/plugins/types/germinate'
  import { bskyIcon, germinateVersion } from '@/plugins/util'
  import { getTemplateColor } from '@/plugins/util/colors'
  import { useI18n } from 'vue-i18n'
  import emitter from 'tiny-emitter/instance'

  const { t } = useI18n()

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
      path: 'mdi-web',
      link: 'https://ics.hutton.ac.uk/get-germinate',
    },
    {
      key: 'github',
      text: () => t('pageAboutGerminateCardGithubText'),
      path: 'mdi-github',
      link: 'https://github.com/germinateplatform/germinate-vue',
    },
    {
      key: 'publication',
      text: () => t('pageAboutGerminateCardPublicationText'),
      path: 'mdi-file-document',
      link: 'https://dl.sciencesocieties.org/publications/cs/articles/57/3/1259',
    },
    {
      key: 'documentation',
      text: () => t('pageAboutGerminateCardDocumentationText'),
      path: 'mdi-glasses',
      link: 'https://germinateplatform.github.io/germinate-server',
    },
  ])

  const funders = ref<Funder[]>([
    {
      name: 'The James Hutton Institute',
      href: 'http://www.hutton.ac.uk/',
      logo: 'funders/hutton.svg',
    },
    {
      name: 'Crop Trust',
      href: 'https://www.croptrust.org/',
      logo: 'funders/crop-trust.svg',
    },
    {
      name: 'Biodiversity for Opportunities, Livelihoods and Development',
      href: 'https://bold.croptrust.org/',
      logo: 'funders/bold.svg',
    },
    {
      name: 'The Crop Wild Relatives Project',
      href: 'https://www.cwrdiversity.org/',
      logo: 'funders/cwr.svg',
    },
    {
      name: 'Norway',
      href: 'https://www.norway.no/',
      logo: 'funders/norway.svg',
    },
    {
      name: 'Norwegian Ministry of Foreign Affairs',
      href: 'https://www.regjeringen.no/en/dep/ud/id833/',
      logo: 'funders/norwegian-ministry-of-foreign-affairs.svg',
    },
    {
      name: 'Templeton World Charity Foundation',
      href: 'https://www.templetonworldcharity.org/',
      logo: 'funders/templeton.svg',
    },
    {
      name: 'CIMMYT',
      href: 'https://www.cimmyt.org/',
      logo: 'funders/cimmyt.svg',
    },
    {
      name: 'University of Dundee',
      href: 'https://www.dundee.ac.uk/',
      logo: 'funders/uod.svg',
    },
    {
      name: 'UK Research and Innovation',
      href: 'https://www.ukri.org/',
      logo: 'funders/ukri.svg',
    },
    {
      name: 'Biotechnology and Biological Sciences Research Council',
      href: 'https://bbsrc.ukri.org/',
      logo: 'funders/bbsrc.svg',
    },
    {
      name: 'UKRI Innovate UK',
      href: 'https://www.gov.uk/government/organisations/innovate-uk',
      logo: 'funders/innovate-uk.svg',
    },
    {
      name: 'Rural & Environment Science & Analytical Services',
      href: undefined,
      logo: 'funders/resas.svg',
    },
    {
      name: 'The Scottish Government',
      href: 'https://www.gov.scot/',
      logo: 'funders/scottish-government.svg',
    },
    {
      name: 'Scottish Environment, Food and Agriculture Research Institutes',
      href: 'https://sefari.scot/',
      logo: 'funders/sefari.svg',
    },
    {
      name: 'James Hutton Institute Scientific Services',
      href: 'https://www.hutton.ac.uk/scientific-services/',
      logo: 'funders/jhiss.svg',
    },
    {
      name: 'International Barley Hub',
      href: 'http://www.barleyhub.org/',
      logo: 'funders/ibh.svg',
    },
    {
      name: 'CRP Maize',
      href: 'https://maize.org/',
      logo: 'funders/crp-maize.svg',
    },
    {
      name: 'CRP Wheat',
      href: 'https://wheat.org/',
      logo: 'funders/crp-wheat.svg',
    },
    {
      name: 'International Wheat Yield Partnership',
      href: 'https://iwyp.org/',
      logo: 'funders/iwyp.svg',
    },
    {
      name: 'Secretaría de Agricultura y Desarrollo Rural',
      href: 'https://www.gob.mx/agricultura',
      logo: 'funders/sader.svg',
    },
    {
      name: 'DivSeek International Network',
      href: 'https://divseekintl.org/',
      logo: 'funders/divseek.png',
    },
    {
      name: 'European Union',
      href: 'https://europa.eu/',
      logo: 'funders/eu.svg',
    },
    {
      name: 'Department for Environment, Food and Rural Affairs',
      href: 'https://www.gov.uk/government/organisations/department-for-environment-food-rural-affairs',
      logo: 'funders/defra.svg',
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
      img: 'team/sebastian-raubach.jpg',
      about: () => t('pageAboutGerminateTeamSebastian'),
      since: 2012,
      links: [{
        path: [bskyIcon],
        title: 'Bluesky',
        href: 'https://bsky.app/profile/bazraubach.bsky.social',
      }, {
        path: 'mdi-twitter',
        title: 'Twitter',
        href: 'https://twitter.com/BazRaubach',
      }, {
        path: 'mdi-earth',
        title: 'Website',
        href: 'http://www.hutton.ac.uk/staff/sebastian-raubach',
      }],
    },
    {
      name: 'Iain Milne',
      job: () => t('pageAboutGerminateTeamJobIain'),
      img: 'team/iain-milne.jpg',
      about: () => t('pageAboutGerminateTeamIain'),
      since: 2010,
      links: [{
        path: 'mdi-earth',
        title: 'Website',
        href: 'http://www.hutton.ac.uk/staff/iain-milne',
      }],
    },
    {
      name: 'Paul Shaw',
      job: () => t('pageAboutGerminateTeamJobPaul'),
      img: 'team/paul-shaw.jpg',
      about: () => t('pageAboutGerminateTeamPaul'),
      since: 2004,
      links: [{
        path: [bskyIcon],
        title: 'Bluesky',
        href: 'https://bsky.app/profile/cardinalb.bsky.social',
      }, {
        path: 'mdi-twitter',
        title: 'Twitter',
        href: 'https://twitter.com/cardinalb',
      }, {
        path: 'mdi-earth',
        title: 'Website',
        href: 'http://www.hutton.ac.uk/staff/paul-shaw',
      }],
    },
  ])

</script>
