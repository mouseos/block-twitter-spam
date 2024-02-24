/**
 * @typedef {Object} TweetData - ツイートのデータ
 * @property {string} lang - ツイートの言語を示す言語コード
 * @property {string} ariaLabelledby
 * @property {string} quotedUserName - ツイートしたユーザーの名前
 * @property {string} quotedScreenName - ツイートしたユーザーの表示名（ID）
 * @property {string} quotedExpandedUrl - リンクカードに展開するURL
 * @property {string} quotedText - ツイート本文
 * @property {string} quotedUserDescription - ツイートしたユーザーのプロフィール
 * @property {boolean} isTranslator
 * @property {string} translatorType
 * @property {boolean} isVerified - 認証済みかどうか
 * @property {boolean} isBlueVerified - Twitter Blueで認証されているかどうか
 * @property {number} favoritesCount - ツイートしたユーザーのいいね数
 * @property {number} followersCount - ツイートしたユーザーのフォロワー数
 * @property {any?} isFollowing - ツイートしたユーザーをフォローしているかどうか
 * @property {number} friendsCount - ツイートしたユーザーがフォローしているアカウントの数
 * @property {number} statusesCount - ツイートしたユーザーの総ツイート数
 * @property {boolean} processed - 処理済みかどうか
 *
 * @typedef {Object} SpamInfo - スパムの情報
 * @property {number} score - スパムスコア
 * @property {string} reason - 判定の理由
 */

/**
 * 2つの辞書が共通の値を持っているかどうかを確認する。
 *
 * @param {Object<any, any>} dict1 - 辞書1
 * @param {Object<any, any>} dict2 - 辞書2
 * @return {boolean} 2つの辞書が共通の値を持っている場合はtrue、そうでない場合はfalse
 */
function haveCommonValues(dict1, dict2) {
  // 辞書から値の配列を取得
  const values1 = Object.values(dict1);
  const values2 = Object.values(dict2);

  /**
     * 共通値を格納するためのセット。
     * @type {Set<any>}
     */
  const commonValues = new Set();

  // 辞書1の値をセットに追加
  values1.forEach((value) => {
    if (value !== 'unknown') {
      commonValues.add(value);
    }
  });

  // 辞書2の値と比較して共通値があるかをチェック
  for (const value of values2) {
    if (value !== 'unknown' && commonValues.has(value)) {
      return true;
    }
  }

  return false;
}

/**
 * テキストに占める日本語の割合を求める。
 *
 * @param {string} text - 判定するテキスト
 * @return {number} 日本語の割合
 */
function calcJapaneseRatio(text) {
  // 日本語の文字数を求める
  let japaneseCount = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i].match(/[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF65-\uFF9F]/)) {
      japaneseCount++;
    }
  }
  // 日本語の文字数をテキストの文字数で割る
  const japaneseRatio = japaneseCount / text.length;
  return japaneseRatio;
}

/**
 * テキストに占めるアラビア語の割合を求める。
 *
 * @param {string} text - 判定するテキスト
 * @return {number} アラビア語の割合
 */
function calcArabicRatio(text) {
  // アラビア語の文字数を求める
  let arabicCount = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i].match(/[\u0600-\u06FF]/)) {
      arabicCount++;
    }
  }
  // アラビア語の文字数をテキストの文字数で割る
  const arabicRatio = arabicCount / text.length;
  return arabicRatio;
}

/**
 * テキストの絵文字の個数を求める。
 *
 * @param {string} text - 判定するテキスト
 * @return {number} 絵文字の個数
 */
function calcEmojiCount(text) {
  // 絵文字の個数を求める
  let emojiCount = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i].match(/\p{Emoji}/u)) {
      emojiCount++;
    }
  }
  return emojiCount;
}

/**
 * テキストに占める絵文字の割合を求める。
 *
 * @param {string} text - 判定するテキスト
 * @return {number} 絵文字の割合
 */
function calcEmojiRatio(text) {
  // 絵文字の個数を求める
  const emojiCount = calcEmojiCount(text);
  // 絵文字の個数をテキストの文字数で割る
  const emojiRatio = emojiCount / text.length;
  return emojiRatio;
}

/**
 * スパムによくある文言が含まれているか確認する。
 *
 * @param {string} text - 判定するテキスト
 * @return {boolean} スパムによくある文言が含まれていた場合はtrue, そうでない場合はfalse
 */
function checkSpamWord(text) {
  /**
   * スパムによくある文言を入れる配列。
   * @type {Array<string>}
   */
  const spamWords = ['お前のプロフ抜けるわ', 'よかったらプロフ見て'];
  // スパムによくある文言が含まれているか確認
  let isSpam = false;
  spamWords.forEach((spamWord) => {
    if (text.includes(spamWord)) {
      isSpam = true;
    }
  });
  return isSpam;
}

