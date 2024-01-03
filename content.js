//アラビア語が含まれているか判定する関数
function is_arabic(str) {
    let arabic = /[\u0600-\u06FF]/;
    return arabic.test(str);
}
//urlparameterを取得
function get_url_parameter(key) {
    let url = new URL(window.location.href);
    return url.searchParams.get(key);
}
function get_display_user_list() { 
    //ユーザーリスト保管
    let user_list = [];
    let user_infos=document.querySelectorAll('a[role="link"]');
    user_infos.forEach(function (user_info) {
        //>div>div>span取得
        let user_name = user_info.querySelector('div>div>span');
        if(user_name!=null){
            user_name = user_name.innerText;
            //数値しかない場合はスキップ
            if(!isNaN(user_name)){
                return;
            }
        }else{
            return;
        }
        //href取得
        let user_url = user_info.href;
        //ユーザー名とURLを表示
        //console.log(user_name + " : " + user_url);
        //ユーザーリストに追加(すでにuser_list存在する場合は無視)
        if (user_list.find(function (user) { return user.name == user_name; }) == undefined) { 
        user_list.push({name:user_name,url:user_url});
        }

        
    });
    return user_list;
}
//読み込み完了後に実行されるメイン処理
function main() {
    
    let is_spam = get_url_parameter("spam");
    //検索画面など通常操作の場合
    if (is_spam == null) {

        let users = (get_display_user_list());
        users.forEach(function (user) {
            //user.nameがアラビア語を含むか
            if (is_arabic(user.name)) {

                /*//user.urlを新しいタブで開く "?spam=true"
                if (user.url.indexOf("twitter.com") != -1) {
                    window.open(user.url + "?spam=true");
                }*/
                //新規iframeを作成　ランダムidを付与

                let iframe = document.createElement("iframe");
                iframe.id = "iframe_" + Math.random().toString(36).slice(-8);
                iframe.src = user.url;
                //width=100% height=100%で表示
                iframe.style.width = "100%";
                iframe.style.height = "100%";
                //bodyに追加
                document.body.appendChild(iframe);
                //iframeに'[data-testid="userActions"]'が表示されるまで待機　リトライ回数は１０回
                let retry_count = 0;
                let timer = setInterval(function () {
                    let user_actions = iframe.contentDocument.querySelector('[data-testid="userActions"]');
                    if (user_actions != null) {
                        //user_actionsが表示されたらクリック(メニュー)
                        user_actions.click();
                        //iframeの中の'[data-testid="block"]'の１つ下の要素をクリック（報告）
                        let block = iframe.contentDocument.querySelector('[data-testid="block"]');
                        block.nextElementSibling.click();
                        //「スパム」という文字列が含まれたlabelをクリック(１秒おきに取得しなおしクリック　最大試行回数は１０回)
                        /*let labels = iframe.contentDocument.querySelectorAll('label');
                        labels.forEach(function (label) {
                            console.log(label.innerText);
                            if (label.innerText.indexOf("スパム") != -1) {
                                label.click();
                            }
                        });*/
                        let retry_count = 0;
                        console.log("timer start");
                        let click_spam = function () {
                            let labels = iframe.contentDocument.querySelectorAll('label');
                            labels.forEach(function (label) {
                                console.log(label.innerText);
                                if (label.innerText.indexOf("スパム") != -1) {
                                    label.click();
                                }
                            });
                            retry_count++;
                            if (retry_count > 10) {
                                clearInterval(timer);
                            }
                        }
                        timer = setInterval(click_spam, 1000);
                        

                        //タイマーを停止
                        clearInterval(timer);
                    } else {
                        //user_actionsが表示されない場合はリトライ
                        retry_count++;
                        if (retry_count > 40) {
                            //リトライ回数が40回を超えたらタイマーを停止
                            clearInterval(timer);
                        }
                    }
                }, 1000);
            }
            
        });
    }
}

//5秒後に実行
setTimeout(main, 10000);