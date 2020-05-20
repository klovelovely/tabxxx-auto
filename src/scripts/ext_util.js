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

export function setTabsToLocal(tabs) {
    localStorage.setItem('tabs', JSON.stringify(tabs))
    console.log('设置 tabs 成功：', tabs);
    return tabs
}

export function getTabsFromLocal() {
    let tabs = JSON.parse(localStorage.getItem('tabs'));
    console.log('获取 tabs 成功：', tabs);
    return tabs
}