/**
 * ツイートがスパムかどうか判定する。
 *
 * @param {TweetData} tweetData - ツイートのデータ
 * @return {SpamInfo} スパム判定の結果
 */
function calcSpamScore(tweetData) {
  // tweetDataの例
  /*
    {
    "lang": "ja",
    "ariaLabelledby": "id__z46i4w6tmvs id__a1rdb67xket id__0xlad3oysjs id__cs8tmlew9o "
        + "id__a95mattlpor id__abzezc8k98 id__h0fs7z4mqwp id__qab83krya1r id__72bg0ewzfjd "
        + "id__0bb3h6ghsqbo id__v8dftwo78r id__6eosoon75ic id__147wubxzoj3 id__ih8kimy90k "
        + "id__ofqsktnynbn id__abxgt7ktwqq id__4gyjom0ly1z id__wnua460vu47 id__bp4igofpjus",
    "quotedUserName": "ゆう🖱🐭💕🐰💻 ROM焼き 修理代行受付中",
    "quotedScreenName": "mouse_soft_y",
    "quotedExpandedUrl": "https://www.amazon.jp/hz/wishlist/ls/1AYDYDDWH3NZG?ref_=wl_share",
    "quotedText": "内部API利用でスパム検出精度が上がった https://t.co/TaHYgNQgu1",
    "quotedUserDescription": "サブ垢:@mouse_soft_y_en\n"
        + "改造とソフトウェア開発。rom焼き、改造、修理、ウイルス除去代行受付中です。相談は無料。希望者はDMへ（依頼が多く返信遅れます）\n"
        + "ソフト販売中。天安門事件（スパム避け）\n\nSapporo City FM、SmileTabLabo wiki運営",
    "isTranslator": false,
    "translatorType": "none",
    "isVerified": false,
    "isBlueVerified": false,
    "favoritesCount": 286243,
    "followersCount": 2335,
    "isFollowing": null,
    "friendsCount": 1177,
    "statusesCount": 74056,
    "processed": true
}
    */
  // フォローしているか確認
  const isFollowing = tweetData['isFollowing'];
  // spamScoreを計算する
  let spamScore = 0;
  // htmlとしてスパムの理由を入れる変数
  let spamReason = '';

  // if (isFollowing) {

  // ツイート本文のアラビア語の割合を求める
  const arabicRatio = calcArabicRatio(tweetData['quotedText']);
  // ツイート本文の絵文字の割合を求める
  const emojiRatio = calcEmojiRatio(tweetData['quotedText']);
  // プロフィール文のアラビア語の割合を求める
  const arabicRatioProfile = calcArabicRatio(tweetData['quotedUserDescription']);
  // プロフィール文の文字数を求める
  const profileLength = tweetData['quotedUserDescription'].length;
  // ユーザー名のアラビア語の割合を求める
  const arabicRatioName = calcArabicRatio(tweetData['quotedUserName']);
  // スコアを計算する
  // スパムが多い国の言語(jaかen以外)の場合
  /*
  //本文
  if (tweetData["lang"] != "ja") {
    //スコアを30加算する
    spamScore += 30;
    //中東系ならスコアをさらに10加算する
    let middleEastern = ["ar", "fa", "ur", "ps", "sd", "ku", "ckb", "ha", "yi", "he"];
    if (middleEastern.includes(tweetData["lang"])) {
      spamScore += 10;
    }
    //英語ならスコアを20減算する
    if (tweetData["lang"] == "en") {
      spamScore -= 20;
    }
  }
  //プロフィールに日本語が含まれていない場合
  if (calcJapaneseRatio(tweetData["quotedUserDescription"]) <= 0.1) {
    //スコアを30加算する
    spamScore += 10;
  }
  //プロフィールのアラビア語の割合が0.1以上の場合

  if (arabicRatioProfile >= 0.1) {
    //スコアを30加算する
    spamScore += 30;
  }

  //文字数が10以下で絵文字の割合が0.5以上の場合
  if (tweetData["quotedText"].length <= 10 && emojiRatio >= 0.5) {
    //スコアを30加算する
    spamScore += 30;
  }

  //プロフィールが空の場合
  if (tweetData["quotedUserDescription"] == null) {
    //スコアを30加算する
    spamScore += 30;
  }

  //blue verifiedの場合
  if (tweetData["isBlueVerified"]) {
    //スコアを30加算する
    spamScore += 40;
  }

  //quotedScreenNameが2個以上tweetDataにある場合
  let quotedScreenNameCount = 0;
  tweetDatas.forEach(tweetData2 => {
    if (tweetData2["quotedScreenName"] == tweetData["quotedScreenName"]) {
      quotedScreenNameCount++;
    }
  });
  if (quotedScreenNameCount >= 2) {
    //スコアを30加算する
    spamScore += 30;
  }
  */
  // }
  // スパムによくある文言が含まれている場合
  if (checkSpamWord(tweetData['quotedText'])) {
    console.log('スパムによくある文言が含まれています');
    spamReason+='<p>スパムによくある文言が含まれています</p>';
    spamScore += 50;
  }
  // 絵文字の割合が0.5以上の場合
  if (emojiRatio >= 0.5) {
    console.log('絵文字の割合が0.5以上');
    spamReason+='<p>絵文字の割合が0.5以上</p>';
    spamScore += 10;
  }
  // プロフィールとツイート本文の言語が異なるかを確認。異なる場合はスコアを10加算する
  const langTweet = detect_lang(tweetData['quotedText']);
  const langProfile = detect_lang(tweetData['quotedUserDescription']);
  console.log('lang');
  console.log(langTweet);
  console.log('langProfile');
  console.log(langProfile);

  // プロフィールとツイート本文の言語が異なる場合primaryとsecondaryの順序は問わないので一致するか確認。
  if (!haveCommonValues(langTweet, langProfile)) {
    console.log('ツイート言語とプロフィール言語が異なるためスコアを20加算します');
    spamReason+='<p>ツイート言語とプロフィール言語が異なる</p>';
    spamScore += 20;
  }

  // アラビア語が含まれている場合
  if (arabicRatio > 0) {
    console.log('アラビア語が含まれているためスコアを20加算します');
    spamReason+='<p>アラビア語が含まれている</p>';
    spamScore += 20;
  }
  // blue verifiedの場合
  if (tweetData['isBlueVerified']) {
    console.log('blue verifiedのためスコアを20加算します');
    spamReason+='<p>blue verified</p>';
    spamScore += 20;
  }

  // リプに同じ人が2個以上tweetDataにある場合
  let quotedScreenNameCount = 0;
  // 現在のurlを取得し/status/という文字が含まれる場合
  if (window.location.href.includes('/status/')) {
    // tweetDatas[0]のツイート言語とtweetDataのツイート言語が一致しない場合のみ
    if (tweetDatas[0]['lang'] != tweetData['lang']) {
      console.log('元ツイとツイート言語が異なるためスコアを30加算します');
      spamReason+='<p>元ツイとツイート言語が異なる</p>';
      // スコアを30加算する
      spamScore += 30;
    }

    // tweetDatas[0]のユーザー名と一致しない場合のみ
    console.log('url:' + window.location.href);
    // tweetDatas[0]["quotedScreenName"] != tweetData["quotedScreenName"]
    console.log('tweetDatas[0]["quotedScreenName"]:' + tweetDatas[0]['quotedScreenName']);
    console.log('tweetData["quotedScreenName"]:' + tweetData['quotedScreenName']);
    if (tweetDatas[0]['quotedScreenName'] != tweetData['quotedScreenName']) {
      tweetDatas.forEach((tweetData2) => {
        if (tweetData2['quotedScreenName'] == tweetData['quotedScreenName']) {
          quotedScreenNameCount++;
        }
      });
      if (quotedScreenNameCount >= 2) {
        console.log('リプに同じ人が2個以上いるためスコアを30加算します');
        spamReason+='<p>リプに同じ人が2個以上いる</p>';
        spamScore += 30;
      }
    }
  }
  return {'score': spamScore, 'reason': spamReason};
}

