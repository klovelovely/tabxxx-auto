// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import {getTabsFromLocal} from "./scripts/ext_util";
import "./popup.css"
import Vue from "vue"

const moment = require('moment')
require('moment/locale/zh-cn')
Vue.use(require('vue-moment'), {moment})
console.warn('moment 当前语言：', Vue.moment().locale()) //es


let tabs = []
let app

document.addEventListener('DOMContentLoaded', async function () {
  console.log('DOMContentLoaded')

  chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log({
      message,
      sender,
      sendResponse
    })
    if (message === 'needRerender') {
      console.log('message: needRerender')
      await autoRerender();
    }
  })

  await render({tabs: await getTabsFromLocal()});

})


async function autoRerender () {
  // let background = chrome.extension.getBackgroundPage();
  app.tabs = getTabsFromLocal()
}

function render (data) {

  app = new Vue({
    el: '#app',
    data,
    computed: {
      existTabsOver24H: function () {
        return this.tabs.filter((tab) => {
          return (Date.now() - tab.lastUpdateTime) / 1000 / 60 / 60 / 24 >= 1
        }).sort((a, b) => {
          return a.lastUpdateTime - b.lastUpdateTime
        })
      },
      existTabsBelow24H: function () {
        return this.tabs.filter((tab) => {
          return (Date.now() - tab.lastUpdateTime) / 1000 / 60 / 60 / 24 < 1
        }).sort((a, b) => {
          return a.lastUpdateTime - b.lastUpdateTime
        })
      }
    },
    methods: {
      refreshTabs: function () {
        console.log('refreshTabs: ')

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
      }
    },
    mounted: function () {
      EasterEggs()
    }
  })
}

function EasterEggs () {
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
}