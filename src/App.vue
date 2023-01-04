<template>
  <div id="root">
    <header>
      <Publicity v-show="!running" />
      <el-button
        class="res"
        type="text"
        @click="showResult = true"
        style="color: #333"
      >
        抽獎結果
      </el-button>
      <el-button
        class="con"
        type="text"
        @click="showConfig = true"
        style="color: #333"
      >
        抽獎配置
      </el-button>
    </header>
    <div id="main" :class="{ mask: showRes }"></div>
    <div id="tags">
      <ul v-for="item in datas" :key="item.key">
        <li>
          // TODO: change color here
          <a
            href="javascript:void(0);"
            :style="{
              color: '#E0414E'
            }"
          >
            {{ item.name ? item.name : item.key }}
            <img v-if="item.photo" :src="item.photo" :width="50" :height="50" />
          </a>
        </li>
      </ul>
    </div>
    <div class="side-right">
      <el-button class="audio" type="text" @click="playAudio(!audioPlaying)">
        <i
          class="iconfont"
          :class="[audioPlaying ? 'iconstop' : 'iconplay1']"
        ></i>
      </el-button>

      <Tool
        @toggle="toggle"
        @resetConfig="reloadTagCanvas"
        @getPhoto="getPhoto"
        :running="running"
        :closeRes="closeRes"
      />
    </div>
    <transition name="bounce">
      <div id="resbox" v-show="showRes">
        <p @click="showRes = false">{{ categoryName }}抽獎結果：</p>
        <div class="container">
          <span
            v-for="item in resArr"
            :key="item"
            class="itemres"
            :style="resCardStyle"
            :data-id="item"
            @click="showRes = false"
            :class="{
              numberOver:
                !!photos.find(d => d.id === item) ||
                !!list.find(d => d.key === item)
            }"
          >
            <span class="cont" v-if="!photos.find(d => d.id === item)">
              <div
                v-if="!!list.find(d => d.key === item)"
                class="flex-column line-height-initial"
                :style="{
                  fontSize: '40px'
                }"
              >
                <span>{{ list.find(d => d.key === item).name }}</span>
                <span>{{ list.find(d => d.key === item).nameCH }}</span>
              </div>
              <!-- <span
                v-if="!!list.find(d => d.key === item)"
                :style="{
                  fontSize: '40px'
                }"
              >
                {{ list.find(d => d.key === item).name }}
              </span> -->
              <span v-else>
                {{ item }}
              </span>
            </span>
            <!-- <img
              v-if="photos.find(d => d.id === item)"
              :src="photos.find(d => d.id === item).value"
              alt="photo"
              :width="160"
              :height="160"
            /> -->
          </span>
        </div>
      </div>
    </transition>
    <LotteryConfig :visible.sync="showConfig" @resetconfig="reloadTagCanvas" />
    <Result :visible.sync="showResult"></Result>

    <!-- <span class="copy-right">
      Copyright©zhangyongfeng5350@gmail.com
    </span> -->

    <audio
      id="audiobg"
      preload="auto"
      controls
      autoplay
      loop
      @play="playHandler"
      @pause="pauseHandler"
    >
      <source :src="audioSrc" />
      你的瀏覽器不支持audio標籤
    </audio>
  </div>
