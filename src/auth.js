import store from './store/store'

export default {
  loggedIn () {
    let token = store.getters.token
    return token !== null && this.tokenStillValid()
  },
  tokenStillValid () {
    let token = store.getters.token
    if (token) {
      return new Date().getTime() - token.createdOn <= token.lifetime
    } else {
      return false
    }
  }
}
