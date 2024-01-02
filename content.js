
//読み込み完了後に実行されるメイン処理
function main() {
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

    console.log(user_list);
}

//5秒後に実行
setTimeout(main, 5000);