/**
 * ツイートとユーザー情報を保存する配列。
 * @type {Array<TweetData>}
 */
let tweetDatas = [];
let url = window.location.href;

/**
 * ツイートの解析を行う。
 */
function main() {
  /**
   * ツイートを解析し保存する。
   */
  function saveProps() {
    // urlが変わった場合
    if (url != window.location.href) {
      // tweetDatasを初期化
      tweetDatas = [];
      // urlを更新
      url = window.location.href;
    }
    // data-testidがcellInnerDivである要素を取得する
    const elements = document.querySelectorAll('article');
    // 要素ごとにループ
    elements.forEach((article) => {
      const tmpData = {};
      element1 = article.querySelector('div[role=\'group\'][id]');
      element2 = article;
      // __reactProps$で始まるプロパティを探す
      const reactPropsName1 = Object
          .getOwnPropertyNames(element1)
          .find((n) => n.startsWith('__reactProps$'));
      const reactPropsName2 = Object
          .getOwnPropertyNames(element2)
          .find((n) => n.startsWith('__reactProps$'));

      // 該当するプロパティがあれば出力
      if (reactPropsName1) {
        // console.log(element1[reactPropsName1]);
        const reactProps1 = element1[reactPropsName1];
        const reactProps2 = element2[reactPropsName2];
        const ariaLabelledby = reactProps2['aria-labelledby'];
        // eslint-disable-next-line max-len
        const quotedStatus = reactProps1.children[1].props.retweetWithCommentLink.state.quotedStatus;
        const user = quotedStatus.user || {};
        const lang = quotedStatus.lang || null;
        const quotedUserName = user.name ?? null;
        const quotedScreenName = user.screen_name ?? null;
        const quotedExpandedUrl = (user.entities?.url?.urls[0]?.expanded_url) ?? null;
        const quotedText = quotedStatus.text ?? null;
        const quotedUserDescription = user.description ?? null;
        const isTranslator = user.is_translator ?? null;
        const translatorType = user.translator_type ?? null;
        const isVerified = user.verified ?? null;
        const isBlueVerified = user.is_blue_verified ?? null;
        const favoritesCount = user.favourites_count ?? null;
        const followersCount = user.followers_count ?? null;
        const isFollowing = user.following ?? null;
        const friendsCount = user.friends_count ?? null;
        const statusesCount = user.statuses_count ?? null;


        /*
        //すべての変数を表示
        console.log("ariaLabelledby");
        console.log(ariaLabelledby);
        console.log("lang");
        console.log(lang);
        console.log("quotedUserName");
        console.log(quotedUserName);
        console.log("quotedScreenName");
        console.log(quotedScreenName);
        console.log("quotedExpandedUrl");
        console.log(quotedExpandedUrl);
        console.log("quotedText");
        console.log(quotedText);
        console.log("quotedUserDescription");
        console.log(quotedUserDescription);
        console.log("isTranslator");
        console.log(isTranslator);
        console.log("translatorType");
        console.log(translatorType);
        console.log("isVerified");
        console.log(isVerified);
        console.log("isBlueVerified");
        console.log(isBlueVerified);
        console.log("favoritesCount");
        console.log(favoritesCount);
        console.log("followersCount");
        console.log(followersCount);
        console.log("isFollowing");
        console.log(isFollowing);
        console.log("friendsCount");
        console.log(friendsCount);
        console.log("statusesCount");
        console.log(statusesCount);
        */
        // tmpDataを作成
        tmpData['lang'] = lang;
        tmpData['ariaLabelledby'] = ariaLabelledby;
        tmpData['quotedUserName'] = quotedUserName;
        tmpData['quotedScreenName'] = quotedScreenName;
        tmpData['quotedExpandedUrl'] = quotedExpandedUrl;
        tmpData['quotedText'] = quotedText;
        tmpData['quotedUserDescription'] = quotedUserDescription;
        tmpData['isTranslator'] = isTranslator;
        tmpData['translatorType'] = translatorType;
        tmpData['isVerified'] = isVerified;
        tmpData['isBlueVerified'] = isBlueVerified;
        tmpData['favoritesCount'] = favoritesCount;
        tmpData['followersCount'] = followersCount;
        tmpData['isFollowing'] = isFollowing;
        tmpData['friendsCount'] = friendsCount;
        tmpData['statusesCount'] = statusesCount;
        // 通報やブロックは行ったかどうか
        tmpData['processed'] = false;

        // tweetDatasにtmpDataを追加(既にある場合は追加しない)
        let isExist = false;
        tweetDatas.forEach((tweetData) => {
          if (tweetData['quotedText'] == tmpData['quotedText']) {
            isExist = true;
          }
        });
        if (!isExist) {
          tweetDatas.push(tmpData);
        }
      }
    });
  }

  // saveProps()を実行
  saveProps();
  // tweetDatasを処理
  tweetDatas.forEach((tweetData) => {
    // tweetDataが処理済みでない場合
    if (!tweetData['processed']) {
      // スパム確認
      const spamResult = calcSpamScore(tweetData);
      const score = spamResult['score'];
      const reason = spamResult['reason'];
      console.log('tweetData');
      console.log(tweetData);
      console.log('score');
      console.log(score);
      // aria-labelledbyでqueryselectorして背景色を110000にする
      const tweetElem = document.querySelector(
          'article[aria-labelledby=\'' + tweetData['ariaLabelledby'] + '\']',
      );

      // scoreが50以上の場合
      if (score >= 50) {
        // 通報
        console.log('通報');

        tweetElem.style.backgroundColor = '#ff0000';
      }
      // 理由を表示
      const reasonElem = document.createElement('div');
      reasonElem.innerHTML = reason;
      // 要素の外側（下）に追加
      tweetElem.after(reasonElem);
      // tweetDataを処理済みにする
      tweetData['processed'] = true;
    }
  });
}

// data-testid="primaryColumn"に変更があった場合にsaveProps()を実行。console.logでtweetDatasを確認
const observer = new MutationObserver(main);
observer.observe(document.querySelector('body'), {
  childList: true,
  subtree: true,
});
