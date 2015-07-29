
function pinTopThisColumn(obj){
	if(obj.hasClass('pinning')){
		obj.removeClass('pinning');
		startFlow(obj.parent().parent().attr('id'));
		o = obj.parent().parent().children('.tweets').children('.clickingTweet')
		.removeClass('clickingTweet')
		.children('.bottomArea').children('.operationArea').remove();
	} else {
		obj.addClass('pinning');
	}
}

var countColumn = 0;
var flowQueue = new Array();
var tweetQueue = new Array();
var columnWidth = 410;
function addColumn(id,display){
	isFlowing[id] = false;
	flowQueue[id] = new Queue();
	tweetQueue[id] = new Queue();
	$("#columns").append(
		$('<div>').attr("id",id).addClass("column" + countColumn).addClass("subwindow").css("left",countColumn*columnWidth + "px").append(
			$('<div>').addClass("subwindowCaption").append(
				$('<div>').addClass("pinTop button web-symbols").css({"margin-right":"15px","position":"absolute","right":"100px"}).append(
					$('<p>').css("font-size","medium").append("&#0118;")
				).attr("onclick","pinTopThisColumn($(this));"),
				$('<div>').addClass("moveToLeft button").append(
					$('<p>').append("&lt;")
				).attr('onclick','columnMove($(this),"left");'),
				$('<div>').addClass("moveToRight button").append(
					$('<p>').append("&gt;")
				).attr('onclick','columnMove($(this),"right");'),
				$('<div>').addClass("subwindowExit button").append(
					$('<p>').append("×")
				).attr('onclick',"removeColumn($(this).parent().parent());")
			),
			$('<div>').addClass('navigate').append(
				$('<p>').css({"position":"relative","top":"12px","margin":"-0.5em 0px 0.5px 5px"}).append(display)
			),
			$('<div>').addClass('noticebar'),
			$('<div>').addClass('tweets')
		)
	);
	if(countColumn == 0){
		$('.column' + countColumn).addClass('leftNothing')
	} else {
		$('.column' + (countColumn-1)).removeClass('rightNothing');
	}
	$('#' + id).addClass('rightNothing');
	function getScrollTop(){
		scroll = $("#" + id).children(".tweets").scrollTop();
		obj_pinTop = $("#" + id).children(".subwindowCaption").children(".pinTop");
		if(scroll !== 0){
			if(!obj_pinTop.hasClass("pinning")){
				pinTopThisColumn(obj_pinTop);
			}
		} else {
			if(obj_pinTop.hasClass("pinning")){
				pinTopThisColumn(obj_pinTop);
			}
		}
	}
	$("#" + id + " .tweets").on("load scroll", getScrollTop);

	countColumn++;
}

function removeColumn(object){
	var columns = $("#columns").children(".subwindow");
	var number = parseInt((object.attr('class')).match(/column(\d)/i)[1]);
	object.fadeOut('slow',function(){
		object.remove();
		countColumn--;
		if(number == countColumn){
			$(".column" + (number)).addClass("rightNothing");
		} else {
			if(number == 0){
				$(".column" + (number+1)).addClass("leftNothing");
			}
			for(var i=number+1;i<=countColumn;i++){
				$('.column' + i).addClass('column' + (i-1))
					.removeClass('column' + i).css('left',columnWidth*(i-1) + "px");
			}
		}
	});
}

function flow(type,number,data,account){
	if(type == "account"){
		throw new Error("Type 'account' haven't input stream");
	} else if(type == "worker"){
		ac_data = {"screen_name":obj.account[account].screen_name,"profile_image_url":obj.account[account].profile_image_url};
		var ret = obj.worker[number].function(data,ac_data);
		for(var key in ret){
			if(key != "trash"){
				flow(obj.worker[number].next[key].type,obj.worker[number].next[key].number,ret[key],account);
			}
		}
	} else if(type == "column"){
		if(number != -1){
			if(isFlowing[obj.column[number].id]){
				flowQueue[obj.column[number].id].enqueue([obj.column[number].id,data,account]);
			} else {
				putToColumn(obj.column[number].id,data,function(object){},account);
			}
		}
	} else {
		throw new Error("Type '" + type + "' wasnn't expected !");
	}
	return 0;
}

var isFlowing = new Object();
function flowInterval(target){
	console.log("flowInterval");
	notice("[debug] flowQueue[" + target + "] remain:" + flowQueue[target].size());
	if(flowQueue[target].size() != 0){
		isFlowing[target] = true;
		i = flowQueue[target].dequeue();
		console.log(i[2]);
		putToColumn(i[0],i[1],flowInterval,i[2]);
	} else {
		isFlowing[target] = false;
	}
}

