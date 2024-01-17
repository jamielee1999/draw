<template>
  <div class="tool">
    <div class="button-list">
      <el-button size="mini" @click="showImportParticipants = true">
        匯入名單
      </el-button>
      <el-button size="mini" @click="showImportPrizes = true">
        匯入獎項
      </el-button>
      <el-button
        size="mini"
        type="danger"
        plain
        @click="showRemoveoptions = true"
      >
        重置
      </el-button>
    </div>

    <el-dialog
      :append-to-body="true"
      title="抽獎設定"
      :visible="showLotteryModal"
      class="default-dialog-config setwat-dialog"
      width="400px"
      :show-close="false"
      @open="toggleLotteryDialog(true)"
      @close="toggleLotteryDialog(false)"
    >
      <el-form
        ref="form"
        :model="form"
        label-width="80px"
        size="mini"
        class="option-config"
      >
        <el-form-item label="抽獎人">
          <el-select v-model="curPresenter" placeholder="請選擇抽獎人" clearable @change="clearCurPrize">
            <el-option
              v-for="presenter in presenterList"
              :label="presenter.name"
              :key="presenter.key"
              :value="presenter.key"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="抽取獎項">
          <el-select
            v-model="form.category"
            placeholder="請選擇抽取的獎項"
            no-data-text="尚未配置獎項數量"
            :disabled="!curPresenter"
            clearable
          >
            <el-option
              :label="item.label"
              :value="item.value"
              v-for="item in categories"
              :key="item.value"
            >
              <span style="float: left; padding-right: 2rem;">{{ item.label }}</span>
              <span style="float: right; color: #8492a6; font-size: 12px">{{
                `${remainingAmount(item.value)}/${item.number}`
              }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 剩餘獎項數文字顯示 -->
        <!-- <el-form-item label=" " v-if="form.category">
          <span>
            共&nbsp;
            <span class="colorred">{{ config[form.category] }}</span>
            &nbsp;名
          </span>
          <span :style="{ marginLeft: '20px' }">
            剩餘&nbsp;
            <span class="colorred">{{ remain }}</span>
            &nbsp;名
          </span>
        </el-form-item> -->

        <el-form-item label="抽取方式">
          <el-select v-model="form.mode" placeholder="請選擇抽取方式">
            <el-option label="抽 1 人" :value="1"></el-option>
            <el-option label="一次抽完" :value="0"></el-option>
            <el-option label="自訂人數" :value="99"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="抽取人數" v-if="form.mode === 99">
          <el-input
            v-model="form.qty"
            type="number"
            :clearable="true"
            :min="1"
            :max="remain ? remain : 100"
            :step="1"
          ></el-input>
        </el-form-item>
        <!-- <div>
          <el-form-item label="全員參與">
            <el-switch v-model="form.allin"></el-switch>
          </el-form-item>
          <span class="warning-text">
            * 開啟後將在全體成員 (無論有無中獎) 中抽獎
          </span>
        </div> -->

        <div class="footer">
          <el-button size="mini" type="primary" @click="onSubmit"
            >立即抽獎</el-button
          >
          <el-button size="mini" @click="setLotteryModalShow(false)"
            >取消</el-button
          >
        </div>
      </el-form>
    </el-dialog>
    <!-- ====== 獎項 ====== -->
    <el-dialog
      :visible.sync="showImportPrizes"
      :append-to-body="true"
      width="400px"
      class="default-dialog-config"
      :show-close="false"
      :before-close="handleClose"
    >
      <div class="add-title" slot="title">增加獎項</div>
      <el-radio-group class="input-option" v-model="listRadio">
        <el-radio
          v-for="option in importListOptions"
          :label="option.key"
          :key="option.key"
          >{{ option.name }}</el-radio
        >
      </el-radio-group>
      <el-upload
        v-if="listRadio === 'csv'"
        class="upload-csv"
        ref="refPrizesFile"
        action
        :limit="1"
        accept=".csv"
        :auto-upload="false"
        :on-change="onChangePrizes"
      >
        <el-button size="small" type="primary">點擊上傳</el-button>
      </el-upload>
      <div v-if="listRadio === 'text-input'" class="upload-input">
        <div>
          <span>獎項名稱</span>
          <el-input
            v-model="prizesFormData.name"
            size="small"
            placeholder="請輸入獎項名稱"
          ></el-input>
        </div>
        <div>
          <span>配置數量</span>
          <el-input
            v-model="prizesFormData.number"
            size="small"
            placeholder="請輸入數量"
            @input="checkNumInput"
          ></el-input>
        </div>
      </div>
      <div class="footer">
        <el-button size="mini" type="primary" @click="transformPrizesList"
          >確定</el-button
        >
        <el-button size="mini" @click="closeImportDialog">取消</el-button>
      </div>
    </el-dialog>
    <!-- ====== 名單 ====== -->
    <el-dialog
      :append-to-body="true"
      :visible.sync="showImportParticipants"
      class="default-dialog-config"
      width="400px"
      :show-close="false"
    >
      <div class="add-title" slot="title">匯入名單</div>
      <el-radio-group class="input-option" v-model="listRadio">
        <el-radio
          v-for="option in importListOptions"
          :label="option.key"
          :key="option.key"
          >{{ option.name }}</el-radio
        >
      </el-radio-group>
      <el-upload
        v-if="listRadio === 'csv'"
        class="upload-csv"
        ref="refFile"
        action
        :limit="1"
        accept=".csv"
        :auto-upload="false"
        :on-change="onChange"
        :before-remove="beforeRemove"
      >
        <div v-show="!listData.length" slot="tip" class="el-upload__tip ms-2">
          只能上傳 csv 檔案
        </div>
        <el-button size="small" type="primary">點擊上傳</el-button>
      </el-upload>
      <div v-if="listRadio === 'text-input'" class="upload-input">
        <div>
          <span>英文名稱</span>
          <el-input
            v-model="participantsFormData.en_name"
            size="small"
            placeholder="請輸入英文名稱"
          ></el-input>
        </div>
        <div>
          <span>中文名稱</span>
          <el-input
            v-model="participantsFormData.zh_mane"
            size="small"
            placeholder="請輸入中文名稱"
          ></el-input>
        </div>
      </div>

      <div class="footer mt-5">
        <el-button size="mini" type="primary" @click="transformList"
          >確定</el-button
        >
        <el-button size="mini" @click="closeImportDialog">取消</el-button>
      </div>
    </el-dialog>
    <!-- ====== 照片 ====== -->
    <!-- <Importphoto
      :visible.sync="showImportphoto"
      @getPhoto="$emit('getPhoto')"
    ></Importphoto> -->
    <!-- ====== 重置設定 ====== -->
    <el-dialog
      :visible.sync="showRemoveoptions"
      width="400px"
      class="default-dialog-config removeoptions"
      :append-to-body="true"
      :show-close="false"
    >
      <div class="add-title" slot="title">重置選項</div>
      <el-form ref="form" :model="removeInfo" label-width="80px" size="mini">
        <el-form-item>
          <el-radio-group v-model="removeInfo.type">
            <el-radio border :label="0">重置全部</el-radio>
            <el-radio border :label="1" :disabled="lottery.length === 0"
              >重置獎項</el-radio
            >
            <el-radio border :label="2" :disabled="list.length === 0"
              >重置名單</el-radio
            >
            <!--
            <el-radio border :label="3">重置照片</el-radio>
            -->
            <el-radio
              border
              :label="4"
              :disabled="Object.keys(result).length === 0"
              >重置結果</el-radio
            >
          </el-radio-group>
        </el-form-item>
        <div class="footer">
          <el-button size="mini" type="primary" @click="resetConfig"
            >確定</el-button
          >
          <el-button size="mini" @click="showRemoveoptions = false"
            >取消</el-button
          >
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import {
  clearData,
  removeData,
  configField,
  newLotteryField,
  conversionCategoryName,
  listField,
  resultField,
  getNumberOfPeople
} from '@/helper/index';
// import Importphoto from './Importphoto';
import { database, DB_STORE_NAME } from '@/helper/db';
import Papa from 'papaparse';
import { randomNum } from '@/helper/algorithm';
import _ from 'lodash';
import { mapState, mapMutations } from 'vuex';

export default {
  props: {
    running: Boolean,
    closeRes: Function
  },
  computed: {
    ...mapState(['config', 'result', 'list', 'showLotteryModal']),
    lottery() {
      return this.$store.state.newLottery;
    },
    config() {
      return this.$store.state.config;
    },
    remain() {
      const { prizes } = this.config;
      return prizes[this.form.category]
        ? prizes[this.form.category].number -
            (this.result[this.form.category]
              ? this.result[this.form.category].length
              : 0)
        : 0;
    },
    categories() {
      const { prizes } = this.config;
      const options = [];
      for (const key in prizes) {
        if (prizes.hasOwnProperty(key)) {
          const prizeNum = prizes[key].number;
          const presenterKey = prizes[key].presenterKey
          const name = conversionCategoryName(key);
          if (prizeNum > 0 && name) {
            options.push({
              label: name,
              value: key,
              number: prizeNum,
              presenterKey
            });
          }
        }
      }

      return options.filter(item => item.presenterKey === this.curPresenter);
    },
    presenterList() {
      const seen = new Map();
      const uniqueObjects = [];

      Object.values(this.config.prizes).forEach(item => {
        const key = item.presenterKey;
        const name = item.presenterName;
        const obj = { key, name };

        // 使用 key 的字符串形式作为 Map 的键
        const keyString = JSON.stringify(obj);

        if (!seen.has(keyString)) {
          seen.set(keyString, true);
          uniqueObjects.push(obj);
        }
      });

      return uniqueObjects;
    }
  },
  // components: { Importphoto },
  data() {
    const importListOptions = [
      {
        key: 'csv',
        name: '匯入CSV'
      },
      {
        key: 'text-input',
        name: '手動輸入(單筆)'
      }
    ];
    const defaultParticipantsData = {
      en_name: '',
      zh_mane: ''
    };
    const defaultPrizesData = {
      name: ''
    };
    return {
      importListOptions,
      listRadio: 'csv',
      showImportParticipants: false,
      // showImportphoto: false,
      showImportPrizes: false,
      showRemoveoptions: false,
      removeInfo: { type: 0 },
      form: {
        category: '',
        mode: 0,
        qty: 1,
        allin: false
      },
      listData: [],
      prizesData: [],
      defaultParticipantsData,
      defaultPrizesData,
      participantsFormData: { ...defaultParticipantsData },
      prizesFormData: { ...defaultPrizesData },
      curPresenter: ''
    };
  },
  watch: {
    showRemoveoptions(v) {
      if (!v) {
        this.removeInfo.type = 0;
      }
    }
  },
  methods: {
    ...mapMutations(['setLotteryModalShow']),
    remainingAmount(key) {
      const { prizes } = this.config;
      const numberOfResults = this.result[key] ? this.result[key].length : 0;
      return prizes[key] ? prizes[key].number - numberOfResults : 0;
    },
    onChange(file) {
      this.listData = [];
      const csvData = this.listData;
      Papa.parse(file.raw, {
        complete: function(res) {
          csvData.push(...res.data);
        }
      });
    },
    onChangePrizes(file) {
      this.prizesData = [];
      const csvData = this.prizesData;
      Papa.parse(file.raw, {
        complete: function(res) {
          res.data.forEach(data => {
            csvData.push({
              key: data[0],
              name: data[1],
              number: data[2],
              presenterName: data[3],
              presenterKey: data[4]
            });
          });
        }
      });
    },
    resetConfig() {
      const type = this.removeInfo.type;
      this.$confirm('此操作將重置所選數據，是否繼續？', '提示', {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          switch (type) {
            case 0:
              clearData();
              this.$store.commit('setClearStore');
              database.clear(DB_STORE_NAME);
              break;
            case 1:
              if (_.isEmpty(this.result)) {
                this.form.category = '';
                removeData(configField);
                removeData(newLotteryField);
                this.$store.commit('clearConfig');
                break;
              } else {
                this.$message({
                  type: 'warning',
                  message: '已進行過抽獎，請先重置結果後再重置獎項!'
                });
                return;
              }
            case 2:
              if (_.isEmpty(this.result)) {
                removeData(listField);
                this.$store.commit('clearList');
                break;
              } else {
                this.$message({
                  type: 'warning',
                  message: '已進行過抽獎，請先重置結果後再重置名單!'
                });
                return;
              }
            case 3:
              database.clear(DB_STORE_NAME);
              this.$store.commit('clearPhotos');
              break;
            case 4:
              removeData(resultField);
              this.$store.commit('clearResult');
              break;
            default:
              break;
          }

          this.closeRes && this.closeRes();

          this.showRemoveoptions = false;
          this.$message({
            type: 'success',
            message: '重置成功!'
          });

          this.$nextTick(() => {
            this.$emit('resetConfig');
          });
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          });
        });
    },
    onSubmit() {
      if (!this.form.category) {
        return this.$message.error('請選擇本次抽取的獎項');
      }
      if (this.remain <= 0) {
        return this.$message.error('該獎項剩餘人數不足');
      }
      if (this.form.mode === 99) {
        if (this.form.qty <= 0) {
          return this.$message.error('必須輸入本次抽取人數');
        }
        if (this.form.qty > this.remain) {
          return this.$message.error('本次抽獎人數已超過本獎項的剩餘人數');
        }
      }
      if (this.form.mode === 1) {
        if (this.form.mode > this.remain) {
          return this.$message.error('本次抽獎人數已抽過本獎項的剩餘人數');
        }
      }
      this.setLotteryModalShow(false);
      this.$emit(
        'toggle',
        Object.assign({}, this.form, { remain: this.remain })
      );
    },
    transformList() {
      const list = this.list.length > 0 ? this.list : [];
      if (this.listRadio === 'csv') {
        if (this.$refs.refFile.uploadFiles.length === 0) {
          this.$message.error('請匯入資料！');
          return;
        }
        // 先濾掉 csv 內空的或資料缺少的項目，在將處理後的內容設定到 store list.
        // ----------------
        // TODO: 資料格式驗證
        // ----------------=
        this.listData
          .filter(data => data[0] !== '')
          .forEach(item => {
            const key = list.length + 1;
            const name = item[0].trim();
            const nameCH = item[1] ? item[1].trim() : '-';
            list.push({
              key,
              name,
              nameCH
            });
          });
      } else {
        const hasParticipantsData = Object.keys(
          this.participantsFormData
        ).every(keys => this.participantsFormData[keys]);
        if (!hasParticipantsData) {
          this.$message.error('資料輸入不完整，請重新確認輸入的資料！');
          return;
        }
        list.push({
          key: this.list.length + 1,
          name: this.participantsFormData.en_name,
          nameCH: this.participantsFormData.zh_mane
        });
      }

      // TODO: setup list here
      this.$store.commit('setList', list);
      this.$message({
        message: '匯入名單成功',
        type: 'success'
      });
      this.$nextTick(() => {
        if (this.listRadio === 'csv') {
          this.$refs.refFile.clearFiles();
        } else {
          this.participantsFormData = this.defaultParticipantsData;
        }
        this.closeImportDialog();
        this.$emit('resetConfig');
      });
    },
    transformPrizesList() {
      let lotteryList = [];
      if (this.listRadio === 'csv') {
        if (this.$refs.refPrizesFile.uploadFiles.length === 0) {
          this.$message.error('請匯入資料！');
          return;
        }

        lotteryList = this.prizesData.map(
          ({ name, number, presenterKey, presenterName }, index) => {
            return {
              key: index + 1,
              name: `${index + 1}. ${name}`,
              number: Number(number) || 0,
              presenterKey,
              presenterName
            };
          }
        );
      } else {
        // FIXME: 手動輸入獎項的邏輯要重寫
        const hasPrizesData = Object.keys(this.prizesFormData).every(
          keys => this.prizesFormData[keys]
        );
        if (!hasPrizesData) {
          this.$message.error('請輸入獎項名稱');
          return;
        }
        lotteryList.push({
          key: this.randomField(),
          name: this.prizesFormData.name,
          number: Number(this.prizesFormData.number)
        });
      }
      this.$store.commit('setNewLottery', lotteryList);

      // 獎項預設配比數設定
      if (this.lottery.length > 0) {
        const peopleNum = getNumberOfPeople(this.$store.state);
        this.config.number = peopleNum;
        lotteryList.forEach(item => {
          if (item.key) {
            this.config.prizes[item.key] = {
              number: item.number,
              name: item.name,
              presenterKey: item.presenterKey,
              presenterName: item.presenterName
            };
          }
        });

        this.$store.commit('setConfig', this.config);
      }

      this.$message({
        message: '匯入獎項成功',
        type: 'success'
      });

      this.$nextTick(() => {
        if (this.listRadio === 'csv') {
          this.$refs.refPrizesFile.clearFiles();
        } else {
          this.prizesFormData = this.defaultPrizesData;
        }
        this.closeImportDialog();
        this.$emit('resetConfig');
      });

      // reload Page
      location.reload();
    },
    randomField() {
      const str = 'abcdefghijklmnopqrstuvwxyz';
      let fieldStr = '';
      for (let index = 0; index < 10; index++) {
        fieldStr += str.split('')[randomNum(1, 27) - 1];
      }
      return `${fieldStr}${Date.now()}`;
    },
    closeImportDialog() {
      if (this.showImportParticipants) {
        this.showImportParticipants = false;
      }
      if (this.showImportPrizes) {
        this.showImportPrizes = false;
      }
      this.listRadio = 'csv';
    },
    // clearImportData() {
    //   // 清除名單 Dialog 設定
    //   if (this.listRadio === 'csv') {
    //     this.$refs.refFile.clearFiles();
    //     this.$refs.refPrizesFile.clearFiles();
    //   } else {
    //     this.listData.length = 0;
    //     Object.assign(this.participantsFormData, {
    //       ...this.defaultParticipantsData
    //     });
    //     // 清除獎項 Dialog 設定
    //     this.prizesData.length = 0;
    //     Object.assign(this.prizesFormData, {
    //       ...this.defaultPrizesData
    //     });
    //   }
    // },
    handleClose(done) {
      this.$confirm('資料尚未儲存，是否離開？')
        .then(() => {
          done();
        })
        .catch(() => {});
    },
    checkNumInput(val) {
      if (typeof val === 'string') {
        this.prizesFormData.number = Number.isNaN(parseInt(val, 10))
          ? 0
          : Math.abs(parseInt(val, 10));
      }
    },
    beforeRemove(file) {
      return this.$confirm(`確定移除 ${file.name}？`);
    },
    toggleLotteryDialog(isOpen) {
      this.setLotteryModalShow(isOpen);
    },
    clearCurPrize() {
      this.form.category = null
    }
  }
};
</script>
<style lang="scss" scoped>
.button-list {
  display: flex;
  flex-direction: column;
  .el-button {
    margin: 0 0 12px;
  }
}
.option-config {
  ::v-deep .el-form-item__label {
    text-align: left;
  }
  .el-form-item__content {
    div {
      width: 100%;
    }
  }
}
.default-dialog-config {
  .footer {
    height: 40px;
    line-height: 40px;
    text-align: center;
    button {
      width: 80px;
    }
  }
}
.removeoptions {
  ::v-deep .el-form-item__content {
    margin-left: 0px !important;
    display: flex;
    flex-direction: column;
    text-align: center;
  }
  .el-radio {
    margin-right: 0px;
    width: 182px;
  }
  .el-radio.is-bordered + .el-radio.is-bordered {
    margin-left: 0px;
  }
  .el-radio.is-bordered {
    margin-bottom: 10px;
  }
}

.upload-csv {
  border: 1px solid #dcdfe6;
  color: #606266;
  border-radius: 4px;
  padding: 5px;
  display: flex;
}
::v-deep .el-upload-list {
  margin: auto 0 !important;
  li {
    margin: 0;
    margin-top: 0px !important;
  }
}
.upload-input {
  display: flex;
  flex-direction: column;

  div {
    margin: 5px 0px;
  }
}
.warning-text {
  position: relative;
  left: 10px;
  top: -6px;
  font-size: 12px;
  color: #ff2f2f;
}
.input-option {
  margin-bottom: 10px;
}
</style>
