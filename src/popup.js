// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import {
  getTabsFromLocal,
  forceUpdateCurrentTabsToLocal,
  removeMultipleTabs,
  sendPopupRerenderRequest
} from "./scripts/ext_api_util";
import "./styles/base.css"
import "./popup.css"
import Vue from "vue"

let app
window.app = app
const moment = require('moment')
require('moment/locale/zh-cn')
Vue.use(require('vue-moment'), {moment})
console.log('moment 当前语言：', Vue.moment().locale()) //es

listenDOMContentLoaded();

function listenDOMContentLoaded () {
  document.addEventListener('DOMContentLoaded', async function () {
    console.log('DOMContentLoaded', new Date().toLocaleTimeString())
    render({tabs: await getTabsFromLocal()});
  })
}

function render (data) {
  window.app = new Vue({
    el: '#app',
    data,
    computed: {
      existTabsOver24H: function () {
        let existTabsOver24H = this.tabs.filter((tab) => {
          return (Date.now() - tab.lastUpdateTime) / 1000 / 60 / 60 / 24 >= 1
        }).sort((a, b) => {
          return a.lastUpdateTime - b.lastUpdateTime
        });
        console.log({existTabsOver24H})
        return existTabsOver24H
      },
      existTabsBelow24H: function () {
        let existTabsBelow24H = this.tabs.filter((tab) => {
          return (Date.now() - tab.lastUpdateTime) / 1000 / 60 / 60 / 24 < 1
        }).sort((a, b) => {
          return a.lastUpdateTime - b.lastUpdateTime
        });
        console.log({existTabsBelow24H})
        return existTabsBelow24H
      }
    },
    methods: {
      listenRenderRequestMessage: function(){
        chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
          console.log({message, sender, sendResponse})
          if (message === 'needRerender') {
            console.log('message: needRerender')
            await this.autoRerender();
          }
        })
      },
      autoRerender: async function () {
        // let background = chrome.extension.getBackgroundPage();
        this.tabs = getTabsFromLocal()
      },
      removeMultipleTabs: async function (tabs) {
        await removeMultipleTabs(tabs)
      },
      closeTab: function (tabId) {
        console.log('closeTab: ', tabId)
        chrome.tabs.remove([tabId])
      },
      switchTab: function (windowId, tabIndex) {
        console.log('switchTab: ', windowId, tabIndex)
        chrome.tabs.highlight({
          windowId,
          tabs: [tabIndex]
        })
        chrome.windows.update(windowId, {
          focused: true
        })
      },
      updateTabs: async function () {
        await forceUpdateCurrentTabsToLocal()
        await this.autoRerender()
      },
      EasterEggs: function  () {
        let changeColor = document.getElementById('changeColor');
        chrome.storage.sync.get('color', function (data) {
          changeColor.style.backgroundColor = data.color;
          changeColor.setAttribute('value', data.color);
        });
        changeColor.onclick = function (element) {
          let color = element.target.value;
          chrome.tabs.query({
            active: true,
            currentWindow: true
          }, function (tabs) {
            chrome.tabs.executeScript(tabs[0].id, {
              code: 'document.body.style.backgroundColor = "' + color + '";'
            });
          });
        };
      },
    },
    mounted: function () {
      console.log('---------------------------mounted.')
      this.listenRenderRequestMessage()
      this.EasterEggs()
    }
  })
}