function startFlow(target){
	$("#" + target).children(".noticebar").removeClass("pinning").empty().attr("onclick","").css("cursor","default");
	flowInterval(target);
}

function putToColumn(target,data,callback,account){
	if(callback == undefined) callback = function(object){};
	//$('#tweets').prepend("<P>"+JSON.stringify(data,null, "    ")+"</P><hr>");
	if($("#" + target).children(".subwindowCaption").children(".pinTop").hasClass("pinning")){
		if($("#" + target).children(".noticebar").hasClass("pinning")){
		} else {
			$("#" + target).children(".noticebar")
						   .addClass("pinning")
						   .append("New tweet")
						   .css("cursor","pointer")
						   .attr("onclick","$('#" + target + "').children('.tweets').scrollTop(0);pinTopThisColumn($('#" + target + "').children('.subwindowCaption').children('.pinTop'))");
		}
		flowQueue[target].enqueue([target,data,account]);
	} else {
		console.log(data);
		if(data.text != null){
			if(data.retweeted_status != null){
				profile_image_url = data.retweeted_status.user.profile_image_url;
				user_name = data.retweeted_status.user.name;
				screen_name = data.retweeted_status.user.screen_name;
				text = data.retweeted_status.text;
				sourceArea = data.retweeted_status.source;
				retweetedBy = $("<p>").css("margin","0px").append("Retweeted by <a href='#' style='color:#FFF;' onclick='gui.Shell.openExternal(\"http://twitter.com/" + data.user.screen_name + "\");'>" + data.user.screen_name + "</a>").css("font-size","small");
				entities = data.retweeted_status.entities;
			} else {
				profile_image_url = data.user.profile_image_url;
				user_name = data.user.name;
				screen_name = data.user.screen_name;
				text = data.text;
				sourceArea = data.source;
				retweetedBy = "";
				entities = data.entities;
			}
			if('urls' in entities){
				for(i=0;i<entities.urls.length;i++){
					text = text.replace(new RegExp(entities.urls[i].url,'g'),"<a href='#' style='color:#FFF;' onclick=\'gui.Shell.openExternal(\"" + entities.urls[i].expanded_url + "\");\'>" + entities.urls[i].display_url + "</a>");
				}
			}
			mediaArea = $('<div>').addClass('mediaArea')
			if('extended_entities' in data){
				if('media' in data.extended_entities){
					for(i=0;i<data.extended_entities.media.length;i++){
						text = text.replace(new RegExp(data.extended_entities.media[i].url,'g'),"<a href='#' style='color:#FFF;' onclick=\'gui.Shell.openExternal(\"" + data.extended_entities.media[i].expanded_url + "\");\'>" + data.extended_entities.media[i].display_url + "</a>");
						mediaArea.append($('<div>').css({"width":(100/data.extended_entities.media.length) + "%","max-height":"175px","float":"left","overflow":"hidden","cursor":"pointer","transition":"background-color 0.05s linear 0"})
											   .attr("onclick","gui.Shell.openExternal('" + data.extended_entities.media[i].expanded_url + "');")
											   .append($('<img>')
											   .attr("src",data.extended_entities.media[i].media_url)
											   .css({"width":"100%","-webkit-border-radius":"3px"})));
					}
				}
			}
			if('user_mentions' in entities){
				for(var i=0;i<entities.user_mentions.length;i++){
					text = text.replace(new RegExp("@" + entities.user_mentions[i].screen_name,'g'),"<a href='#' style='color:#FFF;' onclick=\'gui.Shell.openExternal(\"http://twitter.com/" + entities.user_mentions[i].screen_name + "\");\'>@" + entities.user_mentions[i].screen_name + "</a>");
				}
			}
			if(data.user.protected) user_name = "<span class='web-symbols' style='font-size: x-small;margin: 0px 5px;'>&#0119;</span>" + user_name;
			var id = target + "_" + data.id_str;
			$("#" + target).children(".tweets").prepend(
				$('<div>').attr("id",id).addClass("tweet").addClass("account" + account).prepend(
					$('<img>').addClass("userIcon").attr('src',profile_image_url),
					$('<div>').addClass("tweetDetail").append(
						$("<span>").addClass("username").append(user_name),
						$("<a>").attr({"href":"#","onclick":"gui.Shell.openExternal('http://twitter.com/" + screen_name + "');"})
								.css("color","#888").append($("<span>").addClass("screenname").append("@" + screen_name)),
						$("<p>").addClass("text").append(text)
					).attr('onclick','clickTweet($(this).parent());'),
					mediaArea,
					$('<div>').addClass("bottomArea").append(
						$('<div>').addClass("retweetedDetailArea").append(retweetedBy),
						$('<div>').addClass("sourceArea").append(sourceArea))
				).toggle(false)
			);
			if(data.user.protected) $('#' + id).addClass('protected');
			$('#' + id).slideDown(500,function(){
				$('#' + id).css("min-height","60px");
				callback(target);
			}).children(".bottomArea")
			  .children(".sourceArea")
			  .children("a")
			  .css({"color":"#FFF","font-size":"small","float":"right"})
			  .attr({"onclick":"gui.Shell.openExternal('" + $('#' + id).children(".bottomArea").children(".sourceArea").children("a").attr("href") + "');","href":"#"});
			tweetQueue[target].enqueue(id);
			if(tweetQueue[target].size() > 10){
				$('#' + tweetQueue[target].dequeue()).remove();
			}
		} else {
			if(data.event !== null){
				$("#" + target).children(".tweets").prepend(
					$('<div>').addClass("notice").prepend(
						$("<p>").addClass("text").append(data.event)
					)
				);
			}
			callback(target);
		}
	}
}

