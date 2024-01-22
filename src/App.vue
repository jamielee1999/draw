<template>
  <div id="root">
    <div class="scss-snow-bg"></div>
    <header class="header fixed container py-5">
      <div class="flex justify-content-end ">
        <MenuButton :is-open="showMenu" @toggle="toggelMenu" />
      </div>
      <!-- NOTE: 隱藏 跑馬燈 -->
      <div v-if="false">
        <Publicity v-show="!running" />
      </div>
    </header>
    <div
      id="main"
      :class="{ mask: showRes }"
      class="flex justify-content-center align-items-center"
    ></div>
    <div id="tags">
      <ul v-for="item in datas" :key="item.key">
        <li>
          <a href="javascript:void(0);">
            {{ item.name ? item.name : item.key }}
            <img v-if="item.photo" :src="item.photo" :width="50" :height="50" />
          </a>
        </li>
      </ul>
    </div>
    <div class="full absolute container h-100">
      <el-dialog
        :visible.sync="showMenu"
        width="300px"
        center
        custom-class="bg-main-400"
      >
        <h3 class="text-center fw-500 fs-10 mb-5">設置</h3>
        <div class="flex flex-col align-center pb-4">
          <Tool
            @toggle="toggle"
            @resetConfig="reloadTagCanvas"
            @getPhoto="getPhoto"
            :running="running"
            :closeRes="closeRes"
          />
          <hr class="w-100 border-white mb-5" />
          <el-button @click="showConfig = true" size="mini" class="mb-3">
            檢視設定
          </el-button>
          <el-button @click="showResult = true" size="mini" class="ms-0 mb-3">
            抽獎結果
          </el-button>
        </div>
      </el-dialog>
    </div>
    <div class="side-left">
      <el-button class="audio" type="text" @click="playAudio(!audioPlaying)">
        <i
          class="iconfont"
          :class="[audioPlaying ? 'iconstop' : 'iconplay1']"
        ></i>
      </el-button>
    </div>
    <div class="start-btn" v-show="!showRes && !showMenu">
      <StartButton :running="running" @toggle="toggle" />
    </div>
    <transition name="bounce">
      <div class="resbox" v-show="showRes" @click="closeRes">
        <div class="text-white">
          <h3 class="fs-18 fw-500 mb-3">抽獎結果：</h3>
          <h4 class="fs-24 fw-700 mb-8" @click="showRes = false">
            {{ categoryName }}
          </h4>
        </div>
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
                class="flex flex-col line-height-initial"
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
import StartButton from '@/components/StartButton.vue';
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
import MenuButton from '@/components/MenuButton.vue';

// import axios from 'axios';
export default {
  name: 'App',

  components: {
    LotteryConfig,
    Publicity,
    Tool,
    Result,
    StartButton,
    MenuButton
  },

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
      // const nums = number >= 1500 ? 500 : this.config.number;
      // const configNum = number > 1500 ? Math.floor(number / 3) : number;
      const remainingData = this.filterRemainingData(
        luckydrawHandler(number, [], number)
      );
      const randomShowDatas = remainingData.map(item => {
        const listData = this.list.find(data => {
          return data.key === item;
        });

        // TODO: photo 目前都沒使用 之後可考慮拔掉
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
    } else {
      this.$store.commit('setConfig', this.config);
    }
    const result = getData(resultField);
    if (result) {
      this.$store.commit('setResult', result);
    }

    const newLottery = getData(newLotteryField);
    if (newLottery) {
      this.$store.commit('setNewLottery', newLottery);
    }

    // // loading page 如果尚未設定各項獎品人數，則會補上 0.
    // if (newLottery) {
    //   const config = this.config.prizes;
    //   newLottery.forEach(item => {
    //     this.$store.commit('setNewLottery', item);
    //     if (!config[item.key]) {
    //       this.$set(config, item.key, 0);
    //     }
    //   });
    //   this.$store.commit('setConfig', config);
    // }

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
      audioSrc: bgaudio,
      showMenu: false
    };
  },
  mounted() {
    this.startTagCanvas();
    setTimeout(() => {
      this.getPhoto();
    }, 1000);
    window.addEventListener('resize', this.reportWindowSize);
    this.appendSnowEffects();
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
      canvas.height = document.body.offsetHeight * 0.8;
      canvas.id = 'rootcanvas';
      this.$el.querySelector('#main').appendChild(canvas);
    },
    startTagCanvas() {
      this.createCanvas();
      const { speed } = this;
      window.TagCanvas.Start('rootcanvas', 'tags', {
        textColour: '#fff',
        initial: speed(),
        dragControl: 1,
        textHeight: 32,
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
        window.TagCanvas.SetSpeed('rootcanvas', [5, 1]);
        this.running = !this.running;
      }
    },
    appendSnowEffects() {
      const box = document.querySelector('.scss-snow-bg');

      const fragment = document.createDocumentFragment();

      for (let i = 0; i < 200; i++) {
        let snow = document.createElement('div');
        snow.classList.add('snow');
        fragment.appendChild(snow);
      }

      box.appendChild(fragment);
    },
    toggelMenu() {
      this.showMenu = !this.showMenu;
    }
  }
};
</script>
<style lang="scss">
@import '@/assets/style/theme';

