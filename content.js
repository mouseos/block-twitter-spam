let tweets = [];
let tmp_tweets;//一時的な連想配列
let menuButton;//メニューボタン
let reportButton;//報告ボタン


let currentUrl = window.location.href;
//１文字でもアラビア語があるかどうかを判定する関数
function containsArabic(text) {
  // アラビア語の正規表現
  var arabicRegex = /[\u0600-\u06FF]/;

  // テキスト内でアラビア語が見つかったかどうかを返す
  return arabicRegex.test(text);
}


//絵文字のみで構成されているかどうかを判定する関数
function isEmojiOnly(text) {
  // スペースと改行を除去する
  const cleanedText = text.replace(/[\s\n]/g, '');
  
  // 絵文字の正規表現パターン
  const emojiPattern = /[\uD83C-\uDBFF\uDC00-\uDFFF\uD800-\uDBFF][\uDC00-\uDFFF\uD83C-\uDBFF]*/g;
  
  // テキストが絵文字のみで構成されているかを判定する
  return cleanedText.match(emojiPattern) !== null && cleanedText.length === cleanedText.match(emojiPattern).join('').length;
}


//textにwords配列の文字が何個含まれているかどうかを数値で返す関数
function countWords(text,words) { 
    let count = 0;
    for (let i = 0; i < words.length; i++) {
        if (text.includes(words[i])) {
            count++;
        }
    }
    return count;
}

//同一の絵文字がN個以上連続しているかどうかを判定する関数
function countMaxConsecutiveEmojis(inputText) {
    const emojiRegex = /([\uD800-\uDBFF][\uDC00-\uDFFF])/g; // 正規表現で絵文字をマッチングする
    let maxCount = 0;
    let currentCount = 1;
    let prevEmoji = '';

    // 文字列から絵文字を抽出し、連続する絵文字をカウントする
    inputText.match(emojiRegex)?.forEach(emoji => {
        if (emoji === prevEmoji) {
            currentCount++;
            if (currentCount > maxCount) {
                maxCount = currentCount;
            }
        } else {
            currentCount = 1;
            prevEmoji = emoji;
        }
    });

    return maxCount;
}

//レーベンシュタイン距離を計算する関数
function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;

  // 初期化
  const matrix = [];
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // 行列を埋める
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      let cost = 0;
      if (str1.charAt(i - 1) !== str2.charAt(j - 1)) {
        cost = 1;
      }
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  // 最終的なレーベンシュタイン距離を返す
  return matrix[len1][len2];
}
function checkIfExists(tmp_tweets) {
  // tmp_tweetsオブジェクトと一致する要素があるかをチェック
  const exists = tweets.some(tweet => {
    return (
      tweet.userName === tmp_tweets.userName &&
      tweet.userUrl === tmp_tweets.userUrl &&
      tweet.userId === tmp_tweets.userId &&
      tweet.isVerified === tmp_tweets.isVerified &&
      tweet.tweetText === tmp_tweets.tweetText
    );
  });

  return exists;
}
//様々な要素を重みづけしてスパム判定する関数　０から１００の値を返す
function isSpam(info,allInfo) {
  let spamScore = 0;
  //投稿にアラビア語が含まれている場合
  if (containsArabic(info.tweetText)) {
    spamScore += 50;
  }
  //名前にアラビア語が含まれている場合
  if (containsArabic(info.userName)) {
    spamScore += 50;
  }

  // 投稿が絵文字のみで構成されている場合10加算 ただし認証済みかつ１文字のみの場合は50加算
  console.log("絵文字のみ" + isEmojiOnly(info.tweetText));
  if (isEmojiOnly(info.tweetText)) {
    if (info.isVerified && info.tweetText.length === 1) {
      spamScore += 50;
    } else {
      spamScore += 10;
    }
  }

  // アラブ諸国の国旗の絵文字がユーザー名に含まれている場合　countWords関数で数える
  const arabicFlags = ['🇸🇦', '🇦🇪', '🇶🇦', '🇴🇲', '🇰🇼', '🇧🇭', '🇱🇧', '🇪🇬', '🇯🇴', '🇮🇶', '🇵🇸', '🇾🇪', '🇸🇩', '🇸🇾', '🇱🇾', '🇲🇦', '🇹🇳', '🇩🇿'];
  spamScore += countWords(info.userName, arabicFlags) * 30;

  //アラブ系に多い名前（英語表記）が含まれている場合　countWords関数で数える
  const arabicNames = ['Abdul', 'Abdullah', 'Ahmed', 'Ali', 'Amin', 'Amir', 'Ayaan', 'Faisal', 'Faris', 'Farouk', 'Fawaz', 'Fayez', 'Fouad', 'Hadi', 'Hakim', 'Hamid', 'Hassan', 'Hussein', 'Ibrahim', 'Imran', 'Ismail', 'Jabir', 'Jafar', 'Jalil', 'Jamal', 'Jamil', 'Jawad', 'Jihad', 'Kareem', 'Khalid', 'Mahmoud', 'Malik', 'Mansour', 'Marwan', 'Mazen', 'Mohamed', 'Mohammed', 'Musa', 'Mustafa', 'Nabil', 'Nadir', 'Najib', 'Nasir', 'Nasser', 'Nawaf', 'Omar', 'Osama', 'Qasim', 'Rafiq', 'Rahim', 'Rashid', 'Rauf', 'Riyad', 'Rizwan', 'Sadiq', 'Saeed', 'Said', 'Salah', 'Salim', 'Samir', 'Sami', 'Sami', 'Saud', 'Sharif', 'Tahir', 'Talal', 'Tariq', 'Tawfiq', 'Usama', 'Waleed', 'Waseem', 'Yahya', 'Yasser', 'Youssef', 'Yusuf', 'Zaid', 'Zakaria', 'Zaki', 'Ziad', 'Babar', 'Badshah', 'Abdallah', 'Abdelrahman', 'Habib', 'Kamal', 'Karim', 'Nasr', 'Rashad', 'Saad', 'Sultan', 'Tarek', 'Wael', 'Zuhair','Ogidigidi'];
  spamScore += countWords(info.userName, arabicNames) * 50;

  //絵文字が3個以上連続している場合*10して加算他の場合は加算しない
  let emojis = countMaxConsecutiveEmojis(info.tweetText);
  console.log("絵文字個数" + emojis);
  if (true) {
      spamScore += emojis * 10;
  }

  //認証済みアカウントの場合
  if (info.isVerified) {
    spamScore += 40;
  }
  //最上部ユーザー検出
  if (allInfo[0].userId != info.userId) { 
    //allInfoにinfoと同じuserIdが何個あるかを数える
    let count = 0;
    for (let i = 0; i < allInfo.length; i++) {
      if (allInfo[i].userId == info.userId) {
        count++;
      }
    }
    //同じuserIdが2個以上ある場合
    if (count >= 2) {
      spamScore += 10;
    }
  }



  return spamScore;
  
}
function extractTweetText(htmlString) {
  // 与えられたHTML文字列を一時的にDOM要素に変換するための仮の要素を作成します
  let tempElement = document.createElement('div');
  tempElement.innerHTML = htmlString;

  // 結果を保持するためのテキスト変数
  let resultText = '';

  // すべての子要素を順番に処理します
  Array.from(tempElement.childNodes).forEach((child) => {
    // テキストノードの場合、その内容を結果に追加します
    if (child.nodeName === 'IMG') {
      // alt属性があればそのテキストを結果に追加します
      if (child.alt) {
        resultText += child.alt;
      }
    } else{ // imgタグの場合
      resultText += child.textContent;
    }
  });

  // 最終的な結果を返します
  return resultText;
}