function clickTweet(object){
	column_object = object.parent().parent();
	if(object.hasClass('clickingTweet')){
		object.removeClass('clickingTweet');
		object.children('.bottomArea').children('.operationArea').remove();
		column_object = object.parent().parent();
		if(column_object.children('.subwindowCaption').children('.pinTop').hasClass('pinning2')){
			column_object.children('.subwindowCaption').children('.pinTop').removeClass('pinning2');
		} else {
			if(column_object.children('.subwindowCaption').children('.pinTop').hasClass('pinning')){
				pinTopThisColumn(column_object.children('.subwindowCaption').children('.pinTop'));
			}
		}
	} else {
		if(object.hasClass('protected')){
			rete = $('<div>').addClass('ret').append($('<p>').addClass('web-symbols'));
		} else {
			rete = $('<div>').addClass('button3').addClass('ret').append($('<p>').addClass('web-symbols').append('&#0034;')).attr("onclick","retweet($(this));");
		}
		object.addClass('clickingTweet');
		object.children('.bottomArea').prepend(
			$('<div>').addClass('operationArea').append(
				$('<div>').addClass('button3').addClass('rep').append($('<p>').addClass('web-symbols').append('&#0044;')).attr("onclick","reply($(this));"),
				rete,
				$('<div>').addClass('button3').addClass('fav').append($('<p>').addClass('web-symbols').append('&#0116;')).attr("onclick","favorite($(this));")
			)
		);
		if(column_object.children('.subwindowCaption').children('.pinTop').hasClass('pinning')){
			column_object.children('.subwindowCaption').children('.pinTop').addClass('pinning2');
		} else {
			pinTopThisColumn(column_object.children('.subwindowCaption').children('.pinTop'));
		}
		key = (object.attr('class')).match(/account(\d) /i);
		changeAccount(parseInt(key[1]));
	}
}

function main(){
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
		} else {
			win.maximize();
		}
		isMaximum=!isMaximum;
	});
	$("#exit").click(function(){
		//stream.close();
		for(key in childwin){
			childwin[key].close();
		}
		updateSettingFile(function(){
			win.close();
		});
	});
	$(".mainAccountUser").click(function(){
		$('#settings').slideToggle("fast");
	});
	$('#settings').click(function(){
		$('#settings').slideToggle("fast");
	});

	if(obj === undefined) return;

	for(var key in obj.column){
		addColumn(obj.column[key].id,obj.column[key].display);
	}
	for(var key in obj.worker){
		//obj.worker[key].function();//関数定義
	}
	for(var key in obj.account){
		tw[key] = new twitter({
			consumer_key: obj.account[key].token.consumer_key,
			consumer_secret: obj.account[key].token.consumer_secret,
			access_token_key: obj.account[key].token.access_token_key,
			access_token_secret: obj.account[key].token.access_token_secret
		});
		var sp = function(err,data){
			if(err) console.log(err);
			var ky = parseInt(this);
			obj.account[ky].profile_image_url = data.profile_image_url;
			if(ky == 0){
				$('.mainAccountUser').append(
					$('<span>').css({"float":"left","font-size":"12px","margin-right":"5px"}).append(obj.account[ky].screen_name),
					$('<img>').css({"float":"right","width":"35px","height":"35px"}).attr("src",obj.account[ky].profile_image_url)
				).attr('id',ky);
			} else {
				$('#settings').prepend(
					$('<li>').addClass("button2").css({"padding-top":"3px"}).attr("onclick","changeAccount(parseInt($(this).attr('id')));").append(
						$('<span>').css({"float":"left","font-size":"12px","margin-right":"5px"}).append(obj.account[ky].screen_name),
						$('<img>').css({"float":"right","width":"35px","height":"35px"}).attr("src",obj.account[ky].profile_image_url)
					).attr('id',ky)
				);
			}
		}
		tw[key].verifyCredentials(sp.bind(key))

		notice('[notice] Get Home Timeline');
		var ht = function(err,data){
			if(err){
		throw new Error("Authorization Error");
				return;
			}
			var ky = parseInt(this);
			for(var j in obj.account[ky].next){
				for(var k=data.length-1;k>=0;k--){
					flow(obj.account[ky].next[j].type,obj.account[ky].next[j].number,data[k],ky);
				}
			}
		}
		tw[key].getHomeTimeline(ht.bind(key));
		console.log(tw[key]);
		notice('[notice] connect Streaming API');
		tw[key].stream('user',  function(stream) {
			var st = function(data) {
				var k = parseInt(this);
				//putToColumn('timeline',data);
				for(var j in obj.account[k].next){
					flow(obj.account[k].next[j].type,obj.account[k].next[j].number,data,k);
				}
			}
			stream.on('data', st.bind(key));
			stream.on('error', function(err,data) {
				console.log(data);
			})
		});
	}
};

