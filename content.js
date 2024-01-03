//１文字でもアラビア語があるかどうかを判定する関数
function containsArabic(text) {
  // アラビア語の正規表現
  var arabicRegex = /[\u0600-\u06FF]/;

  // テキスト内でアラビア語が見つかったかどうかを返す
  return arabicRegex.test(text);
}


//絵文字のみで構成されているかどうかを判定する関数
function isEmojiOnly(text) {
  // 絵文字の正規表現パターン
  const emojiPattern = /[\u{1F300}-\u{1FAD6}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}]/u;
  
  // テキスト内の各文字が絵文字であるかをチェック
  for (let i = 0; i < text.length; i++) {
    if (!text[i].match(emojiPattern)) {
      return false;
    }
  }
  
  return true;
}

//特定の文字が含まれているかどうかを判定する関数　関数内で定義済みのリストから検索
function containsSpecial(text) { 
    const specialTexts = ["🇸🇦"];
    for (let i = 0; i < specialTexts.length; i++) {
        if (text.includes(specialTexts[i])) {
            return true;
        }
    }
    return false;
}




// Mutation Observerの設定
const targetNode = document.body; // 監視対象の要素
const config = { childList: true, subtree: true };
let tweets = [];
let tmp_tweets;//一時的な連想配列
let menuButton;//メニューボタン
let reportButton;//報告ボタン
// 新しいtweet要素が追加された時に行う処理
const tweetObserverCallback = function(mutationsList, observer) {
  for(const mutation of mutationsList) {
    if (mutation.type === 'childList') {
      // [data-testid="tweet"]要素が追加された場合に実行する処理
      const newTweets = document.querySelectorAll('[data-testid="tweet"]');
      
      // ここで新しいtweet要素に対する処理を行います
      newTweets.forEach(tweet => {
            //tweetにあるdata-testid="User-Name"の直下のdivを取得
            let userName = tweet.querySelector('[data-testid="User-Name"] div');
            //console.log(userName.textContent);
            //tweetにあるa hrefを取得
            let userUrl = tweet.querySelector('a').href;
            //console.log(userUrl);
            //userIdを取得 https://twitter.com/を削除する
            let userId = userUrl.replace('https://twitter.com/', '');
          //console.log(userId);
          
            //文章を取得　data-testid="tweetText"
          let tweetText = tweet.querySelector('[data-testid="tweetText"]');
          //teweetTextをtextContentで取得 try catchでエラー回避
            try {
                tweetText = tweetText.textContent;
            } catch (e) {
                tweetText = ' ';
            }
          //console.log(tweetText.textContent);
          
          //これらをtweetsに連想配列として重複なくpush
          tmp_tweets={ userName: userName.textContent, userUrl: userUrl, userId: userId };
          //userNameに１文字でもアラビア語がある場合、もしくはtweetTextが絵文字のみで構成されている場合にコンソールに連想配列出力　push
          if (containsArabic(userName.textContent) || isEmojiOnly(tweetText) || (containsArabic(tweetText) && !containsArabic(userName.textContent)) || containsSpecial(userName.textContent)) {
              //tmp_tweetsが既にtweetsに存在しない場合にpush
                if (tweets.find(function (tweet) { return tweet.userName == userName.textContent; }) == undefined) {
                    tweets.push(tmp_tweets);
                    console.log(tweets);
                    menuButton = (tweet.querySelector('[data-testid="caret"]'));
                    //menuButtonが存在する場合に処理
                    if (menuButton != null) {
                        //menuButtonをクリックする
                        menuButton.click();
                        //報告ボタンをクリックする Mutation Observerでrole="group"内を監視し、報告ボタンが出現したらクリックする
                        const reportObserver = new MutationObserver(function (mutationsList, observer) {
                            for (const mutation of mutationsList) {
                                if (mutation.type === 'childList') {
                                    // role="group"要素が追加された場合に実行する処理
                                    const reportGroup = document.querySelectorAll('[role="group"]');
                                    // ここで新しいtweet要素に対する処理を行います
                                    reportGroup.forEach(group => {
                                        //groupにあるdata-testid="block"の直下のdivを取得
                                        let reportButton = group.querySelector('[data-testid="block"]');
                                        //reportButtonが存在する場合に押す
                                        if (reportButton != null) {
                                            reportButton.click();
                                            //data-testid="confirmationSheetConfirm"クリックする
                                            let confirmButton = document.querySelector('[data-testid="confirmationSheetConfirm"]');
                                            confirmButton.click();
                                                
                                            

                                        }
                                    });
                                }
                            }
                        });
                        // 監視を開始する
                        reportObserver.observe(targetNode, config);

                        

                        /*
                        reportButton = (tweet.querySelector('[data-testid="report"]'));
                        //reportButtonが存在する場合に押す
                        if (reportButton != null) {
                            reportButton.click();
                        }
                        */
                    }
                }
            }


      });
    }
  }
};

// Mutation Observerの作成
const tweetObserver = new MutationObserver(tweetObserverCallback);

// 監視を開始する
tweetObserver.observe(targetNode, config);
