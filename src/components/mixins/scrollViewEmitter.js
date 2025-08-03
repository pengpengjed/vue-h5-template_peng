import Emitter from './emitter'
export default {
  name: 'ScrollViewEmitter',
  mixins: [Emitter],
  methods: {
    refreshView() {
      this.dispatch('ScrollView', 'refresh-view')
    }
  }
}
