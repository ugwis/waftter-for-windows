
var auth_window;

function add_account(){
	var oa = new OAuth(
		"https://api.twitter.com/oauth/request_token",
		"https://api.twitter.com/oauth/access_token",
		obj.option.consumer_key,
		obj.option.consumer_secret,
		"1.0",
		"http://auth.waftter.jp/auth/entry.cgi",
		"HMAC-SHA1"
	);
	oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
		if (error) {
			new Notification(err);
			return;
		} else {
			if(auth_window) auth_window.close();
			auth_window = gui.Window.open('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token,{
				'transparent': false,
				"icon":"images/waftter_icon.png",
				'toolbar': false,
				'frame': true,
				'width': 500,
				'height': 400
			});
			auth_window.on('closed',function(){
				$.getJSON("http://auth.waftter.jp/auth/auth.cgi?oauth_token=" + oauth_token,{},function(data){
					oa.getOAuthAccessToken(
						data.oauth_token,
						oauth_token_secret,
						data.oauth_verifier,
						function(error,oauth_access_token,oauth_access_token_secret,result){
							if(err){
								new Notification(err);
								return;
							}
							var twitter = new twitter({
								consumer_key: obj.option.consumer_key,
								consumer_secret: obj.option.consumer_secret,
								access_token_key: oauth_access_token,
								access_token_secret: oauth_access_token_secret
							});
							twitter.verifyCredentials(function(err,data){
								if(err){
									new Notification(err);
									return;
								}
								console.log(data);
								/*obj.account.push({
									"token":{
										"consumer_key": obj.option.consumer_key,
										"consumer_secret":obj.option.consumer_secret,
										"access_token_key":oauth_access_token,
										"access_token_secret":oauth_access_token_secret
									},
									"screen_name":""
								})*/
							});

							message_send(1,{
								type: "callback_status",
								callback_status:{
									type:"auth",
									error: error,
									access_token: oauth_access_token,
									access_token_secret: oauth_access_token_secret
								}
							},session_no);
							if(!error){
								listen[session_no].access_token_key = oauth_access_token;
								listen[session_no].access_token_secret = oauth_access_token_secret;
							}
						}
					);
				});
			});
			console.log(oauth_token_secret);
//			authenticating_user_oauth_secret[oauth_token] = oauth_token_secret;
		}
	});
}

$(document).ready(function(){
	win.on('focus',function(){
		$("body").css("background-color","#007acc");
	});
	win.on('blur',function(){
		$("body").css("background-color","#5a5a5a");
	});
	var isMaximum=false;
	$("#minimize").click(function(){
		win.minimize();
	});
	$("#maximize").click(function(){
		if(isMaximum){
			win.unmaximize();
			//win.setResizable(true);
		} else {
			win.maximize();
			win.setResizable(false);
		}
		isMaximum=!isMaximum;
	})
	$("#exit").click(function(){
		//stream.close();
		win.close();
	});
});