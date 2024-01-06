//テキストに占める日本語の割合を求める関数
function calc_japanese_ratio(text) {
    //日本語の文字数を求める
    let japanese_count = 0;
    for (let i = 0; i < text.length; i++) {
        if (text[i].match(/[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF65-\uFF9F]/)) {
            japanese_count++;
        }
    }
    //日本語の文字数をテキストの文字数で割る
    let japanese_ratio = japanese_count / text.length;
    return japanese_ratio;

}
//テキストに占めるアラビア語の割合を求める関数
function calc_arabic_ratio(text) {
    //アラビア語の文字数を求める
    let arabic_count = 0;
    for (let i = 0; i < text.length; i++) {
        if (text[i].match(/[\u0600-\u06FF]/)) {
            arabic_count++;
        }
    }
    //アラビア語の文字数をテキストの文字数で割る
    let arabic_ratio = arabic_count / text.length;
    return arabic_ratio;
}

//テキストの絵文字の個数を求める関数
function calc_emoji_count(text) {
    //絵文字の個数を求める
    let emoji_count = 0;
    for (let i = 0; i < text.length; i++) {
        if (text[i].match(/\p{Emoji}/u)) {
            emoji_count++;
        }
    }
    return emoji_count;
}
//テキストに占める絵文字の割合を求める関数
function calc_emoji_ratio(text) {
    //絵文字の個数を求める
    let emoji_count = calc_emoji_count(text);
    //絵文字の個数をテキストの文字数で割る
    let emoji_ratio = emoji_count / text.length;
    return emoji_ratio;
}