win.on('maximize',function(){
	win.setResizable(false);
});
win.on('unmaximize',function(){
	win.setResizable(true);
});

function reply(obj){
	tweet_obj = obj.parent().parent().parent()
	id = tweet_obj.attr("id");
	id = id.replace(tweet_obj.parent().parent().attr("id") + "_","");
	childwin.push(gui.Window.open('reply.html?account=' + $('.mainAccountUser').attr("id") + '&tweet_id=' + id,{
		'transparent': true,
	  	"icon":"images/waftter_icon.png",
		'toolbar': false,
		'frame': false,
		'width': 500,
		'height': 400
	}));
}

function retweet(obj){
	tweet_obj = obj.parent().parent().parent()
	id = tweet_obj.attr("id");
	id = id.replace(tweet_obj.parent().parent().attr("id") + "_","");

	if(tweet_obj.hasClass('retweeted')){
		tw[parseInt($('.mainAccountUser').attr("id"))].post('/statuses/destroy/' + id + '.json', null, null, function(err,dat){
			if(err){
				throw new Error(err);
			} else {
				tweet_obj.removeClass('retweeted').attr('id',dat.retweeted_status.id_str);
			}
		});
	} else {
		tw[parseInt($('.mainAccountUser').attr("id"))].post('/statuses/retweet/' + id + '.json', null, null, function(err,dat){
			if(err){
				throw new Error(err);
			} else {
				tweet_obj.addClass('retweeted').attr('id',dat.id_str);
				notice("retweeted")
			}
		});
	}
}

function favorite(obj){
	tweet_obj = obj.parent().parent().parent()
	id = tweet_obj.attr("id");
	id = id.replace(tweet_obj.parent().parent().attr("id") + "_","");

	if(tweet_obj.hasClass('favorited')){
		tw[parseInt($('.mainAccountUser').attr("id"))].post('/favorites/destroy.json', {id: id}, null, function(err,dat){
			if(err){
				throw new Error(err);
			} else {
				tweet_obj.removeClass('favorited');
			}
		});
	} else {
		tw[parseInt($('.mainAccountUser').attr("id"))].post('/favorites/create.json', {id: id}, null, function(err,dat){
			if(err){
				throw new Error(err);
			} else {
				tweet_obj.addClass('favorited');
			}
		});
	}
}

function notice(text){
	$('.bottomText').empty().append($("<p>").append(text));
}

function columnMove(object,direction){
	var current_object = object.parent().parent();
	var swap_object;
	var current_number = parseInt((current_object.attr('class')).match(/column(\d)/i)[1]);
	var swap_number;
	if(direction == "right"){
		swap_number = current_number + 1;
	} else if(direction == "left"){
		swap_number = current_number - 1;
	} else {
		return;
	}
	swap_object = $(".column" + swap_number);
	current_object.css('left',swap_number*columnWidth + "px");
	swap_object.css('left',current_number*columnWidth + "px");
	current_object.addClass('column' + swap_number).removeClass('column' + current_number);
	swap_object.addClass('column' + current_number).removeClass('column' + swap_number);
	if(current_number == 0){
		current_object.removeClass('leftNothing');
		swap_object.addClass('leftNothing');
	}
	if(current_number == countColumn-1){
		current_object.removeClass('rightNothing');
		swap_object.addClass('rightNothing');
	}
	if(swap_number == 0){
		swap_object.removeClass('leftNothing');
		current_object.addClass('leftNothing');
	}
	if(swap_number == countColumn-1){
		swap_object.removeClass('rightNothing');
		current_object.addClass('rightNothing');
	}
	var temp = obj.column[current_number];
	obj.column[current_number] = obj.column[swap_number];
	obj.column[swap_number] = temp;
}