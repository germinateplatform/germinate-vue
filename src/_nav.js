export default {
  items: [
    {
      name: 'Dashboard',
      url: '/dashboard',
      icon: 'mdi mdi-18px mdi-home',
      badge: {
        variant: 'primary',
        text: 'NEW'
      }
    },
    {
      name: 'Data',
      url: '/data',
      icon: 'mdi mdi-18px mdi-harddisk',
      children: [
        {
          name: 'Accessions',
          url: '/data/accessions',
          icon: 'mdi mdi-18px mdi-sprout'
        }
      ]
    }
  ]
}
