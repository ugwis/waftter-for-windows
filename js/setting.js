
function add_account(){
	var oa = new OAuth(
		"https://api.twitter.com/oauth/request_token",
		"https://api.twitter.com/oauth/access_token",
		obj.option.consumer_key,
		obj.option.consumer_secret,
		"1.0",
		"C:\\Users\\orn\Desktop\\node-webkit\\waftter\\index.html",
		"HMAC-SHA1"
	);
	oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
		if (error) {
		} else {
			childwin.push(gui.Window.open('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token,{
				'transparent': false,
				"icon":"images/waftter_icon.png",
				'toolbar': false,
				'frame': true,
				'width': 500,
				'height': 400
			}));
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