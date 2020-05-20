// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import {setTabsToLocal, getTabsFromLocal} from "./scripts/ext_util";

chrome.runtime.onInstalled.addListener(function() {

  console.log('ext installed')

  // 首次加载时遍历已有的 tabs
  checkAndInitTabList();

  chrome.storage.sync.set({color: '#3aa757'}, function() {
    console.log("The color is green.");
  });
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        // pageUrl: {hostEquals: 'developer.chrome.com'},
        pageUrl: {urlMatches: '.*'},
      })
      ],
          actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

function checkAndInitTabList() {
  chrome.tabs.query({}, async function (tabs) {
    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i];
      const ts = Date.now()
      tab.createTime = ts;
      tab.lastUpdateTime = ts;
    }
    setTabsToLocal(tabs);
  });

  // 创建 tab 时
  chrome.tabs.onCreated.addListener(async function (tab) {
    console.log('tabs onCreated', {
      tab
    })
    tab.createTime = Date.now()
    tab.lastUpdateTime = Date.now()

    let tabs = getTabsFromLocal()
    tabs.push(tab)
    setTabsToLocal(tabs)
    sendPopupRerenderRequest();
  })

  // tab 页状态更新时
  chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
    console.log('tabs onUpdated', {
      tabId,
      changeInfo,
      tab
    })
    let tabs = getTabsFromLocal()
    let oldTab = tabs.filter(tab => {
      return tab.id === tabId;
    })[0]
    Object.assign(oldTab, changeInfo, {
      lastUpdateTime: Date.now()
    })
    setTabsToLocal(tabs)
    sendPopupRerenderRequest();
  })

  // tab 被移除时
  chrome.tabs.onRemoved.addListener(async function (tabId, removeInfo, tab) {
    console.log('tabs onRemoved', {
      tabId,
      removeInfo,
      tab
    })
    let tabs = getTabsFromLocal()
    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i].id === tabId) {
        tabs.splice(i, 1)
      }
    }
    setTabsToLocal(tabs)
    sendPopupRerenderRequest();
  })
}

function sendPopupRerenderRequest() {
  chrome.runtime.sendMessage(undefined, 'needRerender');
}

