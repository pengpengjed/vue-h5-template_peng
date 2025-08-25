<template>
  <learnProcess :sourceData="sourceData" :soflSeqNr="'115362939'" />
</template>

<script>
import learnProcess from './components/learnProcess/index.vue'
import sourceData from './mockData/sourceData.json'

export default {
  components: { learnProcess },
  data() {
    return {
      sourceData
    }
  }
}
</script>

<style></style>
