var s1 = document.createElement('script');
s1.src = chrome.runtime.getURL('./script/detect_lang.js');
s1.onload = function () {
  console.log("loaded");
  this.remove();
};
(document.head || document.documentElement).appendChild(s1);


var s3 = document.createElement('script');
s3.src = chrome.runtime.getURL('./script/script.js');
s3.onload = function () {
    console.log("loaded");
  this.remove();
};
(document.head || document.documentElement).appendChild(s3);