</template>
<script>
import LotteryConfig from '@/components/LotteryConfig';
import Publicity from '@/components/Publicity';
import Tool from '@/components/Tool';
import bgaudio from '@/assets/bg.mp3';
import beginaudio from '@/assets/begin.mp3';
import {
  getData,
  configField,
  resultField,
  newLotteryField,
  conversionCategoryName,
  listField
} from '@/helper/index';
import { luckydrawHandler } from '@/helper/algorithm';
import Result from '@/components/Result';
import { database, DB_STORE_NAME } from '@/helper/db';
// import axios from 'axios';
export default {
  name: 'App',

  components: { LotteryConfig, Publicity, Tool, Result },

  computed: {
    resCardStyle() {
      const style = { fontSize: '30px' };
      const { number } = this.config;
      if (number < 100) {
        style.fontSize = '100px';
      } else if (number < 1000) {
        style.fontSize = '80px';
      } else if (number < 10000) {
        style.fontSize = '60px';
      }
      return style;
    },
    config: {
      get() {
        return this.$store.state.config;
      }
    },
    result: {
      get() {
        return this.$store.state.result;
      },
      set(val) {
        this.$store.commit('setResult', val);
      }
    },
    list() {
      return this.$store.state.list;
    },
    lottery() {
      return this.$store.state.newLottery;
    },
    allresult() {
      let allresult = [];
      for (const key in this.result) {
        if (this.result.hasOwnProperty(key)) {
          const element = this.result[key];
          allresult = allresult.concat(element);
        }
      }
      return allresult;
    },
    resultsKeyData() {
      return Object.keys(this.$store.state.result);
    },
    datas() {
      const { number } = this.config;
      // const totalPeople = this.resultsKeyData.reduce((total, key) => {
      //   return total + this.config[key];
      // }, 0);
      const nums = number >= 1500 ? 500 : this.config.number;
      const configNum = number > 1500 ? Math.floor(number / 3) : number;
      const remainingData = this.filterRemainingData(
        luckydrawHandler(configNum, [], nums)
      );
      const randomShowDatas = remainingData.map(item => {
        const listData = this.list.find(data => {
          return data.key === item;
        });
        const photo = this.photos.find(d => d.id === item);
        return {
          key: item * (number > 1500 ? 3 : 1),
          name: listData ? listData.name : '',
          photo: photo ? photo.value : ''
        };
      });

      return randomShowDatas;
    },
    categoryName() {
      return conversionCategoryName(this.category);
    },
    photos() {
      return this.$store.state.photos;
    }
  },
  created() {
    const data = getData(configField);
    if (data) {
      this.$store.commit('setConfig', Object.assign({}, data));
    }
    const result = getData(resultField);
    if (result) {
      this.$store.commit('setResult', result);
    }

    const newLottery = getData(newLotteryField);
    // loading page 如果尚未設定各項獎品人數，則會補上 0.
    if (newLottery) {
      const config = this.config;
      newLottery.forEach(item => {
        this.$store.commit('setNewLottery', item);
        if (!config[item.key]) {
          this.$set(config, item.key, 0);
        }
      });
      this.$store.commit('setConfig', config);
    }

    const list = getData(listField);
    if (list) {
      this.$store.commit('setList', list);
    }
  },

  data() {
    return {
      running: false,
      showRes: false,
      showConfig: false,
      showResult: false,
      resArr: [],
      category: '',
      audioPlaying: false,
      audioSrc: bgaudio
    };
  },
  watch: {
    photos: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          this.reloadTagCanvas();
        });
      }
    }
  },
  mounted() {
    this.startTagCanvas();
    setTimeout(() => {
      this.getPhoto();
    }, 1000);
    window.addEventListener('resize', this.reportWindowSize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.reportWindowSize);
  },
  methods: {
    filterRemainingData(numbersData) {
      return numbersData.filter(
        num =>
          !this.resultsKeyData
            .map(key => this.result[key])
            .flat()
            .includes(num)
      );
    },
    reportWindowSize() {
      const AppCanvas = this.$el.querySelector('#rootcanvas');
      if (AppCanvas.parentElement) {
        AppCanvas.parentElement.removeChild(AppCanvas);
      }
      this.startTagCanvas();
    },
    playHandler() {
      this.audioPlaying = true;
    },
    pauseHandler() {
      this.audioPlaying = false;
    },
    playAudio(type) {
      if (type) {
        this.$el.querySelector('#audiobg').play();
      } else {
        this.$el.querySelector('#audiobg').pause();
      }
    },
    loadAudio() {
      this.$el.querySelector('#audiobg').load();
      this.$nextTick(() => {
        this.$el.querySelector('#audiobg').play();
      });
    },
    getPhoto() {
      database.getAll(DB_STORE_NAME).then(res => {
        if (res && res.length > 0) {
          this.$store.commit('setPhotos', res);
        }
      });
    },
    speed() {
      return [0.1 * Math.random() + 0.01, -(0.1 * Math.random() + 0.01)];
    },
    createCanvas() {
      const canvas = document.createElement('canvas');
      canvas.width = document.body.offsetWidth;
      canvas.height = document.body.offsetHeight;
      canvas.id = 'rootcanvas';
      this.$el.querySelector('#main').appendChild(canvas);
    },
    startTagCanvas() {
      this.createCanvas();
      const { speed } = this;
      window.TagCanvas.Start('rootcanvas', 'tags', {
        textColour: null,
        initial: speed(),
        dragControl: 1,
        textHeight: 20,
        noSelect: true,
        lock: 'xy'
      });
    },
    reloadTagCanvas() {
      window.TagCanvas.Reload('rootcanvas');
    },
    closeRes() {
      this.showRes = false;
    },
    toggle(form) {
      const { speed, config } = this;
      if (this.running) {
        this.audioSrc = bgaudio;
        this.loadAudio();

        window.TagCanvas.SetSpeed('rootcanvas', speed());
        this.showRes = true;
        this.running = !this.running;
        this.$nextTick(() => {
          this.reloadTagCanvas();
        });
      } else {
        this.showRes = false;
        if (!form) {
          return;
        }

        this.audioSrc = beginaudio;
        this.loadAudio();

        const { number } = config;
        const { category, mode, qty, remain, allin } = form;
        let num = 1;
        if (mode === 1 || mode === 5) {
          num = mode;
        } else if (mode === 0) {
          num = remain;
        } else if (mode === 99) {
          num = qty;
        }
        const resArr = luckydrawHandler(
          number,
          allin ? [] : this.allresult,
          num
        );
        this.resArr = resArr;

        this.category = category;
        if (!this.result[category]) {
          this.$set(this.result, category, []);
        }
        const oldRes = this.result[category] || [];
        const data = Object.assign({}, this.result, {
          [category]: oldRes.concat(resArr)
        });
        this.result = data;
        // this.updateResultToGoogleSheet(category, resArr);
        window.TagCanvas.SetSpeed('rootcanvas', [5, 1]);
        this.running = !this.running;
      }
    }
    // updateResultToGoogleSheet(key, winnerIds) {
    // const data = JSON.stringify({
    //   name: winnerIds.map(id => this.list.find(data => data.key === id).name),
    //   nameCH: winnerIds.map(
    //     id => this.list.find(data => data.key === id).nameCH
    //   ),
    //   prize: this.lottery.find(data => data.key === key).name
    // });
    // axios
    //   .post(
    //     'https://script.google.com/macros/s/AKfycbwYrVlL91tTCHmdNnpgcOBW1Jym4rRiqikRW5-DoxtVXPFiPN5NceDGS_H1mjhiv9ik/exec',
    //     data
    //   )
    //   .then(function(response) {
    //     console.log(response.data);
    //   })
    //   .catch(function(error) {
    //     console.log(error);
    //   });
    // const request = axios.create({
    //   baseURL: `https://script.google.com/`,
    //   timeout: 5000,
    //   headers: {
    //     'Content-Type': 'text/plain; charset=utf-8',
    //     'Access-Control-Allow-Origin': '*'
    //   }
    // });
    // request
    //   .post(
    //     'macros/s/AKfycbwYrVlL91tTCHmdNnpgcOBW1Jym4rRiqikRW5-DoxtVXPFiPN5NceDGS_H1mjhiv9ik/exec',
    //     data
    //   )
    //   .then(res => {
    //     console.log(res);
    //     debugger;
    //   })
    //   .catch(err => {
    //     console.log(err);
    //     this.$message({
    //       message: '更新雲端表單失敗',
    //       type: 'warning'
    //     });
    //   });
    // }
  }
};
</script>
<style lang="scss">
#root {
  height: 100%;
  position: relative;
  &::after {
    content: '';
    height: 100%;
    position: absolute;
    background-image: linear-gradient(
        to bottom,
        rgba(230, 230, 230, 0),
        rgba(0, 38, 111, 0.35)
      ),
      url(/img/onead_2023.7642b816.jpg);
    background-size: 100% 100%;
    background-position: center center;
    background-repeat: no-repeat;
    background-color: #121936;
    width: 100%;
    top: 0;
    left: 0;
    z-index: -1;
  }

  .mask {
    -webkit-filter: blur(5px);
    filter: blur(5px);
    background-color: rgba(0, 0, 0, 0.25);
  }
  header {
    background-color: #e4be85;
    // opacity: 60%;
    height: 50px;
    line-height: 50px;
    position: relative;
    .el-button {
      position: absolute;
      top: 17px;
      padding: 0;
      z-index: 9999;
      &.con {
        right: 20px;
      }
      &.res {
        right: 100px;
      }
    }
  }
  .audio {
    position: absolute;
    top: 20px;
    width: 40px;
    height: 40px;
    line-height: 40px;
    border: 1px solid #fc5f49;
    border-radius: 50%;
    padding: 0;
    z-index: 1;
    .iconfont {
      position: relative;
      color: #fc5f49;
      left: 1px;
    }
  }
  .copy-right {
    position: absolute;
    right: 0;
    bottom: 0;
    color: #ccc;
    font-size: 12px;
  }
  .bounce-enter-active {
    animation: bounce-in 1.5s;
  }
  .bounce-leave-active {
    animation: bounce-in 0s reverse;
  }
}
#main {
  height: 100%;
}

#resbox {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1280px;
  transform: translateX(-50%) translateY(-50%);
  text-align: center;
  p {
    color: red;
    font-size: 50px;
    line-height: 120px;
    text-shadow: 0.03em 0.03em 0 hsl(230deg 40% 50%);
  }
  .container {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  }
  .itemres {
    background: #fff;
    // width: 160px;
    height: 160px;
    padding: 0 20px;
    border-radius: 4px;
    border: 1px solid #ccc;
    line-height: 160px;
    font-weight: bold;
    margin-right: 20px;
    margin-bottom: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    .cont {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    &.numberOver::before {
      content: attr(data-id);
      width: 30px;
      height: 22px;
      line-height: 22px;
      background-color: #fff;
      position: absolute;
      bottom: 0;
      left: 0;
      font-size: 14px;
      // border-radius: 50%;
      z-index: 1;
    }
  }
}
.side-right {
  position: fixed;
  width: 100px;
  height: calc(100% - 50px);
  top: 0px;
  right: 0px;
  margin-top: 50px;
  display: flex;
  justify-content: center;
}
.flex-column {
  display: flex;
  flex-direction: column;
}
.line-height-initial {
  line-height: initial;
}
</style>
