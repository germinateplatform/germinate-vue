<template>
  <div>
    <!-- Hutton banner -->
    <div class="row hutton-header mb-3">
      <div id="hutton-banner-hunger" class="col"></div>
      <div id="hutton-banner-education" class="col"></div>
      <div id="hutton-banner-water" class="col"></div>
      <div id="hutton-banner-energy" class="col"></div>
      <div id="hutton-banner-work" class="col"></div>
      <div class="w-100 d-md-none d-lg-none d-xl-none"></div>
      <div id="hutton-banner-industry" class="col"></div>
      <div id="hutton-banner-consumption" class="col"></div>
      <div id="hutton-banner-climate" class="col"></div>
      <div id="hutton-banner-land" class="col"></div>
      <div id="hutton-banner-partnership" class="col"></div>
    </div>
    <!-- Logo -->
    <div class="text-center py-3">
      <b-img src="./img/germinate-square.svg" fluid class="about-header-logo"/>
    </div>
    <!-- Title -->
    <div class="text-center">
      <h1>{{ $t('pageAboutGerminateTitle') }}<small> - {{ $t('pageAboutGerminateSubtitle') }}</small></h1>
    </div>
    <!-- Banner buttons -->
    <b-row class="about-banners" v-if="banners">
      <b-col cols=12 sm=6 xl=3 v-for="banner in banners" :key="'about-banners-' + banner.key">
        <a target="_blank" :href="banner.link">
          <b-card no-body :class="banner.key">
            <b-card-body>
              <b-row>
                <b-col cols=8 class="align-self-center">
                  <h5 class="mb-0">{{ banner.text() }}</h5>
                </b-col>
                <b-col cols=4 class="text-right">
                  <i :class="`mdi mdi-48px ${banner.icon}`" />
                </b-col>
              </b-row>
            </b-card-body>
          </b-card>
        </a>
      </b-col>
    </b-row>
    <!-- Text -->
    <div v-html="$t('pageAboutGerminateText')" />

    <!-- Team -->
    <h2>{{ $t('pageAboutGerminateTeamTitle') }}<small> - {{ $t('pageAboutGerminateTeamSubtitle') }}</small></h2>
    <b-row class="team-members">
      <b-col cols=12 sm=6 xl=3 v-for="(member, i) in team" :key="'about-team-' + i" class="text-center pb-5">
        <div class="px-5 pt-5 pb-3">
          <b-img :src="`./img/${member.img}`" rounded="circle" fluid />
        </div>
        <h2>{{ member.name }}</h2>
        <h5 class="text-primary text-uppercase">{{ member.job }}</h5>
        <p class="text-muted">{{ member.about }}</p>
        <a v-for="(link, j) in member.links" target="_blank" :title="link.title" :href="link.href" :key="`about-team-${i}-${j}`" class="px-1"><i :class="`mdi mdi-24px ${link.icon}`" /></a>
      </b-col>
    </b-row>

    <h3>{{ $t('pageAboutGerminateTeamOthersTitle') }}<small> - {{ $t('pageAboutGerminateTeamOthersSubtitle') }}</small></h3>
    <div v-html="$t('pageAboutGerminateTeamOthersText')" />

    <!-- Location -->
    <h2>{{ $t('pageAboutGerminateLocationTitle') }}<small> - {{ $t('pageAboutGerminateLocationSubtitle') }}</small></h2>
    <LocationMap :locations="[getLocation()]" :showLinks="false" :climateOverlaysDisabled="true" class="mb-5" />

    <!-- Funders -->
    <h2>{{ $t('pageAboutGerminateFundersTitle') }}<small> - {{ $t('pageAboutGerminateFundersSubtitle') }}</small></h2>
    <p>{{ $t('pageAboutGerminateFundersText') }}</p>
    <b-row class="funders">
      <b-col cols=6 sm=4 xl=2 v-for="(funder, i) in funders" :key="'about-funders-' + i" class="text-center pb-5">
        <div class="p-3 img-container d-flex justify-content-center">
          <a :href="funder.href" :title="funder.name" target="_blank" class="align-self-center" v-if="funder.href">
            <b-img :src="`./img/${funder.logo}`" fluid />
          </a>
          <b-img :src="`./img/${funder.logo}`" fluid v-else />
        </div>
      </b-col>
    </b-row>

    <!-- Footer -->
    <b-row class="about-footer bg-dark px-3">
      <b-col cols=12 sm=6 xl=4 class="about-logo">
        <b-img src="./img/germinate-square.svg" fluid class="my-5" />
        <b-img src="./img/germinate-text.svg" fluid class="my-5 germinate-text"/>
      </b-col>
      <b-col cols=12 sm=6 xl=4 class="about-logo">
        <b-img src="./img/hutton.svg" fluid class="my-5" />
      </b-col>
      <b-col cols=12 sm=6 xl=4 class="about-logo">
        <b-img src="./img/ics-sdg.svg" fluid class="my-5" />
      </b-col>
    </b-row>
  </div>
</template>

<script>
import LocationMap from '@/components/map/LocationMap'

export default {
  data: function () {
    return {
      banners: [
        {
          key: 'homepage',
          text: () => this.$t('pageAboutGerminateCardHomepageText'),
          icon: 'mdi-web',
          link: 'https://ics.hutton.ac.uk/get-germinate'
        },
        {
          key: 'github',
          text: () => this.$t('pageAboutGerminateCardGithubText'),
          icon: 'mdi-github-circle',
          link: 'https://github.com/germinateplatform/germinate-vue'
        },
        {
          key: 'publication',
          text: () => this.$t('pageAboutGerminateCardPublicationText'),
          icon: 'mdi-file-document',
          link: 'https://dl.sciencesocieties.org/publications/cs/articles/57/3/1259'
        },
        {
          key: 'documentation',
          text: () => this.$t('pageAboutGerminateCardDocumentationText'),
          icon: 'mdi-glasses',
          link: 'https://germinateplatform.github.io/germinate-server'
        }
      ],
      team: [
        {
          name: 'Sebastian Raubach',
          job: 'Lead developer',
          img: 'team/sebastian-raubach.jpg',
          about: 'Sebastian is responsible for the bulk of the development on the database and web interface. He makes sure everything is nice and tidy and looks as best as it can.',
          links: [{
            icon: 'mdi-twitter',
            title: 'Twitter',
            href: 'https://twitter.com/BazRaubach'
          }, {
            icon: 'mdi-earth',
            title: 'Website',
            href: 'http://www.hutton.ac.uk/staff/sebastian-raubach'
          }]
        },
        {
          name: 'Gordon Stephen',
          job: 'BrAPI integrator',
          img: 'team/gordon-stephen.jpg',
          about: 'Gordon looks after the Plant Breeding API (BrAPI) part of Germinate. He attends the hackathons and updates the Germinate implementation of BrAPI accordingly.',
          links: [{
            icon: 'mdi-earth',
            title: 'Website',
            href: 'http://www.hutton.ac.uk/staff/gordon-stephen'
          }]
        },
        {
          name: 'Iain Milne',
          job: 'Flapjack developer',
          img: 'team/iain-milne.jpg',
          about: 'Iain is the main developer of Flapjack and makes sure that the integration between Germinate and Flapjack is as smooth as possible.',
          links: [{
            icon: 'mdi-earth',
            title: 'Website',
            href: 'http://www.hutton.ac.uk/staff/iain-milne'
          }]
        },
        {
          name: 'Paul Shaw',
          job: 'Project Lead',
          img: 'team/paul-shaw.jpg',
          about: 'Paul has worked on Germinate since 2005 and is responsible for the day to day management of the project and its promotion around the world.',
          links: [{
            icon: 'mdi-twitter',
            title: 'Twitter',
            href: 'https://twitter.com/cardinalb'
          }, {
            icon: 'mdi-earth',
            title: 'Website',
            href: 'http://www.hutton.ac.uk/staff/paul-shaw'
          }]
        }
      ],
      funders: [
        {
          name: 'The James Hutton Institute',
          href: 'http://www.hutton.ac.uk/',
          logo: 'funders/hutton.svg'
        },
        {
          name: 'CIMMYT',
          href: 'https://www.cimmyt.org/',
          logo: 'funders/cimmyt.svg'
        },
        {
          name: 'Crop Trust',
          href: 'https://www.croptrust.org/',
          logo: 'funders/crop-trust.svg'
        },
        {
          name: 'The Crop Wild Relatives Project',
          href: 'https://www.cwrdiversity.org/',
          logo: 'funders/cwr.svg'
        },
        {
          name: 'University of Dundee',
          href: 'https://www.dundee.ac.uk/',
          logo: 'funders/uod.svg'
        },
        {
          name: 'Biotechnology and Biological Sciences Research Council',
          href: 'https://bbsrc.ukri.org/',
          logo: 'funders/bbsrc.svg'
        },
        {
          name: 'Rural & Environment Science & Analytical Services',
          href: null,
          logo: 'funders/resas.svg'
        },
        {
          name: 'The Scottish Government',
          href: 'https://www.gov.scot/',
          logo: 'funders/scottish-government.svg'
        },
        {
          name: 'Scottish Environment, Food and Agriculture Research Institutes',
          href: 'https://sefari.scot/',
          logo: 'funders/sefari.svg'
        },
        {
          name: 'James Hutton Limited',
          href: 'https://huttonltd.com/',
          logo: 'funders/huttonltd.svg'
        },
        {
          name: 'UKRI Innovate UK',
          href: 'https://www.gov.uk/government/organisations/innovate-uk',
          logo: 'funders/innovate-uk.svg'
        },
        {
          name: 'International Barley Hub',
          href: 'http://www.barleyhub.org/',
          logo: 'funders/ibh.svg'
        },
        {
          name: 'CRP Maize',
          href: 'https://maize.org/',
          logo: 'funders/crp-maize.svg'
        },
        {
          name: 'CRP Wheat',
          href: 'https://wheat.org/',
          logo: 'funders/crp-wheat.svg'
        },
        {
          name: 'International Wheat Yield Partnership',
          href: 'https://iwyp.org/',
          logo: 'funders/iwyp.svg'
        },
        {
          name: 'Secretaría de Agricultura y Desarrollo Rural',
          href: 'https://www.gob.mx/agricultura',
          logo: 'funders/sader.svg'
        }
      ]
    }
  },
  components: {
    LocationMap
  },
  methods: {
    getLocation: function () {
      return {
        locationId: -1,
        locationLatitude: 56.4574,
        locationLongitude: -3.0686,
        locationName: this.$t('pageAboutGerminateLocationText'),
        locationType: null,
        countryName: null,
        countryCode2: 'GB',
        countryCode3: 'GBR'
      }
    }
  }
}
</script>

