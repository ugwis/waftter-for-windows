var gui = require('nw.gui');
var win = gui.Window.get();
win.showDevTools();
var crypto = require('crypto');
var twitter = require('ntwitter');
var fs = require('fs');
var OAuth = require('oauth').OAuth;
var childwin = [];
//process.on('uncaughtException', function(err) {
//	new Notification(err);
//});

var default_consumer_key = "5PBw3HtLbKXoAvF47Rtw";
var default_consumer_secret = "2XwVyMe58FvJwGr2bgH19xuE02aeeXiwcRqZVjSo6A";

var tw = [];

settingFile = "setting.json";

function loadSettingFile(){
	// 参考 http://qiita.com/emadurandal/items/37fae542938907ef5d0c
	Function.prototype.toJSON = Function.prototype.toString;
	var parser = function(k,v){return v.toString().indexOf('function') === 0 ? eval('('+v+')') : v};
	return JSON.parse(fs.readFileSync(settingFile, 'utf8'),parser);
}

var obj;

var watching = true;

function watchSettingFile(event, filename) {
	// ファイル内容が変わったイベントでないなら無視
	if (event !== 'change' || !watching) {
		return;
	}
	console.log("Setting file has been changed");

	for(key in childwin){
		childwin[key].close();
	}
	win.reload();

	fs.watch(settingFile, watchSettingFile);
}

function updateSettingFile(callback){
	watching = false;
	fs.writeFile(settingFile,JSON.stringify(obj,null,'  '),function(err){
		if(err) console.log("Can't update setting file.");
		watching = true;
		callback();
	});
}

//キュー
//http://keicode.com/script/scr25.php
function Queue() {
	this.__a = [];
}

Queue.prototype.enqueue = function(o) {
	this.__a.push(o);
};

Queue.prototype.dequeue = function() {
	if( this.__a.length > 0 ) {
		return this.__a.shift();
	}
	return null;
  };

Queue.prototype.size = function() {
	return this.__a.length;
};

Queue.prototype.toString = function() {
	return '[' + this.__a.join(',') + ']';
};


//文字の長さを返す関数(サロゲートペア対応)
// http://teppeis.hatenablog.com/entry/2014/01/surrogate-pair-in-javascript
function strlen(str) {
  return str.length - (str.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g)||[]).length;
}

function avoid(str){
	/*
	CSRF
	XSS
	*/
	str.replace('<','&lt;')
	   .replace('>','&gt;')
	   .replace('&','&amp;')
	   .replace('"','&quot;')
	   .replace("\'",'&#39;');
	return str;
}

function changeAccount(number){
	current = parseInt($('.mainAccountUser').attr('id'));
	if(current != number){
		$("#" + current).empty().append(
			$('<span>').css({"float":"left","font-size":"12px","margin-right":"5px"}).append(obj.account[number].screen_name),
			$('<img>').css({"float":"right","width":"35px","height":"35px"}).attr("src",obj.account[number].profile_image_url)
		);
		$("#" + number).empty().prepend(
			$('<span>').css({"float":"left","font-size":"12px","margin-right":"5px"}).append(obj.account[current].screen_name),
			$('<img>').css({"float":"right","width":"35px","height":"35px"}).attr("src",obj.account[current].profile_image_url)
		).attr("id",current);
		$(".mainAccountUser").attr("id",number);
	}
}


var auth_window;

function add_account(callback,next){
	if(callback === undefined) callback = function(){};
	if(next === undefined) next = [];
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
			alert(error);
			return;
		} else {
			auth_window = gui.Window.open('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token,{
				'transparent': false,
				"icon":"images/waftter_icon.png",
				'toolbar': false,
				'frame': true,
				'width': 500,
				'height': 400
			});
			auth_window.on('closed',function(){
				$.getJSON("http://auth.waftter.jp/auth/auth.cgi",{oauth_token:oauth_token},function(data){
					console.log(data);
					console.log(oauth_token_secret);
					oa.getOAuthAccessToken(
						data.oauth_token,
						oauth_token_secret,
						data.oauth_verifier,
						function(error,oauth_access_token,oauth_access_token_secret,result){
							if(error){
								new Notification(error);
								return;
							}
							var twitveri = new twitter({
								consumer_key: obj.option.consumer_key,
								consumer_secret: obj.option.consumer_secret,
								access_token_key: oauth_access_token,
								access_token_secret: oauth_access_token_secret
							});
							twitveri.verifyCredentials(function(err,data){
								if(err){
									new Notification(err);
									return;
								}
								console.log(data);
								obj.account.push({
									"token":{
										"consumer_key": obj.option.consumer_key,
										"consumer_secret":obj.option.consumer_secret,
										"access_token_key":oauth_access_token,
										"access_token_secret":oauth_access_token_secret
									},
									"screen_name":data.screen_name,
									"profile_image_url":data.profile_image_url,
									"next":next
								});
								updateSettingFile(function(){
									fs.watch(settingFile, watchSettingFile);
									callback();
								});
							});
						}
					);
				});
			});
		}
	});
}


fs.exists(settingFile,function(exist){
	if(exist){
		obj = loadSettingFile();
		fs.watch(settingFile, watchSettingFile);
		main();
	} else {
		obj = {
			"account":[],
			"worker":[],
			"column":[
				{
					"display": "Timeline",
					"id": "timeline"
				}],
			"option":{
				"consumer_key":default_consumer_key,
				"consumer_secret":default_consumer_secret
			}
		};
		updateSettingFile(function(){
			add_account(function(){
				win.reload();
			},[{
				"type": "column",
				"number": 0
			}]);
		});
	}
});