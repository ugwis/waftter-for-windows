var gui = require('nw.gui');
var win = gui.Window.get();
win.showDevTools();
var crypto = require('crypto');
var twitter = require('ntwitter');
var fs = require('fs');
var childwin = [];
process.on('uncaughtException', function(err) {
	new Notification(err);
});

var tw = [];

settingFile = "setting.json";

// 参考 http://qiita.com/emadurandal/items/37fae542938907ef5d0c
Function.prototype.toJSON = Function.prototype.toString;
var parser = function(k,v){return v.toString().indexOf('function') === 0 ? eval('('+v+')') : v};
var obj = JSON.parse(fs.readFileSync(settingFile, 'utf8'),parser);

function watch(event, filename) {
	// ファイル内容が変わったイベントでないなら無視
	if (event !== 'change') {
		return;
	}

	fs.watch(settingFile, watch);
}

fs.watch(settingFile, watch);

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