<style scoped>
.about-header-logo {
  max-height: 200px;
}
.about-banners p {
  margin-bottom: 0;
}
.about-banners *:hover {
  text-decoration: none;
}
.about-banners .card-footer i.mdi {
  vertical-align: sub;
}
.about-banners .card-body {
  color: white;
}
.about-banners .homepage {
  border: 1px solid #ff9e15;
}
.about-banners .homepage .card-body {
  background-color: #ff9e15;
}
.about-banners .homepage .card-body i {
  color: #ffc87a;
}
.about-banners .github {
  border: 1px solid #799900;
}
.about-banners .github .card-body {
  background-color: #799900;
}
.about-banners .github .card-body i {
  color: #c8ff00;
}
.about-banners .publication {
  border: 1px solid #00748c;
}
.about-banners .publication .card-body {
  background-color: #00748c;
}
.about-banners .publication .card-body i {
  color: #00c8f0;
}
.about-banners .documentation {
  border: 1px solid #853175;
}
.about-banners .documentation .card-body {
  background-color: #853175;
}
.about-banners .documentation .card-body i {
  color: #c25baf;
}
.about-logo {
  display: inline-block;
  vertical-align: middle;
  float: none;
  text-align: center;
}
.about-logo img {
  height: 150px;
  width: auto;
}
.about-footer {
  margin-left: -30px;
  margin-right: -30px;
  margin-bottom: -25px;
}
.about-footer img {
  max-height: 100px;
}
.about-footer img.germinate-text {
  height: 30px;
  margin-left: 15px;
}
.funders img {
  width: 100%;
  height: auto;
}
.hutton-header {
  margin-left: -30px;
  margin-right: -30px;
  margin-top: -17px;
}
.team-members img {
  max-height: 300px;
  width: auto;
  box-shadow: 0 2px 5px 0 rgba(0,0,0,.16),0 2px 10px 0 rgba(0,0,0,.12);
  transition: transform .2s;
}
.team-members img:hover {
  transform: scale(1.05);
}
.funders .img-container {
  height: 200px;
}
.funders img {
  height: 150px;
  width: auto;
}
.hutton-header.row .col {
  min-height: 100px;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: auto 70%;
}
#hutton-banner-hunger {
  background-color: #FF9E15;
  background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgaWQ9InN2ZzYxODkiCiAgIHZlcnNpb249IjEuMSIKICAgdmlld0JveD0iMCAwIDY3LjczMzMyNyA2Ny43MzMzMjkiCiAgIGhlaWdodD0iMjU1Ljk5OTk4IgogICB3aWR0aD0iMjU1Ljk5OTk4Ij4KICA8ZGVmcwogICAgIGlkPSJkZWZzNjE4MyIgLz4KICA8bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGE2MTg2Ij4KICAgIDxyZGY6UkRGPgogICAgICA8Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+CiAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+CiAgICAgICAgPGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPgogICAgICAgIDxkYzp0aXRsZT48L2RjOnRpdGxlPgogICAgICA8L2NjOldvcms+CiAgICA8L3JkZjpSREY+CiAgPC9tZXRhZGF0YT4KICA8ZwogICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI2MC41OTgwNSwtNDcuNjMyNTU3KSIKICAgICBpZD0ibGF5ZXIxIj4KICAgIDxnCiAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgyLjI3MDg3MjQsMCwwLDIuMjcwODcyNCwzOC41Nzk5OTcsLTQxMy41MjQzKSIKICAgICAgIGlkPSJnNjE2NyI+CiAgICAgIDxnCiAgICAgICAgIGlkPSJnNDAiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDA0MDM0MDksMCwwLC0wLjQwNDAzNDA5LC0xMjEuMDE1NDIsMjEwLjE4NDg4KSI+CiAgICAgICAgPHBhdGgKICAgICAgICAgICBkPSJNIDAsMCBDIDAuMTYsLTIuMjg1IDEuMTM5LC00LjQ1NyAyLjc3MywtNi4wODkgNC4zNTcsLTcuNjc0IDYuNDYsLTguNjUzIDguNjk0LC04Ljg0NyA4LjY0OCwtOC43NjEgOC42MSwtOC42NjcgOC41ODUsLTguNTY4IDcuNTg3LC00LjcgNi41OTMsLTMuMjc3IDYuMDkxLC0yLjc3MyA0LjQ1NSwtMS4xMzkgMi4yODUsLTAuMTU5IDAsMCBNIDkuNjk3LC05LjQ3NyBDIDkuNzk1LC05LjY0OSA5Ljg1LC05Ljg0OCA5Ljg1LC0xMC4wNTggdiAtMC4yMTMgYyAwLjE5LDAuMzA1IDAuNTEzLDAuNTIxIDAuODk2LDAuNTYxIDIuMTkxLDAuMjM1IDQuMTcyLDEuMTgyIDUuNzI1LDIuNzQgMS42MzMsMS42MzMgMi42MTMsMy44MDQgMi43NzYsNi4wODkgLTIuMjg2LC0wLjE1OSAtNC40NTUsLTEuMTM4IC02LjA5LC0yLjc3MyAtMC44MzEsLTAuODMyIC0xLjU5MSwtMy4wNiAtMi4wNDEsLTQuMzkxIEwgMTAuOTA0LC04LjY2NyBDIDEwLjcyNSwtOS4xNjkgMTAuMjU2LC05LjQ4MSA5LjcwNywtOS40NzggOS43MDYsLTkuNDc3IDkuNzAyLC05LjQ3NyA5LjcwMiwtOS40NzcgWiBtIDEuMTc4LC0xMC4xMTggYyAtMC41MDMsMCAtMC45MzYsMC4zMDkgLTEuMTIsMC43NDggLTAuMTgxLC0wLjQzOSAtMC42MTMsLTAuNzQ4IC0xLjExOSwtMC43NDggLTAuNjY5LDAgLTEuMjEzLDAuNTQzIC0xLjIxMywxLjIxMyB2IDcuMjU5IGMgLTIuNDAyLDAuNDI4IC00LjYyOSwxLjU4MyAtNi4zNjYsMy4zMiAtMi4zOTEsMi4zOSAtMy42NjQsNS43MDIgLTMuNDg4LDkuMDg4IDAuMDMzLDAuNjIxIDAuNTI3LDEuMTE3IDEuMTQ4LDEuMTQ5IDMuMzc0LDAuMTcyIDYuNjk2LC0xLjA5OCA5LjA4NywtMy40OTMgMC43MzgsLTAuNzM4IDEuNDIxLC0xLjg5NyAyLjAzOSwtMy40NjMgMC40MzcsMS4wMDEgMC45NjEsMS45NDYgMS42LDIuNTg0IDIuMzkxLDIuMzkyIDUuNzI0LDMuNjYxIDkuMDg4LDMuNDkxIDAuNjIyLC0wLjAzMiAxLjExNiwtMC41MjggMS4xNDcsLTEuMTUxIDAuMTc0LC0zLjM4NSAtMS4xMDEsLTYuNjk4IC0zLjQ5MSwtOS4wODcgLTEuNjYzLC0xLjY2NiAtMy43OTgsLTIuODA1IC02LjA5OCwtMy4yNjggdiAtNi40MjkgYyAwLC0wLjY3IC0wLjU0NCwtMS4yMTMgLTEuMjE0LC0xLjIxMyIKICAgICAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICAgIGlkPSJwYXRoNDIiIC8+CiAgICAgIDwvZz4KICAgICAgPGcKICAgICAgICAgaWQ9Imc0NCIKICAgICAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMC40MDQwMzQwOSwwLDAsLTAuNDA0MDM0MDksLTExMi41MDI0NiwyMjUuODAxOTIpIj4KICAgICAgICA8cGF0aAogICAgICAgICAgIGQ9Im0gMCwwIGggMTMuNDU1IHYgMTEuODQ5IGwgLTcuNDM2LDYuMjgyIGMgLTYuODM5LDAuMzkgLTIzLjM0NSwxLjMyOCAtMjMuOTE1LDEuMzQ0IC0wLjQ3NywwIC0wLjg4NCwtMC40MDYgLTAuODg0LC0wLjkwNyAwLC0wLjUgMC40MDcsLTAuOTA5IDAuOTA3LC0wLjkwOSAxMS41ODMsLTEuNDkyIDExLjU5NSwtMS41MjIgMTEuOTYsLTIuMzA3IDAuMTc0LC0wLjM3NiAwLjE0MiwtMC44MTUgLTAuMDgsLTEuMTYzIEMgLTYuMjE1LDEzLjg0MiAtNi42LDEzLjYzIC03LjAxNCwxMy42MyBoIC0xNS43MTkgYyAtMC43ODcsMCAtOS44OTEsNS42MzkgLTkuOTUsNS42OTcgLTAuNTI0LDAuNDcgLTEuMzk1LDAuNDIxIC0xLjg2OCwtMC4xMDIgLTAuNDg3LC0wLjU0MSAtMC40NDEsLTEuMzc5IDAuMTAxLC0xLjg2NyAxLjE2NywtMS4wNDkgMTUuMTY3LC0xMC42OSAxNi45MzUsLTExLjExIEwgLTEuMjEyLDYuMjU3IEMgLTAuNTQ0LDYuMjU3IDAsNS43MTQgMCw1LjA0NiBaIE0gMTQuNjY2LC0yLjQyNCBIIC0xLjIxMiBjIC0wLjY3MSwwIC0xLjIxNSwwLjU0MiAtMS4yMTUsMS4yMTEgdiA1LjA0NiBoIC0xNS4yMTcgYyAtMi4zNDksMCAtMTguMjk2LDExLjYwNCAtMTguNDI3LDExLjcyMSAtMS41MzgsMS4zODEgLTEuNjY0LDMuNzU2IC0wLjI4Miw1LjI5NCAxLjMzNCwxLjQ3NiAzLjgxNCwxLjYwNyA1LjI5LDAuMjgxIDAuNTU5LC0wLjQyNyA3LjIzMiwtNC4zMDQgOC42MjksLTUuMDc0IGggMi4zNTIgYyAtMC42NzgsMC42MTEgLTEuMTIyLDEuNTEyIC0xLjEyMiwyLjUxMyAwLDEuODM2IDEuNDkzLDMuMzMxIDMuMzMxLDMuMzMxIDAuMzY1LDAgMTguNzk0LC0xLjA1IDI0LjQzNiwtMS4zNyAwLjI2MiwtMC4wMTYgMC41MTIsLTAuMTE2IDAuNzEyLC0wLjI4NSBsIDguMTczLC02LjkwNiBjIDAuMjczLC0wLjIzIDAuNDMxLC0wLjU3MSAwLjQzMSwtMC45MjcgViAtMS4yMTMgYyAwLC0wLjY2OSAtMC41NDIsLTEuMjExIC0xLjIxMywtMS4yMTEiCiAgICAgICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZjtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIKICAgICAgICAgICBpZD0icGF0aDQ2IiAvPgogICAgICA8L2c+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K);
}
#hutton-banner-education {
  background-color: #FFD100;
  background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgaWQ9InN2ZzYxODkiCiAgIHZlcnNpb249IjEuMSIKICAgdmlld0JveD0iMCAwIDY3LjczMzMyNyA2Ny43MzMzMjkiCiAgIGhlaWdodD0iMjU1Ljk5OTk4IgogICB3aWR0aD0iMjU1Ljk5OTk4Ij4KICA8ZGVmcwogICAgIGlkPSJkZWZzNjE4MyIgLz4KICA8bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGE2MTg2Ij4KICAgIDxyZGY6UkRGPgogICAgICA8Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+CiAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+CiAgICAgICAgPGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPgogICAgICAgIDxkYzp0aXRsZT48L2RjOnRpdGxlPgogICAgICA8L2NjOldvcms+CiAgICA8L3JkZjpSREY+CiAgPC9tZXRhZGF0YT4KICA8ZwogICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI2MC41OTgwNSwtNDcuNjMyNTU3KSIKICAgICBpZD0ibGF5ZXIxIj4KICAgIDxnCiAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgyLjI3MDg3MjQsMCwwLDIuMjcwODcyNCwtMzguNTM5ODA4LC00MTMuNTI0ODIpIgogICAgICAgaWQ9Imc2NzkwIj4KICAgICAgPGcKICAgICAgICAgaWQ9Imc4NiIKICAgICAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMC40MDQwMzQwOSwwLDAsLTAuNDA0MDM0MDksLTkxLjQ3NjY1MSwyMTUuNTc4ODIpIj4KICAgICAgICA8cGF0aAogICAgICAgICAgIGQ9Ik0gMCwwIDE5LjgwNywtMTAuNTI3IDM5LjYxMiwwIDE5LjgwNSwxMC4zODUgWiBtIDE5LjgwNywtMTMuNDMyIGMgLTAuMjE5LDAgLTAuNDQsMC4wNTMgLTAuNjQsMC4xNTkgTCAtMy41NTcsLTEuMTk0IGMgLTAuNDQ2LDAuMjM1IC0wLjcyNCwwLjcgLTAuNzIzLDEuMjA2IDAuMDAyLDAuNTA1IDAuMjgyLDAuOTY4IDAuNzI5LDEuMjAzIEwgMTkuMTcyLDEzLjEzIGMgMC4zOTgsMC4yMDggMC44NywwLjIwOCAxLjI2NiwwIEwgNDMuMTY0LDEuMjE1IEMgNDMuNjEyLDAuOTggNDMuODkzLDAuNTE3IDQzLjg5MywwLjAxMiA0My44OTUsLTAuNDk0IDQzLjYxNiwtMC45NTkgNDMuMTcsLTEuMTk0IEwgMjAuNDQ3LC0xMy4yNzMgYyAtMC4yLC0wLjEwNiAtMC40MjIsLTAuMTU5IC0wLjY0LC0wLjE1OSIKICAgICAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICAgIGlkPSJwYXRoODgiIC8+CiAgICAgIDwvZz4KICAgICAgPGcKICAgICAgICAgaWQ9Imc5MCIKICAgICAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMC40MDQwMzQwOSwwLDAsLTAuNDA0MDM0MDksLTgzLjQ3NDA2NywyMjUuNzY2MTMpIj4KICAgICAgICA8cGF0aAogICAgICAgICAgIGQ9Im0gMCwwIGMgLTUuOTE0LDAgLTE1LjkyMSwxLjEzNCAtMTUuOTIxLDUuMzgzIHYgMTQuNzY1IGMgMCwwLjc1MiAwLjYxMiwxLjM2MyAxLjM2NCwxLjM2MyAwLjc1MiwwIDEuMzYzLC0wLjYxMSAxLjM2MywtMS4zNjMgViA1LjM4MyBDIC0xMi44MjYsNC40OTQgLTcuOTU4LDIuNzI0IDAsMi43MjQgYyA3Ljk1OSwwIDEyLjgyNCwxLjc3IDEzLjIwMSwyLjcxOSBsIC0wLjAwOCwxNC43MDUgYyAwLDAuNzUyIDAuNjExLDEuMzYzIDEuMzYyLDEuMzYzIDAuNzUzLDAgMS4zNjQsLTAuNjExIDEuMzY0LC0xLjM2MyBWIDUuMzgzIEMgMTUuOTE5LDEuMTM0IDUuOTEyLDAgMCwwIgogICAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgaWQ9InBhdGg5MiIgLz4KICAgICAgPC9nPgogICAgICA8ZwogICAgICAgICBpZD0iZzk0IgogICAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjQwNDAzNDA5LDAsMCwtMC40MDQwMzQwOSwtNzQuMDEyMjM3LDIxOC45NzM5NikiPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgZD0ibSAwLDAgYyAtMC4zNzYsMCAtMC42NzksMC4zMDYgLTAuNjc5LDAuNjgxIHYgNy42NSBjIDAsMC4zNzcgMC4zMDMsMC42ODEgMC42NzksMC42ODEgMC4zNzgsMCAwLjY4MSwtMC4zMDQgMC42ODEsLTAuNjgxIFYgMC42ODEgQyAwLjY4MSwwLjMwNiAwLjM3OCwwIDAsMCIKICAgICAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICAgIGlkPSJwYXRoOTYiIC8+CiAgICAgIDwvZz4KICAgICAgPGcKICAgICAgICAgaWQ9Imc5OCIKICAgICAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMC40MDQwMzQwOSwwLDAsLTAuNDA0MDM0MDksLTc0LjAxMjIzNywyMTkuNDczOTUpIj4KICAgICAgICA8cGF0aAogICAgICAgICAgIGQ9Im0gMCwwIGMgLTAuNTEsMCAtMC45MjYsLTAuNDE1IC0wLjkyNiwtMC45MjUgMCwtMC41MSAwLjQxNiwtMC45MjYgMC45MjYsLTAuOTI2IDAuNTEsMCAwLjkyNSwwLjQxNiAwLjkyNSwwLjkyNiBDIDAuOTI1LC0wLjQxNSAwLjUxLDAgMCwwIG0gMCwtNC41NzUgYyAtMi4wMTIsMCAtMy42NDksMS42MzcgLTMuNjQ5LDMuNjUgMCwyLjAxMyAxLjYzNywzLjY0OSAzLjY0OSwzLjY0OSAyLjAxNCwwIDMuNjQ5LC0xLjYzNiAzLjY0OSwtMy42NDkgMCwtMi4wMTMgLTEuNjM1LC0zLjY1IC0zLjY0OSwtMy42NSIKICAgICAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICAgIGlkPSJwYXRoMTAwIiAvPgogICAgICA8L2c+CiAgICAgIDxnCiAgICAgICAgIGlkPSJnMTAyIgogICAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjQwNDAzNDA5LDAsMCwtMC40MDQwMzQwOSwtODMuNDc0MDY3LDIyMy44MDkyMikiPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgZD0ibSAwLDAgYyAtNy41NzQsMCAtMTUuMjM4LDEuNjE3IC0xNS4yMzgsNC43MDIgMCwwLjM3NiAwLjMwNCwwLjY4MiAwLjY4MSwwLjY4MiAwLjM3NywwIDAuNjgsLTAuMzA2IDAuNjgsLTAuNjgyIDAsLTEuMzYyIDUuNDA2LC0zLjMzOSAxMy44NzcsLTMuMzM5IDguNDY5LDAgMTMuODc1LDEuOTc3IDEzLjg3NSwzLjMzOSAwLDAuMzc2IDAuMzA0LDAuNjgyIDAuNjgsMC42ODIgMC4zNzgsMCAwLjY4MSwtMC4zMDYgMC42ODEsLTAuNjgyIEMgMTUuMjM2LDEuNjE3IDcuNTcyLDAgMCwwIgogICAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgaWQ9InBhdGgxMDQiIC8+CiAgICAgIDwvZz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPgo=);
}
#hutton-banner-water {
  background-color: #D6C200;
  background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgaWQ9InN2ZzYxODkiCiAgIHZlcnNpb249IjEuMSIKICAgdmlld0JveD0iMCAwIDY3LjczMzMyNyA2Ny43MzMzMjkiCiAgIGhlaWdodD0iMjU1Ljk5OTk4IgogICB3aWR0aD0iMjU1Ljk5OTk4Ij4KICA8ZGVmcwogICAgIGlkPSJkZWZzNjE4MyIgLz4KICA8bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGE2MTg2Ij4KICAgIDxyZGY6UkRGPgogICAgICA8Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+CiAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+CiAgICAgICAgPGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPgogICAgICAgIDxkYzp0aXRsZT48L2RjOnRpdGxlPgogICAgICA8L2NjOldvcms+CiAgICA8L3JkZjpSREY+CiAgPC9tZXRhZGF0YT4KICA8ZwogICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI2MC41OTgwNSwtNDcuNjMyNTU3KSIKICAgICBpZD0ibGF5ZXIxIj4KICAgIDxnCiAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgyLjI3MDg3MjQsMCwwLDIuMjcwODcyNCwtMTE2LjA4OTMzLC00MTMuNTI1MjEpIgogICAgICAgaWQ9Imc2ODU5Ij4KICAgICAgPGcKICAgICAgICAgaWQ9Imc0OCIKICAgICAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMC40MDQwMzQwOSwwLDAsLTAuNDA0MDM0MDksLTUzLjA1MTMxMiwyMjMuNjQyMzcpIj4KICAgICAgICA8cGF0aAogICAgICAgICAgIGQ9Im0gMCwwIC0zLjMwMiwtNS42ODQgYyAtMC4yMDIsLTAuNDI0IC0wLjMyNiwtMC45NTIgLTAuMzI2LC0xLjQ5MyAwLC0xLjk5OCAxLjYyOCwtMy42MjEgMy42MjgsLTMuNjIxIDEuOTk4LDAgMy42MjMsMS42MjMgMy42MjMsMy42MjEgMCwwLjUzOSAtMC4xMjQsMS4wNyAtMC4zNjgsMS41ODIgeiBtIDAsLTEzLjIyNCBjIC0zLjMzOCwwIC02LjA1MywyLjcxMiAtNi4wNTMsNi4wNDcgMCwwLjkxIDAuMjA2LDEuNzk3IDAuNjEsMi42MzIgbCA0LjM5Niw3LjU2NiBjIDAuNDMyLDAuNzQ1IDEuNjYzLDAuNzQ1IDIuMDk2LDAgTCA1LjQsLTQuNDY1IGMgMC40NDYsLTAuOTI3IDAuNjQ4LC0xLjgxIDAuNjQ4LC0yLjcxMiAwLC0zLjMzNSAtMi43MTIsLTYuMDQ3IC02LjA0OCwtNi4wNDciCiAgICAgICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZjtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIKICAgICAgICAgICBpZD0icGF0aDUwIiAvPgogICAgICA8L2c+CiAgICAgIDxnCiAgICAgICAgIGlkPSJnNTIiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDA0MDM0MDksMCwwLC0wLjQwNDAzNDA5LC01MS41MDU3NiwyMjMuMTU3NzgpIj4KICAgICAgICA8cGF0aAogICAgICAgICAgIGQ9Im0gMCwwIGggLTExLjgyNCBjIC0wLjY2OCwwIC0xLjIxMiwwLjU0MiAtMS4yMTIsMS4yMTEgdiAxNi44NzUgYyAwLDAuNjcgMC41NDQsMS4yMTIgMS4yMTIsMS4yMTIgMC42NzEsMCAxLjIxNCwtMC41NDIgMS4yMTQsLTEuMjEyIFYgMi40MjUgaCA5LjM5NyBWIDcuODg2IEMgLTEuMjEzLDguNTU3IC0wLjY3LDkuMSAwLDkuMSAwLjY2OCw5LjEgMS4yMTEsOC41NTcgMS4yMTEsNy44ODYgViAxLjIxMSBDIDEuMjExLDAuNTQyIDAuNjY4LDAgMCwwIgogICAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgaWQ9InBhdGg1NCIgLz4KICAgICAgPC9nPgogICAgICA8ZwogICAgICAgICBpZD0iZzU2IgogICAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjQwNDAzNDA5LDAsMCwtMC40MDQwMzQwOSwtNDguNDQ0MzkzLDIxMy45NzI2NikiPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgZD0ibSAwLDAgaCAtMTMuNTM3IGMgLTAuNjY4LDAgLTEuMjEyLDAuNTQzIC0xLjIxMiwxLjIxMyAwLDAuNjY5IDAuNTQ0LDEuMjEyIDEuMjEyLDEuMjEyIEggMCBDIDAuNjY4LDIuNDI1IDEuMjEyLDEuODgyIDEuMjEyLDEuMjEzIDEuMjEyLDAuNTQzIDAuNjY4LDAgMCwwIgogICAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgaWQ9InBhdGg1OCIgLz4KICAgICAgPC9nPgogICAgICA8ZwogICAgICAgICBpZD0iZzYwIgogICAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjQwNDAzNDA5LDAsMCwtMC40MDQwMzQwOSwtNDIuOTc0MTM1LDIxOC43NDg5OSkiPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgZD0ibSAwLDAgaCAtMTUuMjU3IGMgLTAuNjY5LDAgLTEuMjEyLDAuNTQzIC0xLjIxMiwxLjIxMiAwLDAuNjcgMC41NDMsMS4yMTMgMS4yMTIsMS4yMTMgaCAxNC4wNDQgdiA5LjM5NyBoIC0zLjQ2NiBjIC0wLjY2OSwwIC0xLjIxMywwLjU0MyAtMS4yMTMsMS4yMTIgMCwwLjY2OSAwLjU0NCwxLjIxMyAxLjIxMywxLjIxMyBIIDAgYyAwLjY3LDAgMS4yMTIsLTAuNTQ0IDEuMjEyLC0xLjIxMyBWIDEuMjEyIEMgMS4yMTIsMC41NDMgMC42NywwIDAsMCIKICAgICAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICAgIGlkPSJwYXRoNjIiIC8+CiAgICAgIDwvZz4KICAgICAgPGcKICAgICAgICAgaWQ9Imc2NCIKICAgICAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMC40MDQwMzQwOSwwLDAsLTAuNDA0MDM0MDksLTUxLjUwNTc2LDIyMC40NjEwNCkiPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgZD0ibSAwLDAgYyAtMC42NywwIC0xLjIxMywwLjU0MyAtMS4yMTMsMS4yMTIgMCwyLjAzOCAwLjkxOCw1LjQ1NyA3LjA3Miw1LjQ1NyBDIDYuNTI4LDYuNjY5IDcuMDcsNi4xMjUgNy4wNyw1LjQ1NiA3LjA3LDQuNzg2IDYuNTI4LDQuMjQzIDUuODU5LDQuMjQzIDEuMjExLDQuMjQzIDEuMjExLDIuMDQyIDEuMjExLDEuMjEyIDEuMjExLDAuNTQzIDAuNjY4LDAgMCwwIgogICAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgaWQ9InBhdGg2NiIgLz4KICAgICAgPC9nPgogICAgICA8ZwogICAgICAgICBpZD0iZzY4IgogICAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjQwNDAzNDA5LDAsMCwtMC40MDQwMzQwOSwtNTYuMjgyNDEzLDIxNi4zNDA0MykiPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgZD0ibSAwLDAgYyAtMC42NzEsMCAtMS4yMTEsMC41NDQgLTEuMjExLDEuMjEyIDAsMy45IDMuMTcyLDcuMDc0IDcuMDcsNy4wNzQgMC42NjksMCAxLjIxMywtMC41NDQgMS4yMTMsLTEuMjE0IEMgNy4wNzIsNi40MDQgNi41MjgsNS44NiA1Ljg1OSw1Ljg2IDMuMjk3LDUuODYgMS4yMTMsMy43NzUgMS4yMTMsMS4yMTIgMS4yMTMsMC41NDQgMC42NywwIDAsMCIKICAgICAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICAgIGlkPSJwYXRoNzAiIC8+CiAgICAgIDwvZz4KICAgICAgPGcKICAgICAgICAgaWQ9Imc3MiIKICAgICAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMC40MDQwMzQwOSwwLDAsLTAuNDA0MDM0MDksLTQ0Ljg2NDUzMSwyMTMuOTcyNjYpIj4KICAgICAgICA8cGF0aAogICAgICAgICAgIGQ9Ik0gMCwwIEMgLTAuNjcxLDAgLTEuMjEzLDAuNTQzIC0xLjIxMywxLjIxMyBWIDcuMjQgSCAtNy42NDcgViAxLjIxMyBDIC03LjY0NywwLjU0MyAtOC4xOTEsMCAtOC44NiwwIGMgLTAuNjcsMCAtMS4yMTQsMC41NDMgLTEuMjE0LDEuMjEzIHYgNy4yMzkgYyAwLDAuNjcxIDAuNTQ0LDEuMjE0IDEuMjE0LDEuMjE0IEggMCBjIDAuNjY4LDAgMS4yMTIsLTAuNTQzIDEuMjEyLC0xLjIxNCBWIDEuMjEzIEMgMS4yMTIsMC41NDMgMC42NjgsMCAwLDAiCiAgICAgICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZjtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIKICAgICAgICAgICBpZD0icGF0aDc0IiAvPgogICAgICA8L2c+CiAgICAgIDxwYXRoCiAgICAgICAgIGQ9Im0gLTQ4LjkwNzY5OSwyMTAuMDY3MDYgaCA0LjUwNDU3NiB2IC0yLjA5NTcyIGggLTQuNTA0NTc2IHogbSA0Ljk5NDY2OSwwLjk4MDE5IGggLTUuNDgzOTU0IGMgLTAuMjcxNTExLDAgLTAuNDkwNDk4LC0wLjIxOTM4IC0wLjQ5MDQ5OCwtMC40ODk2OCB2IC0zLjA3NTkyIGMgMCwtMC4yNzAzMSAwLjIxODk4NywtMC40ODk2OSAwLjQ5MDQ5OCwtMC40ODk2OSBoIDUuNDgzOTU0IGMgMC4yNjk4OTUsMCAwLjQ4OTY4OCwwLjIxOTM4IDAuNDg5Njg4LDAuNDg5NjkgdiAzLjA3NTkyIGMgMCwwLjI3MDMgLTAuMjE5NzkzLDAuNDg5NjggLTAuNDg5Njg4LDAuNDg5NjgiCiAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjAuNDA0MDM0MDgiCiAgICAgICAgIGlkPSJwYXRoNzYiIC8+CiAgICAgIDxnCiAgICAgICAgIGlkPSJnNzgiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDA0MDM0MDksMCwwLC0wLjQwNDAzNDA5LC00OS4zOTcxNDcsMjA5LjE5NjA4KSI+CiAgICAgICAgPHBhdGgKICAgICAgICAgICBkPSJtIDAsMCBoIC02LjgzNyBjIC0wLjY3LDAgLTEuMjExLDAuNTQzIC0xLjIxMSwxLjIxMSAwLDAuNjcxIDAuNTQxLDEuMjEzIDEuMjExLDEuMjEzIEwgMCwyLjQyNCBDIDAuNjY4LDIuNDI0IDEuMjExLDEuODgyIDEuMjExLDEuMjExIDEuMjExLDAuNTQzIDAuNjY4LDAgMCwwIgogICAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgaWQ9InBhdGg4MCIgLz4KICAgICAgPC9nPgogICAgICA8ZwogICAgICAgICBpZD0iZzgyIgogICAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjQwNDAzNDA5LDAsMCwtMC40MDQwMzQwOSwtNDEuMTYxNDM3LDIwOS4xOTYwOCkiPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgZD0ibSAwLDAgaCAtNi44MzUgYyAtMC42NywwIC0xLjIxMywwLjU0MyAtMS4yMTMsMS4yMTEgMCwwLjY3MSAwLjU0MywxLjIxMyAxLjIxMywxLjIxMyBMIDAsMi40MjQgQyAwLjY3LDIuNDI0IDEuMjEyLDEuODgyIDEuMjEyLDEuMjExIDEuMjEyLDAuNTQzIDAuNjcsMCAwLDAiCiAgICAgICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZjtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIKICAgICAgICAgICBpZD0icGF0aDg0IiAvPgogICAgICA8L2c+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K);
}
#hutton-banner-energy {
  background-color: #799900;
  background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgaWQ9InN2ZzYxODkiCiAgIHZlcnNpb249IjEuMSIKICAgdmlld0JveD0iMCAwIDY3LjczMzMyNyA2Ny43MzMzMjkiCiAgIGhlaWdodD0iMjU1Ljk5OTk4IgogICB3aWR0aD0iMjU1Ljk5OTk4Ij4KICA8ZGVmcwogICAgIGlkPSJkZWZzNjE4MyIgLz4KICA8bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGE2MTg2Ij4KICAgIDxyZGY6UkRGPgogICAgICA8Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+CiAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+CiAgICAgICAgPGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPgogICAgICAgIDxkYzp0aXRsZT48L2RjOnRpdGxlPgogICAgICA8L2NjOldvcms+CiAgICA8L3JkZjpSREY+CiAgPC9tZXRhZGF0YT4KICA8ZwogICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI2MC41OTgwNSwtNDcuNjMyNTU3KSIKICAgICBpZD0ibGF5ZXIxIj4KICAgIDxnCiAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgyLjI3MDg3MjQsMCwwLDIuMjcwODcyNCwtMTkzLjY0MDc2LC00MTMuNTI1NTIpIgogICAgICAgaWQ9Imc2OTQ4Ij4KICAgICAgPGcKICAgICAgICAgaWQ9ImcxMDYiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDA0MDM0MDksMCwwLC0wLjQwNDAzNDA5LC0xMC41MTM3MjQsMjA3LjAzMjA4KSI+CiAgICAgICAgPHBhdGgKICAgICAgICAgICBkPSJtIDAsMCBjIC0wLjI0OSwwIC0wLjQ5NywtMC4wNDQgLTAuNzM1LC0wLjEzMSBsIC0yMC4wODgsLTcuNDM3IGMgLTEuMDk4LC0wLjQwOCAtMS42NTksLTEuNjMxIC0xLjI1MywtMi43MjcgMC4zOTQsLTEuMDYyIDEuNjQ0LC0xLjY1MyAyLjcyNCwtMS4yNTUgbCAyMC4wODgsNy40MzUgYyAxLjA5NywwLjQwOCAxLjY2MiwxLjYzMiAxLjI1NiwyLjczIEMgMS42ODYsLTAuNTU5IDAuODg1LDAgMCwwIG0gLTIwLjA4OCwtMTQuMTA3IGMgLTEuODg5LDAgLTMuNjA0LDEuMTkzIC00LjI2MiwyLjk3IC0wLjg2OSwyLjM1MiAwLjMzNiw0Ljk3IDIuNjg1LDUuODQzIEwgLTEuNTc2LDIuMTQxIEMgMC43MjksMi45OTEgMy40MjEsMS43MzggNC4yNjgsLTAuNTQ0IDUuMTM2LC0yLjg5OCAzLjkzLC01LjUxOCAxLjU3OSwtNi4zODcgbCAtMjAuMDg5LC03LjQzNiBjIC0wLjUwOCwtMC4xODkgLTEuMDM3LC0wLjI4NCAtMS41NzgsLTAuMjg0IgogICAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgaWQ9InBhdGgxMDgiIC8+CiAgICAgIDwvZz4KICAgICAgPGcKICAgICAgICAgaWQ9ImcxMTAiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDA0MDM0MDksMCwwLC0wLjQwNDAzNDA5LC0xMC41MTMxNjIsMjExLjUxNjMzKSI+CiAgICAgICAgPHBhdGgKICAgICAgICAgICBkPSJtIDAsMCBjIC0wLjI1LDAgLTAuNDk3LC0wLjA0NCAtMC43MzcsLTAuMTMxIGwgLTIwLjA4NywtNy40NCBjIC0wLjUzMywtMC4xOTcgLTAuOTU2LC0wLjU4OSAtMS4xOTQsLTEuMTAzIC0wLjIzNSwtMC41MTUgLTAuMjU4LC0xLjA5MSAtMC4wNiwtMS42MjIgMC4zOTUsLTEuMDYzIDEuNjQ4LC0xLjY1MiAyLjcyNCwtMS4yNTQgbCAyMC4wODksNy40MzYgYyAxLjA5OCwwLjQwNyAxLjY2MiwxLjYzMSAxLjI1NywyLjcyOSBDIDEuNjg0LC0wLjU1OSAwLjg4MywwIDAsMCBtIC0yMC4wODksLTE0LjEwNyBjIC0xLjg5LDAgLTMuNjAyLDEuMTkyIC00LjI2NCwyLjk2NiAtMC40MjIsMS4xNDEgLTAuMzc1LDIuMzc1IDAuMTMyLDMuNDc5IDAuNTA5LDEuMTA0IDEuNDE2LDEuOTQ0IDIuNTU2LDIuMzY3IEwgLTEuNTc5LDIuMTQxIEMgMC43MjgsMi45OTIgMy40MTksMS43MzYgNC4yNjUsLTAuNTQ0IDUuMTMzLC0yLjg5NiAzLjkyNiwtNS41MTYgMS41NzYsLTYuMzg3IGwgLTIwLjA4NywtNy40MzYgYyAtMC41MDcsLTAuMTg5IC0xLjAzOSwtMC4yODQgLTEuNTc4LC0wLjI4NCIKICAgICAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICAgIGlkPSJwYXRoMTEyIiAvPgogICAgICA8L2c+CiAgICAgIDxnCiAgICAgICAgIGlkPSJnMTE0IgogICAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjQwNDAzNDA5LDAsMCwtMC40MDQwMzQwOSwtMTQuMTYzMTE2LDIyMC4xMzYzNikiPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgZD0ibSAwLDAgYyAtMC40OTMsMCAtMC45NTcsMC4zMDQgLTEuMTM3LDAuNzkxIC0wLjIzMiwwLjYyOCAwLjA4OCwxLjMyOCAwLjcxNiwxLjU1NyBMIDkuNzcsNi4xMjMgYyAxLjA5NywwLjQwNiAxLjY1OCwxLjYyOCAxLjI1NSwyLjcyOSAtMC40MDMsMS4wOTYgLTEuNjMzLDEuNjU3IC0yLjczMiwxLjI1MSBMIC05LjQyOCwzLjMxMSBjIC0wLjc3LC0wLjI4NSAtMS4yOTcsLTAuOTU2IC0xLjM4NiwtMS43NTggLTAuMDEyLC0wLjEwNSAtMC4wMTYsLTAuMjAxIC0wLjAxMiwtMC4yOTEgMC4wMjYsLTAuNjY5IC0wLjQ5NCwtMS4yMzMgLTEuMTY0LC0xLjI2IC0wLjYxLC0wLjA4OCAtMS4yMzEsMC40OTIgLTEuMjU4LDEuMTYyIC0wLjAxMSwwLjIyNCAwLDAuNDUzIDAuMDI1LDAuNjY5IDAuMTkyLDEuNzA5IDEuMzIsMy4xNDggMi45NDEsMy43NDggbCAxNy43MjEsNi43OTMgYyAyLjM3MiwwLjg3MSA0Ljk5NCwtMC4zMyA1Ljg1OSwtMi42ODMgQyAxNC4xNjQsNy4zMzcgMTIuOTU5LDQuNzE4IDEwLjYxMiwzLjg1IEwgMC40MiwwLjA3NyBDIDAuMjgzLDAuMDI0IDAuMTQsMCAwLDAiCiAgICAgICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZjtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIKICAgICAgICAgICBpZD0icGF0aDExNiIgLz4KICAgICAgPC9nPgogICAgICA8ZwogICAgICAgICBpZD0iZzExOCIKICAgICAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMC40MDQwMzQwOSwwLDAsLTAuNDA0MDM0MDksLTE0LjU3MjMzNCwyMjYuNjgwODcpIj4KICAgICAgICA8cGF0aAogICAgICAgICAgIGQ9Im0gMCwwIGMgLTMuMzc2LDAgLTYuMDIsMi4wMDMgLTYuMDIsNC41NTcgMCwwLjY2OSAwLjU0MiwxLjIxMyAxLjIxMiwxLjIxMyAwLjY2OSwwIDEuMjEzLC0wLjU0NCAxLjIxMywtMS4yMTMgMCwtMS4wMDkgMS40NzUsLTIuMTMxIDMuNTk1LC0yLjEzMSAyLjEyMiwwIDMuNiwxLjEyMiAzLjYsMi4xMzEgMCwwLjY2OSAwLjU0MSwxLjIxMyAxLjIxMSwxLjIxMyAwLjY2OCwwIDEuMjEyLC0wLjU0NCAxLjIxMiwtMS4yMTMgQyA2LjAyMywyLjAwMyAzLjM3OCwwIDAsMCIKICAgICAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICAgIGlkPSJwYXRoMTIwIiAvPgogICAgICA8L2c+CiAgICAgIDxnCiAgICAgICAgIGlkPSJnMTIyIgogICAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjQwNDAzNDA5LDAsMCwtMC40MDQwMzQwOSwtMTQuNTcyMzM0LDIyOC4yMzQyMikiPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgZD0ibSAwLDAgYyAtMy4zNzYsMCAtNi4wMiwyIC02LjAyLDQuNTU2IDAsMC42NjkgMC41NDIsMS4yMTIgMS4yMTIsMS4yMTIgMC42NjksMCAxLjIxMywtMC41NDMgMS4yMTMsLTEuMjEyIDAsLTEuMDEgMS40NzUsLTIuMTMyIDMuNTk1LC0yLjEzMiAyLjEyMiwwIDMuNiwxLjEyMiAzLjYsMi4xMzIgMCwwLjY2OSAwLjU0MSwxLjIxMiAxLjIxMSwxLjIxMiAwLjY2OCwwIDEuMjEyLC0wLjU0MyAxLjIxMiwtMS4yMTIgQyA2LjAyMywyIDMuMzc4LDAgMCwwIgogICAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgaWQ9InBhdGgxMjQiIC8+CiAgICAgIDwvZz4KICAgICAgPGcKICAgICAgICAgaWQ9ImcxMjYiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDA0MDM0MDksMCwwLC0wLjQwNDAzNDA5LC0xNi45NzE2MzcsMjIyLjc0NjEpIj4KICAgICAgICA8cGF0aAogICAgICAgICAgIGQ9Im0gMCwwIGMgMC43NDksLTAuMzI3IDIuMzQyLC0xLjUgMi4zNDIsLTUuNTQxIHYgLTcuNjQ2IGMgMCwtMS4wMTggMS40NzYsLTIuMTM5IDMuNTk4LC0yLjEzOSAyLjEyLDAgMy41OTgsMS4xMjEgMy41OTgsMi4xMzEgdiA3LjY1NCBjIDAsMC4wODIgMC4wMDYsMC4xNjEgMC4wMjMsMC4yNDEgMC4wNiwzLjcwMyAxLjQ5Miw0Ljg5IDIuMjU4LDUuMjYzIDAuMDQ4LDAuMDI5IDAuMDk3LDAuMDU4IDAuMTQ5LDAuMDgxIDIuMTg0LDEuMDAyIDQuMDk1LDIuNTQxIDUuNTUyLDQuNDcxIFYgNi40NTkgSCAtNS42NCBWIDQuNTE1IEMgLTQuMTc1LDIuNTc5IC0yLjI1OSwxLjAzNyAtMC4wNzYsMC4wMzcgLTAuMDUxLDAuMDI3IC0wLjAyNSwwLjAxMyAwLDAgbSA1Ljk0LC0xNy43NTIgYyAtMy4zNzgsMCAtNi4wMjMsMi4wMDEgLTYuMDIzLDQuNTU3IHYgNy42NTQgYyAwLDIuMzU3IC0wLjY1NywzLjIwMSAtMC45MSwzLjMyNyAtMC4xNjIsMC4wNDEgLTAuMzA3LDAuMTA5IC0wLjQyOSwwLjIwNSAtMi41NCwxLjIzMiAtNC43NSwzLjEwMSAtNi40MTQsNS40MiAtMC4xNDgsMC4yMDUgLTAuMjI3LDAuNDUzIC0wLjIyNywwLjcwNiB2IDMuNTU0IGMgMCwwLjY3IDAuNTQzLDEuMjEzIDEuMjExLDEuMjEzIGggMjUuNTgzIGMgMC42NywwIDEuMjEzLC0wLjU0MyAxLjIxMywtMS4yMTMgViA0LjExNyBjIDAsLTAuMjUzIC0wLjA3OSwtMC40OTkgLTAuMjI1LC0wLjcwNiAtMS42OCwtMi4zNDkgLTMuOTMyLC00LjIzNiAtNi41MiwtNS40NjcgLTAuMTIxLC0wLjA5IC0wLjI2LC0wLjE1NSAtMC40MTEsLTAuMTkzIC0wLjE0NSwtMC4wOTEgLTAuODA1LC0wLjkzNSAtMC44MDUsLTMuMjkyIDAsLTAuMDggLTAuMDA3LC0wLjE1OCAtMC4wMjIsLTAuMjMzIHYgLTcuNDIxIGMgMCwtMi41NTYgLTIuNjQzLC00LjU1NyAtNi4wMjEsLTQuNTU3IgogICAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgaWQ9InBhdGgxMjgiIC8+CiAgICAgIDwvZz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPgo=);
}
#hutton-banner-work {
  background-color: #6AA2B8;
  background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgaWQ9InN2ZzYxODkiCiAgIHZlcnNpb249IjEuMSIKICAgdmlld0JveD0iMCAwIDY3LjczMzMyNyA2Ny43MzMzMjkiCiAgIGhlaWdodD0iMjU1Ljk5OTk4IgogICB3aWR0aD0iMjU1Ljk5OTk4Ij4KICA8ZGVmcwogICAgIGlkPSJkZWZzNjE4MyIgLz4KICA8bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGE2MTg2Ij4KICAgIDxyZGY6UkRGPgogICAgICA8Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+CiAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+CiAgICAgICAgPGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPgogICAgICAgIDxkYzp0aXRsZT48L2RjOnRpdGxlPgogICAgICA8L2NjOldvcms+CiAgICA8L3JkZjpSREY+CiAgPC9tZXRhZGF0YT4KICA8ZwogICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI2MC41OTgwNSwtNDcuNjMyNTU3KSIKICAgICBpZD0ibGF5ZXIxIj4KICAgIDxnCiAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgyLjI3MDg3MjQsMCwwLDIuMjcwODcyNCwtMjcxLjE4OTgsLTQxMy41MjQ3NykiCiAgICAgICBpZD0iZzcwMTEiPgogICAgICA8cGF0aAogICAgICAgICBkPSJtIDI3LjA2MTIwNiwyMTQuMjA3NiBoIC0yLjkxOTU1IHYgMTIuNjI5NzEgaCAyLjkxOTU1IHogbSAtNC4wMjEzNiwxMy4xODA4MSB2IC0xMy43MzExIGMgMCwtMC4zMDQyNCAwLjI0Njg4LC0wLjU1MDI4IDAuNTUwNzEsLTAuNTUwMjggaCA0LjAyMDE0IGMgMC4zMDUwNCwwIDAuNTUwNjksMC4yNDYwNCAwLjU1MDY5LDAuNTUwMjggdiAxMy43MzExIGMgMCwwLjMwMzQzIC0wLjI0NTY1LDAuNTUwMjggLTAuNTUwNjksMC41NTAyOCBoIC00LjAyMDE0IGMgLTAuMzAzODMsMCAtMC41NTA3MSwtMC4yNDY4NSAtMC41NTA3MSwtMC41NTAyOCIKICAgICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZjtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MC40MDQwMzQwOCIKICAgICAgICAgaWQ9InBhdGgxMzAiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgIGQ9Im0gMTUuMDE0NTI2LDIyMS4wNzI5NSBoIC0yLjkxODc0IHYgNS43NjQzNiBoIDIuOTE4NzQgeiBtIC00LjAyMDUzLDYuMzE1NDYgdiAtNi44NjU3NSBjIDAsLTAuMzA0MjMgMC4yNDY0NSwtMC41NTAyOSAwLjU1MTUsLTAuNTUwMjkgaCA0LjAxOTcyIGMgMC4zMDM4NCwwIDAuNTUxMSwwLjI0NjA2IDAuNTUxMSwwLjU1MDI5IHYgNi44NjU3NSBjIDAsMC4zMDM0MyAtMC4yNDcyNiwwLjU1MDI4IC0wLjU1MTEsMC41NTAyOCBoIC00LjAxOTcyIGMgLTAuMzA1MDUsMCAtMC41NTE1LC0wLjI0Njg1IC0wLjU1MTUsLTAuNTUwMjgiCiAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjAuNDA0MDM0MDgiCiAgICAgICAgIGlkPSJwYXRoMTMyIiAvPgogICAgICA8cGF0aAogICAgICAgICBkPSJtIDIxLjA2MDA4NiwyMTcuNjQwMjcgaCAtMi45MTg3NSB2IDkuMTk3MDQgaCAyLjkxODc1IHogbSAtNC4wMTk3Myw5Ljc0ODE0IHYgLTEwLjI5ODgzIGMgMCwtMC4zMDM0MyAwLjI0NjQ2LC0wLjU0OTg5IDAuNTUwMjksLTAuNTQ5ODkgaCA0LjAxOTczIGMgMC4zMDM4NCwwIDAuNTUwMzEsMC4yNDY0NiAwLjU1MDMxLDAuNTQ5ODkgdiAxMC4yOTg4MyBjIDAsMC4zMDM0MyAtMC4yNDY0NywwLjU1MDI4IC0wLjU1MDMxLDAuNTUwMjggaCAtNC4wMTk3MyBjIC0wLjMwMzgzLDAgLTAuNTUwMjksLTAuMjQ2ODUgLTAuNTUwMjksLTAuNTUwMjgiCiAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjAuNDA0MDM0MDgiCiAgICAgICAgIGlkPSJwYXRoMTM0IiAvPgogICAgICA8ZwogICAgICAgICBpZD0iZzEzNiIKICAgICAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMC40MDQwMzQwOSwwLDAsLTAuNDA0MDM0MDksMTEuNTkwMDA2LDIxOS4yNzM4NCkiPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgZD0ibSAwLDAgYyAwLjI0NCwwIDAuNDg5LDAuMDY0IDAuNzExLDAuMjAxIGwgMzQuODg0LDIxLjQyIGMgMC42NDMsMC4zOTQgMC44NDIsMS4yMzMgMC40NDksMS44NzQgLTAuMzk0LDAuNjQxIC0xLjIzMSwwLjg0MiAtMS44NzQsMC40NDggTCAtMC43MTUsMi41MjMgQyAtMS4zNTYsMi4xMyAtMS41NTYsMS4yOSAtMS4xNjEsMC42NSAtMC45MDUsMC4yMyAtMC40NTcsMCAwLDAiCiAgICAgICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZjtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIKICAgICAgICAgICBpZD0icGF0aDEzOCIgLz4KICAgICAgPC9nPgogICAgICA8ZwogICAgICAgICBpZD0iZzE0MCIKICAgICAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMC40MDQwMzQwOSwwLDAsLTAuNDA0MDM0MDksMjUuODYxOTQ2LDIwOS4yNTAwMykiPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgZD0ibSAwLDAgMS40MDIsLTIuNTU2IDAuOTY0LDIuMyB6IG0gMC4zNzQsLTYuMzQ0IC00LjAxOSw3LjMyNSBjIC0wLjI0NSwwLjQ0NSAtMC4yMiwwLjk4OCAwLjA2LDEuNDEgMC4yODMsMC40MjUgMC43NzYsMC42NTYgMS4yODEsMC42IEwgNC40NzUsMi4yNTcgQyA0LjkwMiwyLjIxMSA1LjI4MiwxLjk2NiA1LjUwMSwxLjU5NSA1LjcxOSwxLjIyNCA1Ljc1MSwwLjc3MyA1LjU4NCwwLjM3NyBMIDIuODI0LC02LjIxNCBDIDIuNjIyLC02LjY5NyAyLjE2MywtNy4wMiAxLjY0MSwtNy4wNDggMS42MTYsLTcuMDQ5IDEuNTkyLC03LjA1MiAxLjU2OSwtNy4wNTIgYyAtMC40OTUsMCAtMC45NTYsMC4yNzEgLTEuMTk1LDAuNzA4IgogICAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgaWQ9InBhdGgxNDIiIC8+CiAgICAgIDwvZz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPgo=);
}
#hutton-banner-industry {
  background-color: #00748C;
  background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgaWQ9InN2ZzUyMDAiCiAgIHZlcnNpb249IjEuMSIKICAgdmlld0JveD0iMCAwIDY3LjczMzMyNyA2Ny43MzMzMzIiCiAgIGhlaWdodD0iMjU1Ljk5OTk4IgogICB3aWR0aD0iMjU1Ljk5OTk4Ij4KICA8ZGVmcwogICAgIGlkPSJkZWZzNTE5NCIgLz4KICA8bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGE1MTk3Ij4KICAgIDxyZGY6UkRGPgogICAgICA8Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+CiAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+CiAgICAgICAgPGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPgogICAgICAgIDxkYzp0aXRsZT48L2RjOnRpdGxlPgogICAgICA8L2NjOldvcms+CiAgICA8L3JkZjpSREY+CiAgPC9tZXRhZGF0YT4KICA8ZwogICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsLTIyOS4yNjY2NSkiCiAgICAgaWQ9ImxheWVyMSI+CiAgICA8ZwogICAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMi4yNzA4NzI0LDAsMCwyLjI3MDg3MjQsLTg4LjE0MzIzLC0yMzEuODkxMTcpIgogICAgICAgaWQ9Imc3MDY0Ij4KICAgICAgPGcKICAgICAgICAgaWQ9ImcxNDQiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDA0MDM0MDksMCwwLC0wLjQwNDAzNDA5LDU3Ljg5MTcxNiwyMjIuMTY5NSkiPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgZD0ibSAwLDAgYyAtMy4zMDQsMCAtNS45OSwtMi42ODcgLTUuOTksLTUuOTkgMCwtMy4zMDEgMi42ODYsLTUuOTg3IDUuOTksLTUuOTg3IDMuMzA0LDAgNS45OSwyLjY4NiA1Ljk5LDUuOTg3IEMgNS45OSwtMi42ODcgMy4zMDQsMCAwLDAgbSAwLC0xNC43MDEgYyAtNC44MDUsMCAtOC43MTMsMy45MDcgLTguNzEzLDguNzExIDAsNC44MDcgMy45MDgsOC43MTUgOC43MTMsOC43MTUgNC44MDUsMCA4LjcxNCwtMy45MDggOC43MTQsLTguNzE1IDAsLTQuODA0IC0zLjkwOSwtOC43MTEgLTguNzE0LC04LjcxMSIKICAgICAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICAgIGlkPSJwYXRoMTQ2IiAvPgogICAgICA8L2c+CiAgICAgIDxnCiAgICAgICAgIGlkPSJnMTQ4IgogICAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjQwNDAzNDA5LDAsMCwtMC40MDQwMzQwOSw1Ny44OTE3MTYsMjA4Ljk2OTE0KSI+CiAgICAgICAgPHBhdGgKICAgICAgICAgICBkPSJtIDAsMCBjIC0zLjMwNCwwIC01Ljk5LC0yLjY4NyAtNS45OSwtNS45ODkgMCwtMy4zMDIgMi42ODYsLTUuOTg2IDUuOTksLTUuOTg2IDMuMzA0LDAgNS45OSwyLjY4NCA1Ljk5LDUuOTg2IEMgNS45OSwtMi42ODcgMy4zMDQsMCAwLDAgbSAwLC0xNC43MDEgYyAtNC44MDUsMCAtOC43MTMsMy45MDkgLTguNzEzLDguNzEyIDAsNC44MDUgMy45MDgsOC43MTQgOC43MTMsOC43MTQgNC44MDUsMCA4LjcxNCwtMy45MDkgOC43MTQsLTguNzE0IDAsLTQuODAzIC0zLjkwOSwtOC43MTIgLTguNzE0LC04LjcxMiIKICAgICAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICAgIGlkPSJwYXRoMTUwIiAvPgogICAgICA8L2c+CiAgICAgIDxnCiAgICAgICAgIGlkPSJnMTUyIgogICAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjQwNDAzNDA5LDAsMCwtMC40MDQwMzQwOSw0OS41NjQyODYsMjE1LjQzNzcpIj4KICAgICAgICA8cGF0aAogICAgICAgICAgIGQ9Im0gMCwwIGMgLTMuMzA0LDAgLTUuOTksLTIuNjg3IC01Ljk5LC01Ljk4OCAwLC0zLjMwMyAyLjY4NiwtNS45OTEgNS45OSwtNS45OTEgMy4zMDEsMCA1Ljk4OSwyLjY4OCA1Ljk4OSw1Ljk5MSBDIDUuOTg5LC0yLjY4NyAzLjMwMSwwIDAsMCBtIDAsLTE0LjcwMyBjIC00LjgwNSwwIC04LjcxMywzLjkwOSAtOC43MTMsOC43MTUgMCw0LjgwNCAzLjkwOCw4LjcxNCA4LjcxMyw4LjcxNCA0LjgwNSwwIDguNzEzLC0zLjkxIDguNzEzLC04LjcxNCAwLC00LjgwNiAtMy45MDgsLTguNzE1IC04LjcxMywtOC43MTUiCiAgICAgICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZjtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIKICAgICAgICAgICBpZD0icGF0aDE1NCIgLz4KICAgICAgPC9nPgogICAgICA8ZwogICAgICAgICBpZD0iZzE1NiIKICAgICAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMC40MDQwMzQwOSwwLDAsLTAuNDA0MDM0MDksNTcuODkxNzE2LDIyMS44OTM5OSkiPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgZD0ibSAwLDAgYyAtMC4zNzYsMCAtMC42ODEsMC4zMDUgLTAuNjgxLDAuNjgxIHYgMTcuOTcgYyAwLDAuMzc3IDAuMzA1LDAuNjgxIDAuNjgxLDAuNjgxIDAuMzc2LDAgMC42NzksLTAuMzA0IDAuNjc5LC0wLjY4MSBWIDAuNjgxIEMgMC42NzksMC4zMDUgMC4zNzYsMCAwLDAiCiAgICAgICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZjtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIKICAgICAgICAgICBpZD0icGF0aDE1OCIgLz4KICAgICAgPC9nPgogICAgICA8ZwogICAgICAgICBpZD0iZzE2MCIKICAgICAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMC40MDQwMzQwOSwwLDAsLTAuNDA0MDM0MDksNTUuNTc5MjY2LDIyMy4wMDEyNSkiPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgZD0ibSAwLDAgYyAtMC4xNTEsMCAtMC4zMDIsMC4wNDkgLTAuNDI2LDAuMTUxIGwgLTkuMTkyLDcuNDAxIGMgLTAuMjk0LDAuMjM3IC0wLjMzOSwwLjY2NiAtMC4xMDUsMC45NTkgMC4yMzcsMC4yOTIgMC42NjYsMC4zMzggMC45NTksMC4xMDMgTCAwLjQyOCwxLjIxMiBDIDAuNzIxLDAuOTc1IDAuNzY2LDAuNTQ2IDAuNTMxLDAuMjU1IDAuMzk3LDAuMDg2IDAuMTk5LDAgMCwwIgogICAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgaWQ9InBhdGgxNjIiIC8+CiAgICAgIDwvZz4KICAgICAgPGcKICAgICAgICAgaWQ9ImcxNjQiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDA0MDM0MDksMCwwLC0wLjQwNDAzNDA5LDUxLjg4Nzg3NiwyMTYuMjg0NzQpIj4KICAgICAgICA8cGF0aAogICAgICAgICAgIGQ9Im0gMCwwIGMgLTAuMTk5LDAgLTAuMzk3LDAuMDg3IC0wLjUzMSwwLjI1NSAtMC4yMzUsMC4yOTIgLTAuMTksMC43MjEgMC4xMDMsMC45NTcgTCA4LjQ1Niw4LjM2NiBDIDguNzQ4LDguNjAxIDkuMTc2LDguNTU0IDkuNDEzLDguMjYgOS42NDgsNy45NjkgOS42MDIsNy41MzkgOS4zMDksNy4zMDMgTCAwLjQyOCwwLjE1MSBDIDAuMzAyLDAuMDUgMC4xNDksMCAwLDAiCiAgICAgICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZjtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIKICAgICAgICAgICBpZD0icGF0aDE2NiIgLz4KICAgICAgPC9nPgogICAgPC9nPgogIDwvZz4KPC9zdmc+Cg==);
}
#hutton-banner-consumption {
  background-color: #CF009E;
  background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgaWQ9InN2ZzYxODkiCiAgIHZlcnNpb249IjEuMSIKICAgdmlld0JveD0iMCAwIDY3LjczMzMyNyA2Ny43MzMzMjkiCiAgIGhlaWdodD0iMjU1Ljk5OTk4IgogICB3aWR0aD0iMjU1Ljk5OTk4Ij4KICA8ZGVmcwogICAgIGlkPSJkZWZzNjE4MyIgLz4KICA8bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGE2MTg2Ij4KICAgIDxyZGY6UkRGPgogICAgICA8Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+CiAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+CiAgICAgICAgPGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPgogICAgICAgIDxkYzp0aXRsZT48L2RjOnRpdGxlPgogICAgICA8L2NjOldvcms+CiAgICA8L3JkZjpSREY+CiAgPC9tZXRhZGF0YT4KICA8ZwogICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI2MC41OTgwNSwtNDcuNjMyNTU3KSIKICAgICBpZD0ibGF5ZXIxIj4KICAgIDxnCiAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgyLjI3MDg3MjQsMCwwLDIuMjcwODcyNCwtMTcwLjUwNjA5LC00MjIuMTA4NDIpIgogICAgICAgaWQ9Imc3MTEwIj4KICAgICAgPGcKICAgICAgICAgaWQ9ImcyMDQiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDA0MDM0MDksMCwwLC0wLjQwNDAzNDA5LC0xOS41MzQxOTksMjMwLjQyMDM4KSI+CiAgICAgICAgPHBhdGgKICAgICAgICAgICBkPSJtIDAsMCBjIC0wLjQ0NSwwIC0wLjg4NSwwLjIxOSAtMS4xNDYsMC42MjMgLTAuNDA5LDAuNjMzIC0wLjIyNiwxLjQ3NyAwLjQwNywxLjg4NCA2LjQ1LDQuMTY2IDEwLjMsMTEuMjM1IDEwLjMsMTguOTA2IDAsOS42NTYgLTYuMTM4LDE4LjIyIC0xNS4yNzksMjEuMzEzIC0wLjcxMiwwLjI0MiAtMS4wOTQsMS4wMTUgLTAuODUzLDEuNzI4IDAuMjQyLDAuNzEyIDEuMDE4LDEuMDk4IDEuNzI5LDAuODUzIEMgNS40MDQsNDEuODQyIDEyLjI4OCwzMi4yMzkgMTIuMjg4LDIxLjQxMyAxMi4yODgsMTIuODEyIDcuOTcsNC44OSAwLjczOSwwLjIxOSAwLjUwOSwwLjA3MSAwLjI1NSwwIDAsMCIKICAgICAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICAgIGlkPSJwYXRoMjA2IiAvPgogICAgICA8L2c+CiAgICAgIDxnCiAgICAgICAgIGlkPSJnMjA4IgogICAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjQwNDAzNDA5LDAsMCwtMC40MDQwMzQwOSwtMjkuNjkzMjk5LDIxMy4xODYwMykiPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgZD0iTSAwLDAgMy4yMDEsLTIuODk0IFYgMCBaIG0gNC41NjMsLTcuMzIzIGMgLTAuMzMsMCAtMC42NTcsMC4xMiAtMC45MTMsMC4zNTEgbCAtOC4xLDcuMzIzIGMgLTAuNDIxLDAuMzc4IC0wLjU2NCwwLjk3NCAtMC4zNTksMS41IDAuMjAyLDAuNTI3IDAuNzA3LDAuODcyIDEuMjcyLDAuODcyIGggOC4xIGMgMC43NTIsMCAxLjM2NCwtMC42MDggMS4zNjQsLTEuMzYyIHYgLTcuMzIyIGMgMCwtMC41NCAtMC4zMTgsLTEuMDI3IC0wLjgxLC0xLjI0NSBDIDQuOTM5LC03LjI4NSA0Ljc1MSwtNy4zMjMgNC41NjMsLTcuMzIzIgogICAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgaWQ9InBhdGgyMTAiIC8+CiAgICAgIDwvZz4KICAgICAgPGcKICAgICAgICAgaWQ9ImcyMTIiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDA0MDM0MDksMCwwLC0wLjQwNDAzNDA5LC0yNy44NTAzNjksMjMxLjQ1MTY3KSI+CiAgICAgICAgPHBhdGgKICAgICAgICAgICBkPSJtIDAsMCBjIC0wLjE0NSwwIC0wLjI5MiwwLjAyNCAtMC40MzcsMC4wNzQgLTEwLjI0NiwzLjQ2NyAtMTcuMTMzLDEzLjA2OSAtMTcuMTMzLDIzLjg5MSAwLDguNjAxIDQuMzIyLDE2LjUyNiAxMS41NTUsMjEuMTk2IDAuNjMxLDAuNDA5IDEuNDc2LDAuMjI5IDEuODgxLC0wLjQwNCAwLjQxLC0wLjYzMyAwLjIzLC0xLjQ3NyAtMC40MDQsLTEuODgzIC02LjQ1NCwtNC4xNjkgLTEwLjMwNSwtMTEuMjM3IC0xMC4zMDUsLTE4LjkwOSAwLC05LjY1NSA2LjE0MSwtMTguMjE4IDE1LjI3OSwtMjEuMzEgQyAxLjE0OCwyLjQxMyAxLjUzMSwxLjY0IDEuMjg5LDAuOTI4IDEuMDk3LDAuMzU5IDAuNTY5LDAgMCwwIgogICAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgaWQ9InBhdGgyMTQiIC8+CiAgICAgIDwvZz4KICAgICAgPGcKICAgICAgICAgaWQ9ImcyMTYiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDA0MDM0MDksMCwwLC0wLjQwNDAzNDA5LC0yMS4xMTc3MTksMjMwLjM1MDgpIj4KICAgICAgICA8cGF0aAogICAgICAgICAgIGQ9Ik0gMCwwIEggMy4yMDEgTCAwLDIuODk2IFogTSA2Ljc2OSwtMi43MjQgSCA2Ljc0MSAtMS4zNjQgYyAtMC43NTEsMCAtMS4zNjEsMC42MDkgLTEuMzYxLDEuMzYzIHYgNy4zMjQgYyAwLDAuNTM3IDAuMzE2LDEuMDI1IDAuODA5LDEuMjQzIDAuNDg4LDAuMjIxIDEuMDY4LDAuMTMgMS40NjUsLTAuMjMzIEwgNy41MDQsLTAuMjE0IEMgNy44OCwtMC40NTcgOC4xMywtMC44NzkgOC4xMywtMS4zNjEgOC4xMywtMi4xMTUgNy41MiwtMi43MjQgNi43NjksLTIuNzI0IgogICAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgaWQ9InBhdGgyMTgiIC8+CiAgICAgIDwvZz4KICAgICAgPGcKICAgICAgICAgaWQ9ImcyMjAiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDA0MDM0MDksMCwwLC0wLjQwNDAzNDA5LC0xOS41MzQxOTksMjMwLjQyMDM4KSI+CiAgICAgICAgPHBhdGgKICAgICAgICAgICBkPSJtIDAsMCBjIC0wLjQ0NSwwIC0wLjg4MywwLjIxOSAtMS4xNDYsMC42MjMgLTAuNDA5LDAuNjMzIC0wLjIyNiwxLjQ3NSAwLjQwNywxLjg4NCA2LjQ1LDQuMTY4IDEwLjMsMTEuMjM3IDEwLjMsMTguOTA3IDAsOS42NTUgLTYuMTM4LDE4LjIxOSAtMTUuMjc5LDIxLjMxMiAtMC43MTIsMC4yNDIgLTEuMDk0LDEuMDE1IC0wLjg1MywxLjcyOCAwLjI0MiwwLjcxMiAxLjAxOCwxLjA5OCAxLjcyOSwwLjg1MyBDIDUuNDA0LDQxLjg0MiAxMi4yODgsMzIuMjM5IDEyLjI4OCwyMS40MTQgMTIuMjg4LDEyLjgxNiA3Ljk3LDQuODkyIDAuNzM5LDAuMjE5IDAuNTA5LDAuMDcxIDAuMjU1LDAgMCwwIgogICAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgaWQ9InBhdGgyMjIiIC8+CiAgICAgIDwvZz4KICAgICAgPGcKICAgICAgICAgaWQ9ImcyMjQiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDA0MDM0MDksMCwwLC0wLjQwNDAzNDA5LC0yNC41NjkyNDksMjE3LjM2NjczKSI+CiAgICAgICAgPHBhdGgKICAgICAgICAgICBkPSJtIDAsMCBjIC01LjYyOCwwIC0xMC4yMDYsLTQuNTc2IC0xMC4yMDYsLTEwLjIwNCAwLC01LjYyNiA0LjU3OCwtMTAuMjA0IDEwLjIwNiwtMTAuMjA0IDUuNjI4LDAgMTAuMjA2LDQuNTc4IDEwLjIwNiwxMC4yMDQgQyAxMC4yMDYsLTQuNTc2IDUuNjI4LDAgMCwwIG0gMCwtMjMuMTMzIGMgLTcuMTI5LDAgLTEyLjkyOCw1LjgwMSAtMTIuOTI4LDEyLjkyOSAwLDcuMTMgNS43OTksMTIuOTMxIDEyLjkyOCwxMi45MzEgNy4xMywwIDEyLjkyOCwtNS44MDEgMTIuOTI4LC0xMi45MzEgMCwtNy4xMjggLTUuNzk4LC0xMi45MjkgLTEyLjkyOCwtMTIuOTI5IgogICAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgaWQ9InBhdGgyMjYiIC8+CiAgICAgIDwvZz4KICAgICAgPGcKICAgICAgICAgaWQ9ImcyMjgiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDA0MDM0MDksMCwwLC0wLjQwNDAzNDA5LC0yNC41NjkyNDksMjI2LjQzODEpIj4KICAgICAgICA8cGF0aAogICAgICAgICAgIGQ9Im0gMCwwIGMgLTAuMzc4LDAgLTAuNjgxLDAuMzA2IC0wLjY4MSwwLjY4IHYgMjMuMTM1IGMgMCwwLjM3NiAwLjMwMywwLjY4MiAwLjY4MSwwLjY4MiAwLjM3NiwwIDAuNjgxLC0wLjMwNiAwLjY4MSwtMC42ODIgViAwLjY4IEMgMC42ODEsMC4zMDYgMC4zNzYsMCAwLDAiCiAgICAgICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZjtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIKICAgICAgICAgICBpZD0icGF0aDIzMCIgLz4KICAgICAgPC9nPgogICAgICA8ZwogICAgICAgICBpZD0iZzIzMiIKICAgICAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMC40MDQwMzQwOSwwLDAsLTAuNDA0MDM0MDksLTI2LjE4NTc4OSwyMjYuMDY1MjUpIj4KICAgICAgICA8cGF0aAogICAgICAgICAgIGQ9Im0gMCwwIGMgLTAuMjQzLDAgLTAuNDc5LDAuMTMxIC0wLjYwMywwLjM2IC01Ljk1NywxMS4xODMgLTAuMjM4LDIxLjUxMiAwLjAwOCwyMS45NDUgMC4xODgsMC4zMjggMC42MDIsMC40NDIgMC45MjgsMC4yNTcgMC4zMjgsLTAuMTg2IDAuNDQzLC0wLjYwMyAwLjI1OSwtMC45MyBDIDAuNTM1LDIxLjUzMyAtNC45OTgsMTEuNTA1IDAuNiwxLjAwMiAwLjc3NiwwLjY3MSAwLjY1MiwwLjI1NyAwLjMyMSwwLjA4MSAwLjIxNiwwLjAyNiAwLjEwNiwwIDAsMCIKICAgICAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICAgIGlkPSJwYXRoMjM0IiAvPgogICAgICA8L2c+CiAgICAgIDxnCiAgICAgICAgIGlkPSJnMjM2IgogICAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjQwNDAzNDA5LDAsMCwtMC40MDQwMzQwOSwtMjIuOTUzOTM5LDIyNi4wNjUyNSkiPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgZD0ibSAwLDAgYyAtMC4xMDYsMCAtMC4yMTcsMC4wMjYgLTAuMzIsMC4wODEgLTAuMzMxLDAuMTc2IC0wLjQ1NiwwLjU5IC0wLjI4LDAuOTIxIDUuNTk4LDEwLjUwMyAwLjA2NSwyMC41MzEgMC4wMDgsMjAuNjMgLTAuMTg0LDAuMzI3IC0wLjA2OSwwLjc0NCAwLjI1OSwwLjkzIDAuMzI1LDAuMTgyIDAuNzQxLDAuMDcxIDAuOTI4LC0wLjI1NyBDIDAuODQsMjEuODcyIDYuNTYyLDExLjU0MyAwLjYwMywwLjM2IDAuNDc5LDAuMTMxIDAuMjQ0LDAgMCwwIgogICAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgaWQ9InBhdGgyMzgiIC8+CiAgICAgIDwvZz4KICAgICAgPGcKICAgICAgICAgaWQ9ImcyNDAiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDA0MDM0MDksMCwwLC0wLjQwNDAzNDA5LC0yOC44NjkzNDksMjIwLjE1NjIxKSI+CiAgICAgICAgPHBhdGgKICAgICAgICAgICBkPSJNIDAsMCBDIC0wLjI0NCwwIC0wLjQ4LDAuMTMxIC0wLjYwMiwwLjM2MSAtMC43NzksMC42OTIgLTAuNjUzLDEuMTA1IC0wLjMyLDEuMjgyIDEwLjg2Myw3LjIzOCAyMS4xODksMS41MTkgMjEuNjIyLDEuMjc0IDIxLjk1LDEuMDg4IDIyLjA2NSwwLjY3NCAyMS44OCwwLjM0NiAyMS42OTQsMC4wMTkgMjEuMjc3LC0wLjA5NSAyMC45NTIsMC4wODkgMjAuODUxLDAuMTQ0IDEwLjgyMyw1LjY3NyAwLjMxOSwwLjA3OSAwLjIxNywwLjAyNiAwLjEwOCwwIDAsMCIKICAgICAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICAgIGlkPSJwYXRoMjQyIiAvPgogICAgICA8L2c+CiAgICAgIDxnCiAgICAgICAgIGlkPSJnMjQ0IgogICAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjQwNDAzNDA5LDAsMCwtMC40MDQwMzQwOSwtMjQuNjU0ODM5LDIyNC40NDkzMykiPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgZD0ibSAwLDAgYyAtMy4yNDgsMCAtNi45NSwwLjY3NSAtMTAuNzUyLDIuNzAxIC0wLjMzMiwwLjE3NyAtMC40NTcsMC41OSAtMC4yODEsMC45MjIgMC4xNzcsMC4zMzMgMC41ODgsMC40NTcgMC45MjEsMC4yOCBDIDAuMzkyLC0xLjY5NCAxMC40MTksMy44MzggMTAuNTIsMy44OTUgMTAuODUsNC4wOCAxMS4yNjQsMy45NjYgMTEuNDQ4LDMuNjM4IDExLjYzNCwzLjMxMSAxMS41MTksMi44OTYgMTEuMTkxLDIuNzA5IDEwLjkwNCwyLjU0OCA2LjMwOSwwIDAsMCIKICAgICAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICAgIGlkPSJwYXRoMjQ2IiAvPgogICAgICA8L2c+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K);
}
#hutton-banner-climate {
  background-color: #853175;
  background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgaWQ9InN2ZzYxODkiCiAgIHZlcnNpb249IjEuMSIKICAgdmlld0JveD0iMCAwIDY3LjczMzMyNyA2Ny43MzMzMjkiCiAgIGhlaWdodD0iMjU1Ljk5OTk4IgogICB3aWR0aD0iMjU1Ljk5OTk4Ij4KICA8ZGVmcwogICAgIGlkPSJkZWZzNjE4MyIgLz4KICA8bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGE2MTg2Ij4KICAgIDxyZGY6UkRGPgogICAgICA8Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+CiAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+CiAgICAgICAgPGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPgogICAgICAgIDxkYzp0aXRsZT48L2RjOnRpdGxlPgogICAgICA8L2NjOldvcms+CiAgICA8L3JkZjpSREY+CiAgPC9tZXRhZGF0YT4KICA8ZwogICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI2MC41OTgwNSwtNDcuNjMyNTU3KSIKICAgICBpZD0ibGF5ZXIxIj4KICAgIDxnCiAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgyLjI3MDg3MjQsMCwwLDIuMjcwODcyNCwtMjQ4LjA1NjUyLC00MjIuMTA4NDIpIgogICAgICAgaWQ9Imc3MjE0Ij4KICAgICAgPGcKICAgICAgICAgaWQ9ImcxNjgiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDA0MDM0MDksMCwwLC0wLjQwNDAzNDA5LDE2LjA4MTU0NSwyMjQuMTEwNTkpIj4KICAgICAgICA8cGF0aAogICAgICAgICAgIGQ9Im0gMCwwIGMgLTAuMzc2LDAgLTAuNzUxLDAuMTU5IC0xLjAxNSwwLjQ2NyAtMC40NzgsMC41NjIgLTAuNDExLDEuNDAzIDAuMTQ2LDEuODgxIDEuOTYxLDEuNjc0IDMuMDg1LDQuMTEzIDMuMDg1LDYuNjkgMCw0Ljg1MiAtMy45NDgsOC43OTcgLTguNzk4LDguNzk3IC0zLjg5MSwwIC03LjM2NCwtMi42IC04LjQ1LC02LjMyMyAtMC4yMDQsLTAuNzA2IC0wLjkzOCwtMS4xMDggLTEuNjU0LC0wLjkwNyAtMC43MDcsMC4yMDYgLTEuMTEyLDAuOTQ2IC0wLjkwNiwxLjY1NCAxLjQxNCw0Ljg1NCA1Ljk0Miw4LjI0NCAxMS4wMSw4LjI0NCA2LjMyMSwwIDExLjQ2NCwtNS4xNDMgMTEuNDY0LC0xMS40NjUgQyA0Ljg4Miw1LjY3OSAzLjQxOCwyLjUwMiAwLjg2NSwwLjMxOSAwLjYxMywwLjEwNiAwLjMwNywwIDAsMCIKICAgICAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICAgIGlkPSJwYXRoMTcwIiAvPgogICAgICA8L2c+CiAgICAgIDxnCiAgICAgICAgIGlkPSJnMTcyIgogICAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjQwNDAzNDA5LDAsMCwtMC40MDQwMzQwOSwxMy40MjIwNzUsMjE1LjYwMTgzKSI+CiAgICAgICAgPHBhdGgKICAgICAgICAgICBkPSJtIDAsMCBjIC0wLjczNiwwIC0xLjMzNSwwLjU5OCAtMS4zMzUsMS4zMzQgdiA1LjA1MiBjIDAsMC43MzcgMC41OTksMS4zMzQgMS4zMzUsMS4zMzQgMC43MzQsMCAxLjMzNCwtMC41OTcgMS4zMzQsLTEuMzM0IFYgMS4zMzQgQyAxLjMzNCwwLjU5OCAwLjczNCwwIDAsMCIKICAgICAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICAgIGlkPSJwYXRoMTc0IiAvPgogICAgICA8L2c+CiAgICAgIDxnCiAgICAgICAgIGlkPSJnMTc2IgogICAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjQwNDAzNDA5LDAsMCwtMC40MDQwMzQwOSwyMC44NTc4NzUsMjIwLjk5ODAzKSI+CiAgICAgICAgPHBhdGgKICAgICAgICAgICBkPSJtIDAsMCBoIC01LjA1IGMgLTAuNzM3LDAgLTEuMzMyLDAuNTk4IC0xLjMzMiwxLjMzNCAwLDAuNzM3IDAuNTk1LDEuMzM0IDEuMzMyLDEuMzM0IEggMCBDIDAuNzM2LDIuNjY4IDEuMzM1LDIuMDcxIDEuMzM1LDEuMzM0IDEuMzM1LDAuNTk4IDAuNzM2LDAgMCwwIgogICAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgaWQ9InBhdGgxNzgiIC8+CiAgICAgIDwvZz4KICAgICAgPGcKICAgICAgICAgaWQ9ImcxODAiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDA0MDM0MDksMCwwLC0wLjQwNDAzNDA5LDkuNjA2MDU1MiwyMTcuMTgyMjkpIj4KICAgICAgICA8cGF0aAogICAgICAgICAgIGQ9Ik0gMCwwIEMgLTAuMzQsMCAtMC42ODIsMC4xMzEgLTAuOTQxLDAuMzkxIEwgLTQuNTE2LDMuOTYgYyAtMC41MjMsMC41MjEgLTAuNTIzLDEuMzY2IC0wLjAwNCwxLjg4NyAwLjUyMywwLjUyMiAxLjM2OSwwLjUyMSAxLjg4OSwwLjAwMiBMIDAuOTQzLDIuMjc4IEMgMS40NjUsMS43NTcgMS40NjUsMC45MTQgMC45NDMsMC4zOTIgMC42ODMsMC4xMzEgMC4zNDMsMCAwLDAiCiAgICAgICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZjtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIKICAgICAgICAgICBpZD0icGF0aDE4MiIgLz4KICAgICAgPC9nPgogICAgICA8ZwogICAgICAgICBpZD0iZzE4NCIKICAgICAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMC40MDQwMzQwOSwwLDAsLTAuNDA0MDM0MDksMTcuMjM1Nzk1LDIxNy4xODIyOSkiPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgZD0ibSAwLDAgYyAtMC4zNDMsMCAtMC42ODIsMC4xMzEgLTAuOTQxLDAuMzkxIC0wLjUyNCwwLjUyMyAtMC41MjQsMS4zNjYgMCwxLjg4NyBMIDIuNjMxLDUuODQ5IEMgMy4xNTMsNi4zNjkgMy45OTgsNi4zNjYgNC41MTgsNS44NDcgNS4wMzksNS4zMjYgNS4wMzksNC40ODEgNC41MTgsMy45NiBMIDAuOTQ0LDAuMzkxIEMgMC42ODMsMC4xMzEgMC4zNCwwIDAsMCIKICAgICAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICAgIGlkPSJwYXRoMTg2IiAvPgogICAgICA8L2c+CiAgICAgIDxnCiAgICAgICAgIGlkPSJnMTg4IgogICAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjQwNDAzNDA5LDAsMCwtMC40MDQwMzQwOSwxOC42Njc4NDUsMjMxLjA1Mzk5KSI+CiAgICAgICAgPHBhdGgKICAgICAgICAgICBkPSJtIDAsMCBjIC0wLjczNywwIC0xLjMzNSwwLjU5OCAtMS4zMzUsMS4zMzQgMCwwLjczNiAwLjU5OCwxLjMzNCAxLjMzNSwxLjMzNCAwLjk2MiwwIDEuNzU4LDAuNzU1IDEuODEyLDEuNzIxIEMgMS44NTUsNS4wODggMi40MzEsNS42MzYgMy4xMzEsNS42NDQgMy44MDMsNS42ODYgNC40MTYsNS4xMTkgNC40NzQsNC40MjIgNC40OTIsNC4yMTQgNC41MDMsNC4wNzUgNC41MDMsMy45MzMgNC41MDMsMy42NzUgNC40MzEsMy40MzIgNC4zMDQsMy4yMjggMy43NTIsMS4zNTQgMi4wMjMsMCAwLDAiCiAgICAgICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZjtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIKICAgICAgICAgICBpZD0icGF0aDE5MCIgLz4KICAgICAgPC9nPgogICAgICA8ZwogICAgICAgICBpZD0iZzE5MiIKICAgICAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMC40MDQwMzQwOSwwLDAsLTAuNDA0MDM0MDksLTAuNzk3MzA0NzYsMjMxLjA1Mzk5KSI+CiAgICAgICAgPHBhdGgKICAgICAgICAgICBkPSJtIDAsMCBjIC0yLjQ4MSwwIC00LjUsMi4wMiAtNC41LDQuNTAxIDAsMC43MzcgMC41OTcsMS4zMzQgMS4zMzMsMS4zMzQgMC43MzgsMCAxLjMzNCwtMC41OTcgMS4zMzQsLTEuMzM0IEMgLTEuODMzLDMuNDkgLTEuMDEsMi42NjggMCwyLjY2OCAwLjczNywyLjY2OCAxLjMzNSwyLjA3IDEuMzM1LDEuMzM0IDEuMzM1LDAuNTk4IDAuNzM3LDAgMCwwIgogICAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgaWQ9InBhdGgxOTQiIC8+CiAgICAgIDwvZz4KICAgICAgPGcKICAgICAgICAgaWQ9ImcxOTYiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDA0MDM0MDksMCwwLC0wLjQwNDAzNDA5LDE4LjY2Nzg0NSwyMzEuMDUzOTkpIj4KICAgICAgICA8cGF0aAogICAgICAgICAgIGQ9Im0gMCwwIGggLTQ4LjE3NyBjIC0wLjczNiwwIC0xLjMzNCwwLjU5OCAtMS4zMzQsMS4zMzQgMCwwLjczNiAwLjU5OCwxLjMzNCAxLjMzNCwxLjMzNCBIIDAgQyAwLjczNiwyLjY2OCAxLjMzMiwyLjA3IDEuMzMyLDEuMzM0IDEuMzMyLDAuNTk4IDAuNzM2LDAgMCwwIgogICAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgaWQ9InBhdGgxOTgiIC8+CiAgICAgIDwvZz4KICAgICAgPGcKICAgICAgICAgaWQ9ImcyMDAiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDA0MDM0MDksMCwwLC0wLjQwNDAzNDA5LC0yLjA3NjgzNDgsMjI5Ljc3NDI1KSI+CiAgICAgICAgPHBhdGgKICAgICAgICAgICBkPSJtIDAsMCBjIC0wLjczNiwwIC0xLjMzNCwwLjU5OCAtMS4zMzQsMS4zMzQgdiAzLjY1NSBjIDAsNy42NyA2LjI0MywxMy45MTIgMTMuOTE1LDEzLjkxMiAwLjQ3NywwIDAuOTYzLC0wLjAyNyAxLjQ2NiwtMC4wODQgMy4zMDQsNS4yMzEgOS4wODQsOC40NDEgMTUuMzA3LDguNDQxIDkuNTYyLDAgMTcuNDE2LC03LjQ1MyAxOC4wNiwtMTYuODU3IEMgNTEuNTg3LDkuODQ5IDU0Ljk3Nyw2LjY1NSA1NS43LDIuNDAyIDU1LjgyMywxLjY3NSA1NS4zMzcsMC45ODYgNTQuNjA5LDAuODY1IDUzLjg4MywwLjc0IDUzLjE5NiwxLjIyNyA1My4wNzIsMS45NTQgNTIuNDk0LDUuMzUzIDQ5LjU3LDcuODE5IDQ2LjEyMSw3LjgxOSBjIC0wLjczNiwwIC0xLjMzLDAuNTk3IC0xLjMzLDEuMzM0IDAsOC41MTEgLTYuOTI1LDE1LjQzOSAtMTUuNDM3LDE1LjQzOSAtNS41NywwIC0xMC43MjIsLTMuMDE3IC0xMy40NTUsLTcuODc3IC0wLjI3NywtMC40OTIgLTAuODMzLC0wLjc2IC0xLjM5MSwtMC42NTkgLTAuNjksMC4xMiAtMS4zMjIsMC4xNzggLTEuOTI3LDAuMTc4IEMgNi4zNzgsMTYuMjM0IDEuMzM0LDExLjE5IDEuMzM0LDQuOTg5IFYgMS4zMzQgQyAxLjMzNCwwLjU5OCAwLjczNywwIDAsMCIKICAgICAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICAgIGlkPSJwYXRoMjAyIiAvPgogICAgICA8L2c+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K);
}
#hutton-banner-land {
  background-color: #C2002F;
  background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgaWQ9InN2ZzYxODkiCiAgIHZlcnNpb249IjEuMSIKICAgdmlld0JveD0iMCAwIDY3LjczMzMyNyA2Ny43MzMzMjkiCiAgIGhlaWdodD0iMjU1Ljk5OTk4IgogICB3aWR0aD0iMjU1Ljk5OTk4Ij4KICA8ZGVmcwogICAgIGlkPSJkZWZzNjE4MyIgLz4KICA8bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGE2MTg2Ij4KICAgIDxyZGY6UkRGPgogICAgICA8Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+CiAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+CiAgICAgICAgPGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPgogICAgICAgIDxkYzp0aXRsZT48L2RjOnRpdGxlPgogICAgICA8L2NjOldvcms+CiAgICA8L3JkZjpSREY+CiAgPC9tZXRhZGF0YT4KICA8ZwogICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI2MC41OTgwNSwtNDcuNjMyNTU3KSIKICAgICBpZD0ibGF5ZXIxIj4KICAgIDxnCiAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgyLjI3MDg3MjQsMCwwLDIuMjcwODcyNCwtMzI1LjYwNjU2LC00MjIuMTA3NjcpIgogICAgICAgaWQ9Imc3Mjk2Ij4KICAgICAgPGcKICAgICAgICAgaWQ9ImcyNDgiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDA0MDM0MDksMCwwLC0wLjQwNDAzNDA5LDM3LjkyNjc3NSwyMTcuMzE5NzkpIj4KICAgICAgICA8cGF0aAogICAgICAgICAgIGQ9Im0gMCwwIGMgLTIuMTIxLDAgLTMuNzg4LC0xLjY3MyAtMy43ODgsLTMuNzI5IDAsLTAuNjc1IDAuMTk3LC0xLjM1MiAwLjU2OSwtMS45NTYgMC4zNjEsLTAuNTg1IDAuMjI4LC0xLjM1IC0wLjMwOSwtMS43NzkgLTEuMzE4LC0xLjA1MyAtMi4wNzIsLTIuNTk4IC0yLjA3MiwtNC4yNDMgMCwtMy4wMDQgMi40NDMsLTUuNDQ5IDUuNDQ5LC01LjQ0OSAyLjM5NCwwIDQuNTM2LDEuNjI2IDUuMjA2LDMuOTUgMC4xNjksMC41ODQgMC43MDMsMC45ODYgMS4zMTIsMC45ODYgMC4wNDQsMCAwLjEwMywtMC4wMDMgMC4xNiwtMC4wMSAwLjY5NywwLjAxMiAxLjM5MiwwLjE5MiAyLjA2MywwLjUzNSAwLjQ2NSwwLjIzNSAxLjAxOSwwLjE4NiAxLjQzNiwtMC4xMjIgMC45NiwtMC43MTggMi4wNzksLTEuMDk2IDMuMjM4LC0xLjA5NiAyLjEzNSwwIDQuMDgsMS4yNjIgNC45NTcsMy4yMTYgMC4yMzQsMC41MTcgMC43NzIsMC44MzQgMS4zMzEsMC44IDAuNTY3LC0wLjAzNSAxLjA1MywtMC40MiAxLjIxNiwtMC45NjUgMC43MDIsLTIuMzI1IDIuNzkxLC0zLjg4OCA1LjE5MSwtMy44ODggMy4wMDUsMCA1LjQ1MiwyLjQ0NSA1LjQ1Miw1LjQ0OSAwLDAuNDcgLTAuMDgyLDAuOTU0IC0wLjI1MiwxLjUyMSAtMC4xOCwwLjU5NyAwLjA2OCwxLjIzOSAwLjYwMSwxLjU2MSAxLjAxOSwwLjYxNCAxLjYyOSwxLjY3MiAxLjYyOSwyLjgzNCAwLDEuODMyIC0xLjQ5MSwzLjMyIC0zLjMyMywzLjMyIC0xLjU5NywwIC0yLjk2NiwtMS4xNDIgLTMuMjU2LC0yLjcxOCAtMC4xMTIsLTAuNjEgLTAuNjIxLC0xLjA2OCAtMS4yNDEsLTEuMTEzIC0wLjU5MSwtMC4wNDIgLTEuMTM1LC0wLjE1OSAtMS42MTIsLTAuMzQ1IC0wLjU5NSwtMC4yMzggLTEuMjgsLTAuMDIyIC0xLjYzNSwwLjUxNCAtMC4zNTYsMC41MzYgLTAuMjg1LDEuMjQ5IDAuMTY2LDEuNzA3IDEuMDA4LDEuMDI3IDEuNTY0LDIuMzgzIDEuNTY0LDMuODE5IDAsMy4wMDMgLTIuNDQ1LDUuNDQ5IC01LjQ0OSw1LjQ0OSAtMi4wOSwwIC00LjAyLC0xLjIzNyAtNC45MTcsLTMuMTUxIEMgMTMuNDksNC42NzIgMTMuMDg1LDQuMzgxIDEyLjYxOCw0LjMyMyAxMi4xNTQsNC4yNjcgMTEuNjksNC40NTMgMTEuMzk0LDQuODE4IDEwLjM0MSw2LjExOCA4LjgwMyw2Ljg2NSA3LjE3Nyw2Ljg2NSA0LjE5Miw2Ljg2NSAxLjc2LDQuNDUyIDEuNzI4LDEuNDc1IDEuNzMyLDEuNDIzIDEuNzM2LDEuMzcgMS43MzYsMS4zMzIgMS43MzYsMC45NTcgMS41ODEsMC41OTkgMS4zMDcsMC4zNDIgMS4wMzYsMC4wODQgMC42NzksLTAuMDQ2IDAuMjk1LC0wLjAyNyAwLjIwMSwtMC4wMjIgMC4xMDksLTAuMDEyIDAuMDE3LDAgWiBtIC0wLjE1MSwtMTkuODggYyAtNC41MDcsMCAtOC4xNzUsMy42NjcgLTguMTc1LDguMTczIDAsMi4xMDYgMC44MTcsNC4xMDIgMi4yNzEsNS42MTggLTAuMzAyLDAuNzU1IC0wLjQ1OCwxLjU1NiAtMC40NTgsMi4zNiAwLDMuMjc2IDIuNDUsNS45OTIgNS42MTQsNi40MDcgMC42MSwzLjkxIDQuMDAxLDYuOTExIDguMDc2LDYuOTExIDEuODM1LDAgMy41OTIsLTAuNjIzIDUuMDE4LC0xLjc1MyAxLjUzLDEuOTQ4IDMuODksMy4xMzggNi40MDgsMy4xMzggNC41MDYsMCA4LjE3NCwtMy42NjggOC4xNzQsLTguMTc1IDAsLTAuMDQgMCwtMC4wNzcgLTAuMDAyLC0wLjExNiAwLjk1MywwLjYyMSAyLjA4NiwwLjk3OCAzLjI5MSwwLjk3OCAzLjMzNSwwIDYuMDQ5LC0yLjcxMiA2LjA0OSwtNi4wNDYgMCwtMS43ODEgLTAuNzc1LC0zLjQyNSAtMi4xMSwtNC41NjcgMC4wODcsLTAuNDYzIDAuMTI5LC0wLjkwOSAwLjEyOSwtMS4zNDkgMCwtNC41MDcgLTMuNjY1LC04LjE3MyAtOC4xNzUsLTguMTczIC0yLjczLDAgLTUuMTg0LDEuMzM2IC02LjY3OCwzLjQ5MiAtMS41MjIsLTEuNjYyIC0zLjY5NSwtMi42NTcgLTYuMDE3LC0yLjY1NyAtMS40ODEsMCAtMi45MTMsMC40MDUgLTQuMTksMS4xNzkgLTAuNTY5LC0wLjIxOCAtMS4xNDcsLTAuMzY2IC0xLjczMywtMC40MzkgLTEuMjcsLTIuOTc3IC00LjIyMywtNC45ODEgLTcuNDkyLC00Ljk4MSIKICAgICAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICAgIGlkPSJwYXRoMjUwIiAvPgogICAgICA8L2c+CiAgICAgIDxnCiAgICAgICAgIGlkPSJnMjUyIgogICAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjQwNDAzNDA5LDAsMCwtMC40MDQwMzQwOSw0My41NDA0MjUsMjMwLjY1MDExKSI+CiAgICAgICAgPHBhdGgKICAgICAgICAgICBkPSJtIDAsMCBjIC0wLjc1NCwwIC0xLjM2NCwwLjYwOSAtMS4zNjQsMS4zNjMgdiAxMi4xNzUgYyAwLDAuMzYxIDAuMTQ0LDAuNzA4IDAuNCwwLjk2NCBsIDYuODcxLDYuODY5IGMgMC41MywwLjUzNCAxLjM5MywwLjUzNCAxLjkyNiwwIDAuNTMxLC0wLjUzMSAwLjUzMSwtMS4zOTMgMCwtMS45MjUgTCAxLjM2MywxMi45NzUgViAxLjM2MyBDIDEuMzYzLDAuNjA5IDAuNzUzLDAgMCwwIgogICAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgaWQ9InBhdGgyNTQiIC8+CiAgICAgIDwvZz4KICAgICAgPGcKICAgICAgICAgaWQ9ImcyNTYiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDA0MDM0MDksMCwwLC0wLjQwNDAzNDA5LDQzLjU0MDQyNSwyMjUuNzMwNzEpIj4KICAgICAgICA8cGF0aAogICAgICAgICAgIGQ9Im0gMCwwIGMgLTAuMzM4LDAgLTAuNjc1LDAuMTI1IC0wLjkzOSwwLjM3NiBsIC02LjI5Niw1Ljk4NiBjIC0wLjU0NywwLjUxOSAtMC41NjgsMS4zODMgLTAuMDQ4LDEuOTI4IDAuNTE4LDAuNTQ0IDEuMzgxLDAuNTY1IDEuOTI1LDAuMDQ3IEwgMC45MzgsMi4zNDkgQyAxLjQ4MiwxLjgzMiAxLjUwNSwwLjk3IDAuOTg2LDAuNDI1IDAuNzE5LDAuMTQxIDAuMzU4LDAgMCwwIgogICAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgaWQ9InBhdGgyNTgiIC8+CiAgICAgIDwvZz4KICAgICAgPGcKICAgICAgICAgaWQ9ImcyNjAiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDA0MDM0MDksMCwwLC0wLjQwNDAzNDA5LDQ3LjE5ODgwNSwyMzAuNjUwMTEpIj4KICAgICAgICA8cGF0aAogICAgICAgICAgIGQ9Im0gMCwwIGggLTE4Ljg1NCBjIC0wLjc1MSwwIC0xLjM2MSwwLjYwOSAtMS4zNjEsMS4zNjMgMCwwLjc1MiAwLjYxLDEuMzYxIDEuMzYxLDEuMzYxIEggMCBDIDAuNzU0LDIuNzI0IDEuMzYxLDIuMTE1IDEuMzYxLDEuMzYzIDEuMzYxLDAuNjA5IDAuNzU0LDAgMCwwIgogICAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgaWQ9InBhdGgyNjIiIC8+CiAgICAgIDwvZz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPgo=);
}
#hutton-banner-partnership {
  background-color: #555559;
  background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgaWQ9InN2ZzYxODkiCiAgIHZlcnNpb249IjEuMSIKICAgdmlld0JveD0iMCAwIDY3LjczMzMyNyA2Ny43MzMzMjkiCiAgIGhlaWdodD0iMjU1Ljk5OTk4IgogICB3aWR0aD0iMjU1Ljk5OTk4Ij4KICA8ZGVmcwogICAgIGlkPSJkZWZzNjE4MyIgLz4KICA8bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGE2MTg2Ij4KICAgIDxyZGY6UkRGPgogICAgICA8Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+CiAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+CiAgICAgICAgPGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPgogICAgICAgIDxkYzp0aXRsZT48L2RjOnRpdGxlPgogICAgICA8L2NjOldvcms+CiAgICA8L3JkZjpSREY+CiAgPC9tZXRhZGF0YT4KICA8ZwogICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI2MC41OTgwNSwtNDcuNjMyNTU3KSIKICAgICBpZD0ibGF5ZXIxIj4KICAgIDxnCiAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgyLjI3MDg3MjQsMCwwLDIuMjcwODcyNCwtNDAxLjY2MjYyLC00MjMuNTYxNTUpIgogICAgICAgaWQ9Imc3MzUyIj4KICAgICAgPGcKICAgICAgICAgaWQ9ImcyNjQiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDA0MDM0MDksMCwwLC0wLjQwNDAzNDA5LDcxLjcxMzAyNSwyMjguNjg3NikiPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgZD0ibSAwLDAgLTAuMDc1LDAuMDAxIGMgLTMuNDY0LDAuMiAtNy4wMywwLjg2MiAtMTAuOTIzLDIuMDI1IC0wLjE4NiwwLjA1NiAtMC4zNjgsMC4xMDIgLTAuNTUxLDAuMTQ5IGwgLTEuMjUxLDAuMzMgMC4wMzQsMTAuNDYgMC4xMDUsMC40NzIgYyAwLjA3MywwLjMyOSAwLjE0NiwwLjY1OCAwLjIyOSwwLjk4NSAwLjc5MywzLjA4NyAyLjYzMyw1LjQ2MiA1LjQ3Miw3LjA1OSAxLjU3NywwLjg4NyAzLjMwNSwxLjM0IDUuMTM4LDEuMzQ3IDEuMDA0LDAuMDA2IDIuMDA5LDAuMDA3IDMuMDEzLDAuMDA3IGwgMy45NDYsLTAuMDA0IGMgMC4xNTYsMCAwLjMxNCwtMC4wMTUgMC40ODcsLTAuMDM1IEwgNi44NzgsMjIuNjc3IDYuOTQxLDIxLjU4IEMgNy4wNjgsMTkuMzIxIDcuODk1LDE3LjQ1OCA5LjQ3LDE1Ljg4NCBMIDEwLjg1MywxNC41MDEgOS4wMjgsMTMuNzk0IEMgMy41MTEsMTEuNjU1IDEuMDQ5LDcuNTk2IDEuNDk4LDEuMzg1IEwgMS41OTEsMC4xMTggMC4zMjIsMC4wMjEgQyAwLjE0OCwwLjAwNSAwLjA3MiwwIDAsMCBtIC0xMC4yNDksNC40NjQgYyAzLjI1MywtMC45NzIgNi4yNTksLTEuNTc0IDkuMTQ1LC0xLjgzMSAtMC4wNDcsNS45OSAyLjUsMTAuMjkzIDcuNTg4LDEyLjgyNSAtMS4wNCwxLjQyNiAtMS43LDMuMDQgLTEuOTcsNC44MjQgbCAtMy4zMjMsMC4wMDMgYyAtMSwwIC0yLC0wLjAwMiAtMy4wMDEsLTAuMDA2IC0xLjM5NCwtMC4wMDcgLTIuNzA3LC0wLjM1IC0zLjkwMSwtMS4wMiAtMi4yMzgsLTEuMjYgLTMuNjI5LC0zLjA1IC00LjI1LC01LjQ3MSAtMC4wNzcsLTAuMjk5IC0wLjE0NCwtMC42MDEgLTAuMjEsLTAuOTAxIGwgLTAuMDc4LC0wLjM1IHoiCiAgICAgICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZjtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIKICAgICAgICAgICBpZD0icGF0aDI2NiIgLz4KICAgICAgPC9nPgogICAgICA8ZwogICAgICAgICBpZD0iZzI2OCIKICAgICAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMC40MDQwMzQwOSwwLDAsLTAuNDA0MDM0MDksODIuNTkxMDE1LDIyOC43OTc5OCkiPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgZD0ibSAwLDAgaCAtMS4yMjYgbCAtMC4wNTgsMS4zOTEgYyAtMC4wMDgsMC4xMzYgLTAuMDE3LDAuMjcyIC0wLjAxNywwLjQxIGwgMC4wMDIsMC41MzYgYyAwLjAwNSwxLjI0NyAwLjAxMSwyLjQyNSAtMC4yNDEsMy41NTIgLTAuNTEzLDIuMzA2IC0xLjY1Myw0LjIyMyAtMy4zODgsNS42OTYgLTAuNTIsMC40NDMgLTEuMTQsMC44NzIgLTEuODQzLDEuMjc3IC0wLjQ0NSwwLjI1NiAtMC45MiwwLjQ2MSAtMS40MDEsMC42NzEgLTAuMjM3LDAuMTA1IC0wLjQ3NiwwLjIwOSAtMC43MTUsMC4zMiBsIC0xLjUxOCwwLjcwMiAxLjM0MiwxLjU4NCBjIDAuMTczLDAuMjAxIDAuMzUzLDAuNDA4IDAuNTIsMC42MjMgMS4wMzgsMS4zMSAxLjYwOSwyLjc3OSAxLjc0OSw0LjQ5NiAwLjExNiwxLjUwNSAxLjMxLDEuNjIzIDEuNjc0LDEuNjIzIDAuNjI5LC0wLjAwOCAxLjIyNSwtMC4wMDkgMS44MjIsLTAuMDA5IGggMS40NTQgYyAxLjE3NywwIDIuMzU0LC0wLjAwNiAzLjUzLC0wLjA0OSAyLjg3NCwtMC4xMDggNS4zOTMsLTEuMjg2IDcuNDg5LC0zLjUwMSAxLjU2OSwtMS42NTMgMi41NDcsLTMuNjggMi45MDcsLTYuMDIyIGwgMC4xMjcsLTAuNTg5IFYgMi45MTQgTCAxMS41MjIsMi41NTcgQyA4LjE1LDAuOCAzLjE4NiwwIDAsMCBtIC02LjMwNiwxNS40OSBjIDAuMjcsLTAuMTI4IDAuNTQxLC0wLjI2NSAwLjgwNywtMC40MTggMC44MzgsLTAuNDgzIDEuNTg1LC0xLjAwMiAyLjIyMywtMS41NDUgQyAtMS4xMSwxMS42ODkgMC4zMTMsOS4zMDQgMC45NSw2LjQ0MyAxLjI0Miw1LjEzMSAxLjI1NiwzLjg0MyAxLjI1MiwyLjU5NCAzLjQ2MywyLjczNCA2Ljg4OSwzLjIzNiA5LjY1OCw0LjQ4NiB2IDguMDI3IGMgLTAuMDQ5LDAuMTU5IC0wLjA4MSwwLjI4NSAtMC4wOTksMC40MTIgLTAuMjgyLDEuODMyIC0xLjAxNCwzLjM1NSAtMi4yMzUsNC42NDQgLTEuNjIzLDEuNzEzIC0zLjU1MiwyLjYyNCAtNS43MzMsMi43MDUgLTEuMTQzLDAuMDQzIC0yLjI5LDAuMDQ5IC0zLjQzNSwwLjA0OSBsIC0xLjQ1NCwtMC4wMDIgYyAtMC4zNDYsMCAtMC42OTIsMTBlLTQgLTEuMDM5LDAuMDAzIC0wLjI2NiwtMS44MDcgLTAuOTI0LC0zLjQxNyAtMS45NjksLTQuODM0IgogICAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgaWQ9InBhdGgyNzAiIC8+CiAgICAgIDwvZz4KICAgICAgPGcKICAgICAgICAgaWQ9ImcyNzIiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDA0MDM0MDksMCwwLC0wLjQwNDAzNDA5LDc3LjQ3NDI0NSwyMzEuODQxMjQpIj4KICAgICAgICA8cGF0aAogICAgICAgICAgIGQ9Im0gMCwwIGMgLTMuNDA1LDAgLTYuODcsMC40NDUgLTEwLjU5NywxLjM1OSAtMC42NzUsMC4xNjYgLTEuMzQ1LDAuMzU3IC0yLjAxNCwwLjU0OSAtMC40NDYsMC4xMjggLTAuODksMC4yNTYgLTEuMzM3LDAuMzc1IC0wLjc5NCwwLjIxMyAtMS4yNjksMC44MzkgLTEuMjY5LDEuNjc2IDAuMDAzLDAuODc1IC0wLjAwMiwxLjc0NiAtMC4wMDgsMi42MTcgLTAuMDA5LDEuNzQ5IC0wLjAyMSwzLjU1NyAwLjAzMiw1LjM0NSAwLjEyOSw0LjI1MSAyLjE3MSw3LjYwNiA1LjkwNiw5LjcwMiAxLjU3NywwLjg4NiAzLjQxNCwxLjMzNSA1LjQ1OSwxLjMzNSBsIDEuMDUxLC0xMGUtNCAzLjMyOCwxMGUtNCB2IC0wLjAzNSBjIDAuOTMxLDAuMDE1IDEuODY1LDAuMDI1IDIuNzk2LC0wLjAyNiAyLjQ5NCwtMC4xMzUgNC43NDksLTEuMDk3IDYuNzAxLC0yLjg2IDEuNzU0LC0xLjU4NSAyLjkwNCwtMy41NzEgMy40MTcsLTUuOTA1IDAuMTU4LC0wLjcyIDAuMjMzLC0xLjQ5NyAwLjI0MiwtMi41MiAwLjAxNCwtMS40MDYgMC4wMTMsLTIuODEyIDAuMDExLC00LjIxNyAwLC0xLjA3IC0xMGUtNCwtMi4xMzkgMC4wMDYsLTMuMjA4IEMgMTMuNzI1LDMuNjEyIDEzLjUyOSwyLjgzNyAxMi41NzcsMi4zOTMgMTAuMTMsMS4yNjIgNy4zNTMsMC41NjUgMy44MzYsMC4xOTggMi41NzksMC4wNjYgMS4yODgsMCAwLDAgbSAtMTIuNjY1LDQuNTc2IGMgMC4yNTMsLTAuMDcxIDAuNTA0LC0wLjE0NCAwLjc1OCwtMC4yMTcgMC42MzYsLTAuMTgyIDEuMjc0LC0wLjM2NiAxLjkxNywtMC41MjMgNC44NDgsLTEuMTg5IDkuMjcyLC0xLjU0OCAxMy41NjIsLTEuMTAyIDMuMDY3LDAuMzIxIDUuNDk0LDAuOTAyIDcuNTk5LDEuODIzIC0wLjAwNCwwLjk0NyAtMC4wMDIsMS44OTMgLTAuMDAyLDIuODM5IDEwZS00LDEuMzk3IDAuMDAyLDIuNzk0IC0wLjAxMyw0LjE5MSAtMC4wMDcsMC44NDIgLTAuMDY0LDEuNDU3IC0wLjE4MSwxLjk5OCAtMC4zOTcsMS44MDQgLTEuMjg0LDMuMzM4IC0yLjYzNyw0LjU2IC0xLjUyNywxLjM4IC0zLjIwNSwyLjEwMSAtNS4xMywyLjIwNSAtMC44ODgsMC4wNDggLTEuNzgzLDAuMDM0IC0yLjY3NCwwLjAyMyAtMC40MTksLTAuMDA2IC0wLjg0LC0wLjAxMSAtMS4yNTksLTAuMDExIGwgLTMuMDc5LDAuMDQ2IGMgLTEuNjQ5LDAgLTMuMDI2LC0wLjMzIC00LjIzNSwtMS4wMDggLTIuOTk3LC0xLjY4MiAtNC41MDMsLTQuMTUzIC00LjYwNiwtNy41NTUgLTAuMDUxLC0xLjc0OSAtMC4wNCwtMy41MDEgLTAuMDI5LC01LjI1NCAwLjAwNCwtMC42NzEgMC4wMDcsLTEuMzQ0IDAuMDA5LC0yLjAxNSIKICAgICAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICAgIGlkPSJwYXRoMjc0IiAvPgogICAgICA8L2c+CiAgICAgIDxnCiAgICAgICAgIGlkPSJnMjc2IgogICAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjQwNDAzNDA5LDAsMCwtMC40MDQwMzQwOSw3Ny4xODA3OTUsMjIzLjM3OTIpIj4KICAgICAgICA8cGF0aAogICAgICAgICAgIGQ9Im0gMCwwIGggLTAuMDYxIGMgLTIuNDE0LDAuMDE3IC00LjY3OSwwLjk3NSAtNi4zNzYsMi42OTggLTEuNjg4LDEuNzE0IC0yLjYwNywzLjk3NiAtMi41ODcsNi4zNyAwLjAzOCw0LjkzIDQuMDc0LDguOTQyIDguOTk2LDguOTQyIEMgMi40MjQsMTguMDAyIDQuNjg3LDE3LjA2MyA2LjM3NiwxNS4zNjQgOC4wNjUsMTMuNjY2IDguOTksMTEuMzk4IDguOTgsOC45NzkgOC45NjEsNC4wMjggNC45MzIsMCAwLDAgbSAtMC4wMDUsMTUuNDYgYyAtMy41NDksMCAtNi40NDIsLTIuODc3IC02LjQ2OCwtNi40MTMgQyAtNi40ODgsNy4zMzUgLTUuODMsNS43MTYgLTQuNjE5LDQuNDg3IC0zLjQwMSwzLjI1IC0xLjc3NiwyLjU2MSAtMC4wNDQsMi41NSBMIDAsMS4yNzUgViAyLjU1IGMgMy41MzIsMCA2LjQxNSwyLjg4OCA2LjQyOSw2LjQ0IDAuMDA4LDEuNzM3IC0wLjY1MywzLjM2MSAtMS44NjEsNC41NzcgLTEuMjA5LDEuMjE1IC0yLjgzMywxLjg4NyAtNC41NzMsMS44OTMiCiAgICAgICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZjtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIKICAgICAgICAgICBpZD0icGF0aDI3OCIgLz4KICAgICAgPC9nPgogICAgICA8ZwogICAgICAgICBpZD0iZzI4MCIKICAgICAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMC40MDQwMzQwOSwwLDAsLTAuNDA0MDM0MDksNzIuNDM2Mjk1LDIyMC4yNjEwMikiPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgZD0ibSAwLDAgYyAtNC4wNjYsMCAtNy41OCwyLjU3OSAtOC43NDUsNi40MTggLTEuMTgzLDMuOTAyIDAuNDEzLDguMSAzLjg4LDEwLjIwOCAyLjkzNCwxLjc4MyA2LjA5OCwxLjg3MyA5LjA1MywwLjI1OCBDIDcuMjIyLDE1LjIyNSA4Ljg0MiwxMi40NjcgOC44NzUsOC45MDcgOC44NzksOC4zNDEgOC42MDgsNy43NDYgOC4xODYsNy4zODggNi42NzcsNi4xMTggNS43MzIsNC41MjQgNS4yOTIsMi41MTYgNS4xNzMsMS45NzkgNC44MDgsMS40NzUgNC4zMzYsMS4xOTQgMy4xMTYsMC40NTcgMS42NDUsMC4wMjIgMC4zMDcsMC4wMDUgWiBtIC0wLjExNiwxNS40ODkgYyAtMS4xMzYsMCAtMi4yODgsLTAuMzUxIC0zLjQyNCwtMS4wNDIgQyAtNi4wMTQsMTIuOTQ0IC03LjE1LDkuOTQ2IC02LjMwNCw3LjE1OCAtNS40NjksNC40MDEgLTIuOTM2LDIuNTUgMCwyLjU1IGwgMC4yNDYsMC4wMDQgYyAwLjg2NCwwLjAxMiAxLjc5NSwwLjI3NCAyLjYwNSwwLjcyNiAwLjU1NSwyLjM0NiAxLjcyLDQuMzE4IDMuNDY3LDUuODY1IC0wLjA5MSwyLjUxNyAtMS4xODksNC4zMTkgLTMuMzUzLDUuNTAyIC0xLjAyMywwLjU1OCAtMi4wNiwwLjg0MiAtMy4wODEsMC44NDIiCiAgICAgICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZjtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIKICAgICAgICAgICBpZD0icGF0aDI4MiIgLz4KICAgICAgPC9nPgogICAgICA8ZwogICAgICAgICBpZD0iZzI4NCIKICAgICAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMC40MDQwMzQwOSwwLDAsLTAuNDA0MDM0MDksODEuNjg0ODY1LDIyMC4zNjMzMykiPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgZD0ibSAwLDAgYyAtMS4xMzcsMCAtMi4yOTksMC4yMjggLTMuNDUzLDAuNjc4IC0xLjAwMywwLjM4OSAtMS4xMzIsMS4yOTUgLTEuMTc1LDEuNTkzIC0wLjI1NiwxLjY5OSAtMC45OTgsMy4xOTggLTIuMjEsNC40NDUgLTAuMzM3LDAuMzQ1IC0wLjc0MywwLjY2MyAtMS4xNzUsMC45OTkgbCAtMC4yMDUsMC4xNjIgYyAtMC4yMTcsMC4xNyAtMC44NywwLjY4NiAtMC43ODcsMS42ODggMC4yNDEsMy4wMiAxLjY0MSw1LjM4NyA0LjE2LDcuMDMxIDEuMzkzLDAuOTA5IDMuMDIzLDEuMzk5IDQuNzE1LDEuNDE1IDQuNDI0LC0wLjAyIDguMSwtMi45OTcgOC45NTYsLTcuMjQgQyA5LjcwOCw2LjQzMSA3LjMxMiwyLjE0NCAzLjEyOSwwLjU3OCAyLjEwMywwLjE5NCAxLjA1LDAgMCwwIE0gLTIuMTUsMi45MTcgQyAtMC42NDEsMi40MTMgMC44MDQsMi40MyAyLjIzNiwyLjk2NiA1LjE4OCw0LjA3MiA2Ljk0OCw3LjIxIDYuMzI4LDEwLjI2NCA1LjcxMiwxMy4zMSAzLjA2LDE1LjQ0NyAtMC4xMjMsMTUuNDYxIC0xLjMyNywxNS40NSAtMi40NTIsMTUuMTEzIC0zLjQ1LDE0LjQ2IC01LjIsMTMuMzE4IC02LjE3NywxMS43NjMgLTYuNDI4LDkuNzE0IC01Ljk1Myw5LjM0MyAtNS40NjMsOC45NTggLTUuMDEsOC40OTMgLTMuNDg1LDYuOTIzIC0yLjUyMyw1LjA0OSAtMi4xNSwyLjkxNyIKICAgICAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICAgIGlkPSJwYXRoMjg2IiAvPgogICAgICA8L2c+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K);
}
</style>
