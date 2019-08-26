import store from './store/store'

export default {
  loggedIn () {
    var token = store.getters.token
    return token !== null && this.tokenStillValid()
  },
  tokenStillValid () {
    var token = store.getters.token
    if (token) {
      return new Date().getTime() - token.createdOn <= token.lifetime
    } else {
      return false
    }
  }
}
