// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import {
  setTabsToLocal,
  getTabsFromLocal,
  forceUpdateCurrentTabsToLocal,
  sendPopupRerenderRequest
} from "./scripts/ext_api_util";

let havenInit = true

chrome.runtime.onInstalled.addListener(async function () {
  console.log('onInstalled')
  if (havenInit) {
    await init();
  }
});

chrome.windows.onCreated.addListener(function () {
  console.log('chrome.windows.onCreated')
  chrome.windows.getAll(async function (windows) {
    if (windows.length === 1) {
      console.log('chrome.windows.onCreated && window === 1')
      if (havenInit) {
        await init();
      }
    }
  });
});

let updatePageRules = function () {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        // pageUrl: {hostEquals: 'developer.chrome.com'},
        pageUrl: {urlMatches: '.*'},
      })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
};

async function init () {
  console.log('ext installed')

  // 首次加载时遍历已有的 tabs
  let tabs = await forceUpdateCurrentTabsToLocal();
  console.log('首次加载时遍历已有的 tabs', tabs)
  // 添加用户 tab 操作监听
  await initTabOperateListener();

  initEasterEggs();
  updatePageRules();
}

async function initTabOperateListener () {
  // 创建 tab 时
  chrome.tabs.onCreated.addListener(async function (tab) {
    console.log('tab 被创建', {tab})
    tab.createTime = Date.now()
    tab.lastUpdateTime = Date.now()

    let tabs = getTabsFromLocal()
    tabs.push(tab)
    setTabsToLocal(tabs)
    await sendPopupRerenderRequest();
  })

  // tab 页状态更新时
  chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
    console.log('tab 状态发生变化', {tabId, changeInfo, tab})
    if (tab.status === 'complete') {
      let tabs = getTabsFromLocal()
      let oldTabInfo = tabs.filter(tab => {
        return tab.id === tabId;
      })[0]
      Object.assign(oldTabInfo, tab, {
        lastUpdateTime: Date.now()
      })
      setTabsToLocal(tabs)
      await sendPopupRerenderRequest();
    }
  })

  // tab 被移除时
  chrome.tabs.onRemoved.addListener(async function (tabId, removeInfo, tab) {
    console.log('tab 被移除', {tabId, removeInfo, tab})
    let tabs = getTabsFromLocal()
    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i].id === tabId) {
        tabs.splice(i, 1)
      }
    }
    setTabsToLocal(tabs)
    await sendPopupRerenderRequest();
  })
}

function initEasterEggs () {
  chrome.storage.sync.set({color: '#3aa757'}, function () {
    console.log("The color is green.");
  });
}