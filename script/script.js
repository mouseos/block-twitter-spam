//言語処理時に共通言語があるかどうかを判定する関数
function haveCommonValues(dict1, dict2) {
    // 辞書から値の配列を取得
    const values1 = Object.values(dict1);
    const values2 = Object.values(dict2);
    
    // 共通値を格納するためのセットを作成
    const commonValues = new Set();
    
    // 辞書1の値をセットに追加
    values1.forEach(value => {
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

//スパムによくある文言を確認する関数
function check_spam_word(text) {
	//スパムによくある文言を入れる配列
	let spam_words = ["お前のプロフ抜けるわ", 'よかったらプロフ見て'];
	//スパムによくある文言が含まれているか確認
	let isSpam = false;
	spam_words.forEach(spam_word => {
		if (text.includes(spam_word)) {
			isSpam = true;
		}
	});
	return isSpam;
}


function calc_spam_score(tweet_data) {
	//tweet_dataの例
	/*
    {
    "lang": "ja",
    "ariaLabelledby": "id__z46i4w6tmvs id__a1rdb67xket id__0xlad3oysjs id__cs8tmlew9o id__a95mattlpor id__abzezc8k98 id__h0fs7z4mqwp id__qab83krya1r id__72bg0ewzfjd id__0bb3h6ghsqbo id__v8dftwo78r id__6eosoon75ic id__147wubxzoj3 id__ih8kimy90k id__ofqsktnynbn id__abxgt7ktwqq id__4gyjom0ly1z id__wnua460vu47 id__bp4igofpjus",
    "quotedUserName": "ゆう🖱🐭💕🐰💻 ROM焼き 修理代行受付中",
    "quotedScreenName": "mouse_soft_y",
    "quotedExpandedUrl": "https://www.amazon.jp/hz/wishlist/ls/1AYDYDDWH3NZG?ref_=wl_share",
    "quotedText": "内部API利用でスパム検出精度が上がった https://t.co/TaHYgNQgu1",
    "quotedUserDescription": "サブ垢:@mouse_soft_y_en\n改造とソフトウェア開発。rom焼き、改造、修理、ウイルス除去代行受付中です。相談は無料。希望者はDMへ（依頼が多く返信遅れます）\nソフト販売中。天安門事件（スパム避け）\n\nSapporo City FM、SmileTabLabo wiki運営",
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
	//フォローしているか確認
	let isFollowing = tweet_data["isFollowing"];
	//spam_scoreを計算する
	let spam_score = 0;
	//htmlとしてスパムの理由を入れる変数
	let spam_reason = "";
	
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
	/*
	//本文
	if (tweet_data["lang"] != "ja") {
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
	*/
	//}
	//スパムによくある文言が含まれている場合
	if (check_spam_word(tweet_data["quotedText"])) {
		console.log("スパムによくある文言が含まれています");
		spam_reason+="<p>スパムによくある文言が含まれています</p>";
		spam_score += 50;
	}
	//絵文字の割合が0.5以上の場合
	if (emoji_ratio >= 0.5) {
		console.log("絵文字の割合が0.5以上");
		spam_reason+="<p>絵文字の割合が0.5以上</p>";
		spam_score += 10;
	}
	//プロフィールとツイート本文の言語が異なるかを確認。異なる場合はスコアを10加算する
	let lang_tweet = detect_lang(tweet_data["quotedText"]);
	let lang_profile = detect_lang(tweet_data["quotedUserDescription"]);
	console.log("lang");
	console.log(lang_tweet);
	console.log("lang_profile");
	console.log(lang_profile);
	
	//プロフィールとツイート本文の言語が異なる場合primaryとsecondaryの順序は問わないので一致するか確認。
	if (!haveCommonValues(lang_tweet, lang_profile)) {
		console.log("ツイート言語とプロフィール言語が異なるためスコアを20加算します");
		spam_reason+="<p>ツイート言語とプロフィール言語が異なる</p>";
		spam_score += 20;
	}

	//アラビア語が含まれている場合
	if (arabic_ratio > 0) {
		console.log("アラビア語が含まれているためスコアを20加算します");
		spam_reason+="<p>アラビア語が含まれている</p>";
		spam_score += 20;
	}
	//blue verifiedの場合
	if (tweet_data["isBlueVerified"]) {
		console.log("blue verifiedのためスコアを20加算します");
		spam_reason+="<p>blue verified</p>";
		spam_score += 20;
	}

	//リプに同じ人が2個以上tweet_dataにある場合
	let quotedScreenName_count = 0;
	//現在のurlを取得し/status/という文字が含まれる場合
	if (window.location.href.includes("/status/")) {
		//tweet_datas[0]のツイート言語とtweet_dataのツイート言語が一致しない場合のみ
		if(tweet_datas[0]["lang"] != tweet_data["lang"]){
			console.log("元ツイとツイート言語が異なるためスコアを30加算します");
			spam_reason+="<p>元ツイとツイート言語が異なる</p>";
			//スコアを30加算する
			spam_score += 30;
		}

		//tweet_datas[0]のユーザー名と一致しない場合のみ
		console.log("url:" + window.location.href);
		//tweet_datas[0]["quotedScreenName"] != tweet_data["quotedScreenName"]
		console.log("tweet_datas[0][\"quotedScreenName\"]:" + tweet_datas[0]["quotedScreenName"]);
		console.log("tweet_data[\"quotedScreenName\"]:" + tweet_data["quotedScreenName"]);
		if(tweet_datas[0]["quotedScreenName"] != tweet_data["quotedScreenName"]){
			tweet_datas.forEach(tweet_data2 => {
				if (tweet_data2["quotedScreenName"] == tweet_data["quotedScreenName"]) {
					quotedScreenName_count++;
				}
			});
			if (quotedScreenName_count >= 2) {
				console.log("リプに同じ人が2個以上いるためスコアを30加算します");
				spam_reason+="<p>リプに同じ人が2個以上いる</p>";
				spam_score += 30;
			}
		}

	}
	return {'score': spam_score, 'reason': spam_reason };
}
//ツイートとユーザー情報を保存する配列
let tweet_datas = [];
let url = window.location.href;
function main() {
	function save_props() {
		//urlが変わった場合
		if (url != window.location.href) {
			//tweet_datasを初期化
			tweet_datas = [];
			//urlを更新
			url = window.location.href;
		}
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
				//console.log(element1[reactPropsName1]);
				const reactProps1 = element1[reactPropsName1];
				const reactProps2 = element2[reactPropsName2];
				const ariaLabelledby = reactProps2["aria-labelledby"];
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
			let spam_result = calc_spam_score(tweet_data);
			let score = spam_result["score"];
			let reason = spam_result["reason"];
			console.log("tweet_data");
			console.log(tweet_data);
			console.log("score");
			console.log(score);
			//aria-labelledbyでqueryselectorして背景色を110000にする
			let tweet_elem = document.querySelector("article[aria-labelledby='" + tweet_data["ariaLabelledby"] + "']");

			//scoreが50以上の場合
			if (score >= 50) {
				//通報
				console.log("通報");
				
				tweet_elem.style.backgroundColor = "#ff0000";
				

			}
			//理由を表示
			let reason_elem = document.createElement("div");
			reason_elem.innerHTML = reason;
			//要素の外側（下）に追加
			tweet_elem.after(reason_elem);
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