function calc_spam_score(tweet_data) {
    //フォローしているか確認
    let isFollowing = tweet_data["isFollowing"];
    //spam_scoreを計算する
        let spam_score = 0;
    //if (isFollowing) {
        
        //ツイート本文のアラビア語の割合を求める
        let arabic_ratio = calc_arabic_ratio(tweet_data["quotedText"]);
        //ツイート本文の絵文字の割合を求める
        let emoji_ratio = calc_emoji_ratio(tweet_data["quotedText"]);
        //プロフィール文のアラビア語の割合を求める
        let arabic_ratio_profile = calc_arabic_ratio(tweet_data["quotedUserDescription"]);
        //プロフィール文の文字数を求める
    let profile_length = tweet_data["quotedUserDescription"].length;
    //ユーザー名のアラビア語の割合を求める
    let arabic_ratio_name = calc_arabic_ratio(tweet_data["quotedUserName"]);
        //スコアを計算する
    //スパムが多い国の言語(jaかen以外)の場合

    //本文
        if (tweet_data["lang"] != "ja" ) {
            //スコアを30加算する
            spam_score += 30;
            //中東系ならスコアをさらに10加算する
            let middle_eastern = ["ar", "fa", "ur", "ps", "sd", "ku", "ckb", "ha", "yi", "he"];
            if (middle_eastern.includes(tweet_data["lang"])) {
                spam_score += 10;
            }
            //英語ならスコアを20減算する
            if (tweet_data["lang"] == "en") {
                spam_score -= 20;
            }
    }
    //プロフィールに日本語が含まれていない場合
    if (calc_japanese_ratio(tweet_data["quotedUserDescription"]) <= 0.1) {
        //スコアを30加算する
        spam_score += 10;
    }
    //プロフィールのアラビア語の割合が0.1以上の場合

    if (arabic_ratio_profile >= 0.1) {
        //スコアを30加算する
        spam_score += 30;
    }

        //文字数が10以下で絵文字の割合が0.5以上の場合
        if (tweet_data["quotedText"].length <= 10 && emoji_ratio >= 0.5) {
            //スコアを30加算する
            spam_score += 30;
        }

        //プロフィールが空の場合
        if (tweet_data["quotedUserDescription"] == null) {
            //スコアを30加算する
            spam_score += 30;
        }

        //blue verifiedの場合
        if (tweet_data["isBlueVerified"]) {
            //スコアを30加算する
            spam_score += 40;
        }
        
        //quotedScreenNameが2個以上tweet_dataにある場合
        let quotedScreenName_count = 0;
        tweet_datas.forEach(tweet_data2 => {
            if (tweet_data2["quotedScreenName"] == tweet_data["quotedScreenName"]) {
                quotedScreenName_count++;
            }
        });
        if (quotedScreenName_count >= 2) {
            //スコアを30加算する
            spam_score += 30;
        }

    //}

    return spam_score;
}
//ツイートとユーザー情報を保存する配列
let tweet_datas = [];
function main() {
    function save_props() {
        // data-testidがcellInnerDivである要素を取得する
        let elements = document.querySelectorAll('article');
        // 要素ごとにループ
        elements.forEach(article => {
            let tmp_data = {};
            element1 = article.querySelector("div[role='group'][id]");
            element2 = article;
            // __reactProps$で始まるプロパティを探す
            const reactPropsName1 = Object.getOwnPropertyNames(element1).find(n => n.startsWith("__reactProps$"));
            const reactPropsName2 = Object.getOwnPropertyNames(element2).find(n => n.startsWith("__reactProps$"));

            // 該当するプロパティがあれば出力
            if (reactPropsName1) {
                
                const reactProps1 = element1[reactPropsName1];
                const reactProps2 = element2[reactPropsName2];
                const ariaLabelledby =reactProps2["aria-labelledby"];
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
                //tmp_dataを作成
                tmp_data["lang"] = lang;
                tmp_data["ariaLabelledby"] = ariaLabelledby;
                tmp_data["quotedUserName"] = quotedUserName;
                tmp_data["quotedScreenName"] = quotedScreenName;
                tmp_data["quotedExpandedUrl"] = quotedExpandedUrl;
                tmp_data["quotedText"] = quotedText;
                tmp_data["quotedUserDescription"] = quotedUserDescription;
                tmp_data["isTranslator"] = isTranslator;
                tmp_data["translatorType"] = translatorType;
                tmp_data["isVerified"] = isVerified;
                tmp_data["isBlueVerified"] = isBlueVerified;
                tmp_data["favoritesCount"] = favoritesCount;
                tmp_data["followersCount"] = followersCount;
                tmp_data["isFollowing"] = isFollowing;
                tmp_data["friendsCount"] = friendsCount;
                tmp_data["statusesCount"] = statusesCount;
                //通報やブロックは行ったかどうか
                tmp_data["processed"] = false;

                //tweet_datasにtmp_dataを追加(既にある場合は追加しない)
                let isExist = false;
                tweet_datas.forEach(tweet_data => {
                    if (tweet_data["quotedText"] == tmp_data["quotedText"]) {
                        isExist = true;
                    }
                });
                if (!isExist) {
                    tweet_datas.push(tmp_data);
                }
            }

        });

    }

    //save_props()を実行
    save_props();
    //tweet_datasを処理
    tweet_datas.forEach(tweet_data => {
        //tweet_dataが処理済みでない場合
        if (!tweet_data["processed"]) {
            //スパム確認
            let score = calc_spam_score(tweet_data);
            
            console.log("tweet_data");
            console.log(tweet_data);
            console.log("score");
            console.log(score);
            //scoreが50以上の場合
            if (score >= 50) {
                //通報
                console.log("通報");
                //aria-labelledbyでqueryselectorして背景色を110000にする
                let tweet_elem = document.querySelector("article[aria-labelledby='" + tweet_data["ariaLabelledby"] + "']");
                console.log("tweet_elem");
                console.log(tweet_elem);
                tweet_elem.style.backgroundColor = "#ff0000";
            }
            //tweet_dataを処理済みにする
            tweet_data["processed"] = true;
        }
    });
}

//data-testid="primaryColumn"に変更があった場合にsave_props()を実行。console.logでtweet_datasを確認
const observer = new MutationObserver(main);
observer.observe(document.querySelector('body'), {
    childList: true,
    subtree: true
});
