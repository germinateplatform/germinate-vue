<template>
  <div class="app page-login flex-row align-items-center">
    <div class="container">
      <b-row>
        <b-col lg=7>
          <b-card-group>
            <!-- Login -->
            <b-card no-body class="p-4">
              <b-card-body>
                <h2>{{ $t('widgetSignInTitle') }}</h2>
                <SignInForm v-on:login="login" :enabled="enabled"/>
                <p class="text-danger mt-3" v-if="response">{{ response }}</p>
              </b-card-body>
            </b-card>
            <!-- Registration -->
            <b-card no-body class="text-white bg-primary py-5" v-if="serverSettings && serverSettings.registrationEnabled">
              <b-card-body class="text-center">
                <div>
                  <h2>{{ $t('widgetRegisterTitle') }}</h2>
                  <p>{{ $t('widgetRegisterText') }}</p>
                  <b-button variant="primary" class="active mt-3" @click="$refs.registrationModal.show()">{{ $t('buttonRegister') }}</b-button>
                </div>
              </b-card-body>
            </b-card>
          </b-card-group>
        </b-col>
        <!-- Spacing -->
        <b-col lg=1 class="d-none d-lg-block"></b-col>
        <!-- Germinate logo -->
        <b-col lg=4>
          <div id="svg-logo" class="d-flex justify-content-center align-items-center h-100 py-3"/>
        </b-col>
        <!-- Horizontal logos below, same width as login+registration -->
        <b-col lg=7>
          <b-card no-body class="p-4 mt-3">
            <b-img-lazy :src="this.baseUrl + 'image/src-svg/logo-horizontal.svg'" id="logo-horizontal" onerror="this.onerror=null;this.src='null';" alt="Project partner logo" />
          </b-card>
        </b-col>
      </b-row>
    </div>

    <!-- Registration modal -->
    <RegistrationModal ref="registrationModal"/>
  </div>
</template>

<script>
import SignInForm from '@/components/util/SignInForm'
import RegistrationModal from '@/components/modals/RegistrationModal'
import authApi from '@/mixins/api/auth.js'
import Snap from 'snapsvg'

export default {
  name: 'Login',
  data: function () {
    return {
      response: null,
      enabled: true
    }
  },
  components: {
    RegistrationModal,
    SignInForm
  },
  mixins: [ authApi ],
  methods: {
    login: function (user) {
      this.enabled = false
      this.apiPostToken(user, result => {
        this.enabled = true
        const originalTarget = this.originalTarget
        // If it's successful, finally store them
        if (originalTarget) {
          var path = originalTarget
          this.$store.commit('ON_ORIGINAL_TARGET_CHANGED_MUTATION', null)
          // Do this after resetting the original target, so it's changed in the correct place (no user)
          this.$store.commit('ON_TOKEN_CHANGED_MUTATION', result)
          this.$router.push(path)
        } else {
          // Do this here as well
          this.$store.commit('ON_TOKEN_CHANGED_MUTATION', result)
          this.$router.push('/')
        }
      }, {
        codes: [],
        callback: error => {
          if (error.status === 403 || error.status === 400) {
            this.response = this.$t('errorMessageInvalidUsernamePassword')
          } else {
            this.response = this.$t('errorMessageServerUnavailable')
          }
          this.enabled = true
          // If they're wrong, remove
          this.$store.dispatch('ON_TOKEN_CHANGED', null)
        }
      })
    },
    animateLogo: function () {
      // Get the container
      const s = new Snap('#svg-logo svg')

      // Specify all elements of the SVG to animate
      const elements = [{
        id: '#sh',
        opacity: 0.29200003
      }, {
        id: '#t3',
        opacity: 1
      }, {
        id: '#t2',
        opacity: 1
      }, {
        id: '#t1',
        opacity: 1
      }, {
        id: '#g6',
        opacity: 1
      }, {
        id: '#g5',
        opacity: 1
      }, {
        id: '#g4',
        opacity: 1
      }, {
        id: '#g3',
        opacity: 1
      }, {
        id: '#g2',
        opacity: 1
      }, {
        id: '#g1',
        opacity: 1
      }, {
        id: '#bg',
        opacity: 1
      }]

      // Hide them all
      s.selectAll('path').forEach(e => {
        e.stop()
        e.attr({
          opacity: 0
        })
      })

      // Hide them all
      elements.forEach(e => {
        const el = s.select(e.id)
        el.stop()
        el.attr({
          opacity: 0
        })
      })

      // Show them one after the other
      elements.reverse().forEach((e, i) => {
        setTimeout(() => s.select(e.id).animate({ opacity: e.opacity }, 500, window.mina.linear), i * 65)
      })
    }
  },
  mounted: function () {
    // Load the SVG
    Snap.load('./img/germinate-square.svg', data => {
      // Attach to container
      new Snap('#svg-logo').append(data)

      // Start animation
      this.animateLogo()

      // On click, animate again
      new Snap('#svg-logo svg').click(e => this.animateLogo())
    })
  }
}
</script>

<style>
.page-login {
  min-height: calc(100vh - 255px);
}
#svg-logo > svg {
  max-width: 300px;
  max-height: 300px;
}
#logo-horizontal {
  width: 100%;
  height: auto;
}
</style>
