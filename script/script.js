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
    console.log(tweet_datas);
}

//data-testid="primaryColumn"に変更があった場合にsave_props()を実行。console.logでtweet_datasを確認
const observer = new MutationObserver(main);
observer.observe(document.querySelector('body'), {
    childList: true,
    subtree: true
});