#root {
  height: 100%;
  position: relative;
  &::after {
    content: '';
    height: 100%;
    position: absolute;
    background-image: linear-gradient(
        to bottom,
        rgba(7, 7, 7, 0.7),
        rgba(22, 22, 22, 0.7)
      ),
      url(./assets/1.jpg);
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
  .header {
    color: white;
    // opacity: 60%;
    width: 100%;
    height: 50px;
    right: 0;
    line-height: 50px;
    z-index: 10;
  }
  .audio {
    position: absolute;
    top: 20px;
    width: 82px;
    height: 82px;
    line-height: 82px;
    border: 1px solid white;
    border-radius: 50%;
    padding: 0;
    z-index: 1;
    opacity: 0.25;
    .iconfont {
      position: relative;
      color: white;
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

.resbox {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1280px;
  transform: translateX(-50%) translateY(-50%);
  text-align: center;
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
.side-left {
  position: fixed;
  width: 82px;
  height: 82px;
  bottom: 32px;
  left: 32px;
}
.side-right {
  position: fixed;
  width: 100px;
  height: calc(100% - 50px);
  top: 100px;
  right: 0px;
  display: flex;
  justify-content: center;
}
.line-height-initial {
  line-height: initial;
}

.start-btn {
  position: fixed;
  top: 65%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.full {
  inset: 0;
}

.menu {
  position: absolute;
  width: 300px;
  height: 300px;
  top: 35%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  padding: 1.5rem;
  border-radius: 1rem;
}

// snow animation
.scss-snow-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  // background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
  overflow: hidden;
  filter: drop-shadow(0 0 10px white);
}

$total: 200;
.snow {
  position: absolute;
  width: 10px;
  height: 10px;
  background: white;
  border-radius: 50%;
}
@function random_range($min, $max) {
  $rand: random();
  $random_range: $min + floor($rand * (($max - $min) + 1));
  @return $random_range;
}
@for $i from 1 through $total {
  $random-x: random(1000000) * 0.0001vw;
  $random-offset: random_range(-100000, 100000) * 0.0001vw;
  $random-x-end: $random-x + $random-offset;
  $random-x-end-yoyo: $random-x + ($random-offset / 2);
  $random-yoyo-time: random_range(30000, 80000) / 100000;
  $random-yoyo-y: $random-yoyo-time * 100vh;
  $random-scale: random(10000) * 0.0001;
  $fall-duration: random_range(10, 30) * 1s;
  $fall-delay: random(30) * -1s;

  .snow:nth-child(#{$i}) {
    opacity: random(10000) * 0.0001;
    transform: translate($random-x, -10px) scale($random-scale);
    animation: fall-#{$i} $fall-duration $fall-delay linear infinite;
  }

  @keyframes fall-#{$i} {
    #{percentage($random-yoyo-time)} {
      transform: translate($random-x-end, $random-yoyo-y) scale($random-scale);
    }

    to {
      transform: translate($random-x-end-yoyo, 100vh) scale($random-scale);
    }
  }
}
</style>
