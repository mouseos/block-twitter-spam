const s1 = document.createElement('script');
s1.src = chrome.runtime.getURL('./script/detect_lang.js');
s1.addEventListener('load', function() {
  console.log('loaded');
  this.remove();
});
(document.head || document.documentElement).append(s1);


const s3 = document.createElement('script');
s3.src = chrome.runtime.getURL('./script/script.js');
s3.addEventListener('load', function() {
  console.log('loaded');
  this.remove();
});
(document.head || document.documentElement).append(s3);
