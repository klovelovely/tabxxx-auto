// export async function setTabsToLocal(tabs) {
//   return new Promise(function (resolve) {
//     chrome.storage.local.set({ tabs }, function () {
//       console.log('tabs is set to ', tabs);
//       resolve(tabs)
//     });
//   })
// }
//
// export async function getTabsFromLocal() {
//   return new Promise(function (resolve) {
//     chrome.storage.local.get(['tabs'], function (result) {
//       console.log('tabs currently is ', result.tabs);
//       resolve(result.tabs)
//     });
//   })
// }

export function setTabsToLocal (tabs) {
  tabs.forEach(item => {
    if(item && typeof item.favIconUrl === 'undefined'){
      item.favIconUrl = `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12"/></svg>`
    }
  })
  localStorage.setItem('tabs', JSON.stringify(tabs))
  console.log('设置 tabs 成功：', tabs);
  return tabs
}

export function getTabsFromLocal () {
  let tabs = JSON.parse(localStorage.getItem('tabs'));
  console.log('获取 tabs 成功：', tabs);
  return tabs
}

/**
 * 强制更新当前 tab 选项卡的状态到本地存储中
 * @returns {Promise<unknown>}
 */
export async function forceUpdateCurrentTabsToLocal () {
  return new Promise(resolve => {
    chrome.tabs.query({}, function (tabs) {
      for (let i = 0; i < tabs.length; i++) {
        const tab = tabs[i];
        const ts = Date.now()
        tab.createTime = ts;
        tab.lastUpdateTime = ts;
      }
      setTabsToLocal(tabs);

      resolve(tabs)
    });
  })
}

export async function removeMultipleTabs (tabs) {
  return new Promise(resolve => {
    for (var i = 0; i < tabs.length; i++) {
      chrome.tabs.remove(tabs[i].id);
    }
    resolve(tabs)
  })
}

export async function removeAllTabs () {
  return new Promise(resolve => {
    chrome.tabs.query({}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        chrome.tabs.remove(tabs[i].id);
      }
      resolve(tabs)
    });
  })
}

export async function sendPopupRerenderRequest () {
  chrome.runtime.sendMessage(undefined, 'needRerender');
}