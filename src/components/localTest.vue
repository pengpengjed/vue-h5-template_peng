<!-- 本地调试页面 -->
  <template>
  <!-- 本地调试页面可供APP内调试问题 -->
  <div class="local-test">
    <div class="header">
      <span name="button" @click="$emit('close')">关闭</span>
      <span name="title">选择服务器</span>
      <span name="button" @click="onConfirmClick">确定</span>
    </div>
    <!-- 网络协议 -->
    <div class="flex pt2">
      <span class="flex5 title">网络协议</span>
      <van-radio-group direction="horizontal" v-model="params.network">
        <van-radio name="http">http</van-radio>
        <van-radio name="https">https</van-radio>
      </van-radio-group>
    </div>
    <!-- 域名1 -->
    <div class="flex pt2">
      <span class="flex5 title">域名1</span>
      <van-radio-group direction="horizontal" v-model="params.domain1">
        <van-radio name="192.168.1">192.168.1</van-radio>
        <van-radio name="10.95.15">10.95.15</van-radio>
        <van-radio name="10.95.16">10.95.16</van-radio>
        <van-radio name="10.95.18">10.95.18</van-radio>
        <van-radio name="10.95.23">10.95.23</van-radio>
      </van-radio-group>
    </div>
    <!-- 域名2 -->
    <div class="flex pt2">
      <span class="flex5 title">域名2</span>
      <van-radio-group direction="horizontal" v-model="params.domain2">
        <van-radio name="132">132</van-radio>
        <van-radio name="138">138</van-radio>
        <van-radio name="5">5</van-radio>
        <van-radio name="6">6</van-radio>
        <van-radio name="7">7</van-radio>

      </van-radio-group>
      <input class="picker-search" v-model="params.domain2" type="text" placeholder="请输入IP最后一位"  />
    </div>
    <!-- 端口 -->
    <div class="flex pt2">
      <span class="flex5 title">端口</span>
      <van-radio-group direction="horizontal" v-model="params.port">
        <van-radio name="840">840</van-radio>
        <van-radio name="841">841</van-radio>
        <van-radio name="842">842</van-radio>
        <van-radio name="843">843</van-radio>
        <van-radio name="849">849</van-radio>
        <van-radio name="850">850</van-radio>
        <van-radio name="8080">8080</van-radio>
      </van-radio-group>
    </div>
   
  </div>
</template>
  <script>
export default {
  name: "LocalTest",
  data() {
    return {
      params: {
        network: "http",
        domain1: "10.95.15",
        domain2: "132",
        port: "840",
        url: "/index"
      },
      href: "http://192.168.1.101:4399/#/",
      href1: "http://192.168.1.101:4399/#/"
    };
  },
  mounted() {
    this.$native.Imap.getH5ModuleList().then(res => {
      window.console.log("获取模块列表", res);
    });
  },
  computed: {
    url() {
      const { network, domain1, domain2, port } = this.params;
      return `${network}://${domain1}.${domain2}:${port}/#/`;
    },
    isAndroid() {
      return this.$store.state.isAndroid;
    }
  },
  methods: {
    onConfirmClick(){
        const url = this.params.network +'://'+ this.params.domain1 + '.'+this.params.domain2 +':'+ this.params.port
        window.location.href = url
    },
    go1() {
      this.$router.push(this.params.url);
    },
    go2() {
      window.location.href = this.url;
    },
    go3() {
      window.location.href = this.href;
    },
    go4() {
      window.open(this.href1);
    }
  }
};
</script>
<style lang="less" scoped>
.header {
    background-color: #3788fe;
    height: 40px;
    line-height: 40px;
    position: relative;
    text-align: center;
    color: #ffffff;
    font-size: 16px;
    display: flex;
    flex-direction: row;

    span[name="title"] {
      flex: 1;
    }
    span[name="button"] {
      line-height: 40px;
      font-size: 14px;
      padding: 0 20px;
    }
  }
.local-test {
  font-size: 16px;
  line-height: 24px;
}
.picker-search{
    width: 100%;
    border: 1px solid #3788fe;
}
</style>