// Mutation Observerの設定
const targetNode = document.body; // 監視対象の要素
const config = { childList: true, subtree: true };

// 新しいtweet要素が追加された時に行う処理
const tweetObserverCallback = function(mutationsList, observer) {
  for(const mutation of mutationsList) {
    if (mutation.type === 'childList') {
      if (currentUrl != window.location.href) { 
        tweets = [];
        currentUrl = window.location.href;
      }
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
        //認証済みかどうかを判定する　data-testid="icon-verified"があればtrue
        let isVerified = tweet.querySelector('[data-testid="icon-verified"]') != null;
          //console.log(userId);
          
            //文章を取得　data-testid="tweetText"
          let tweetText = tweet.querySelector('[data-testid="tweetText"]');
          //teweetTextをtextContentで取得try catchでエラー回避
            try {
                tweetText = extractTweetText(tweetText.innerHTML);
            } catch (e) {
                tweetText = ' ';
            }
          //console.log(tweetText.textContent);
          
          //これらをtweetsに連想配列として重複なくpush
          tmp_tweets={ userName: userName.textContent, userUrl: userUrl, userId: userId ,isVerified: isVerified,tweetText: tweetText};
        //スパム判定
        console.log(userName.textContent);
        console.log(tweetText);
        //認証済みか表示
        console.log(isVerified);
        //tmp_tweetsが既にtweetsに存在しない場合にpush 確認は全項目で行う
          
        if (checkIfExists(tmp_tweets) === false) {
          tweets.push(tmp_tweets);
          console.log(tweets);
        }

        console.log(isSpam(tmp_tweets, tweets));
        
        if (isSpam(tmp_tweets,tweets) >= 50) {
          
            
          //tmp_tweetsが既にtweetsに存在しない場合にpush 確認は全項目で行う
          
               /* if (checkIfExists(tmp_tweets) === false) {
                    tweets.push(tmp_tweets);
                    console.log(tweets);
                    /*menuButton = (tweet.querySelector('[data-testid="caret"]'));
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
                        }*//*
                        
                    }
                }*/
          
          //tweetのbackground-colorを変更する
          tweet.style.backgroundColor = '#550000';
            }


      });
    }
  }
};

// Mutation Observerの作成
const tweetObserver = new MutationObserver(tweetObserverCallback);

// 監視を開始する
tweetObserver.observe(targetNode, config);
