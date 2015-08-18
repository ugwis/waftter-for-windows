function putToMain(data){
	//$('#tweets').prepend("<P>"+JSON.stringify(data,null, "    ")+"</P><hr>");
	target = "targetTweet";
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
		mediaImage = $('<div>').addClass('mediaArea')
		if('extended_entities' in data){
			if('media' in data.extended_entities){
				for(i=0;i<data.extended_entities.media.length;i++){
					text = text.replace(new RegExp(data.extended_entities.media[i].url,'g'),"<a href='#' style='color:#FFF;' onclick=\'gui.Shell.openExternal(\"" + data.extended_entities.media[i].expanded_url + "\");\'>" + data.extended_entities.media[i].display_url + "</a>");
					mediaImage.append($('<div>').css({"width":(100/data.extended_entities.media.length) + "%","max-height":"175px","float":"left","overflow":"hidden","cursor":"pointer","transition":"background-color 0.05s linear 0"})
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
		$("#tweetText").val("@"+ screen_name + " ");
		var id = target + "_" + data.id_str;
		console.log(id);
		$("#" + target).prepend(
			$('<div>').attr("id",id).addClass("tweet").css("width","478px").prepend(
				$('<img>').addClass("userIcon").attr('src',profile_image_url),
				$('<div>').addClass("tweetDetail").append(
					$("<span>").addClass("username").append(user_name),
					$("<a>").attr({"href":"#","onclick":"gui.Shell.openExternal('http://twitter.com/" + screen_name + "');"})
							.css("color","#888").append($("<span>").addClass("screenname").append("@" + screen_name)),
					$("<p>").addClass("text").append(text)
				).css("width","418px"),
				mediaImage,
				$('<div>').addClass("bottomArea").append(
					$('<div>').addClass("retweetedDetailArea").append(retweetedBy),
					$('<div>').addClass("sourceArea").append(sourceArea)).css("width","478px")
			)
		);
		$('#' + id).children(".bottomArea")
		  .children(".sourceArea")
		  .children("a")
		  .css({"color":"#FFF","font-size":"small","float":"right"})
		  .attr({"onclick":"gui.Shell.openExternal('" + $('#' + id).children(".bottomArea").children(".sourceArea").children("a").attr("href") + "');","href":"#"});

		$('#' + id).css("min-height","60px");
	}
	win.resizeTo(500,$('#targetTweet').height() + $('#tweetText').height() + 76);
}

function main(){
	account = $.url(location.href).param('account');
	tweet_id = $.url(location.href).param('tweet_id');
	if(account == "") account = "0";
	win.on('focus',function(){
		$("body").css("background-color","#007acc");
	});
	win.on('blur',function(){
		$("body").css("background-color","#5a5a5a");
	});
	win.on('maximize',function(){
		win.setResizable(false);
	});
	win.on('unmaximize',function(){
		win.setResizable(true);
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
		win.close();
	});
	$(".mainAccountUser").click(function(){
		$('#settings').slideToggle("fast");
	});
	$('#settings').click(function(){
		$('#settings').slideToggle("fast");
	});

	var data;
	for(var key in obj.account){
		tw[key] = new twitter({
			consumer_key: obj.account[key].token.consumer_key,
			consumer_secret: obj.account[key].token.consumer_secret,
			access_token_key: obj.account[key].token.access_token_key,
			access_token_secret: obj.account[key].token.access_token_secret
		});
		var ky = parseInt(key);
		if(ky == parseInt(account)){
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
	if(tweet_id !== undefined){
		$(".mainAccountUser").attr("id",parseInt(account));
		console.log(tw[parseInt(account)]);
		tw[parseInt(account)].get('/statuses/show.json',{id:tweet_id},function(err,dat){
			console.log(err);
			console.log(dat);
			data = dat;
			putToMain(dat);
		});
	}
	$("#tweetText").keydown(function(e){
		if(e.keyCode == 13 && e.shiftKey == true){
			$("body").css("background-color","#FFAA00");
			$(".updating").addClass("updating_show");
			notice("[notice] updating tweet...");
			value = $("#tweetText").val();
			$("#tweetText").val("");
			account = parseInt($('.mainAccountUser').attr('id'));
			if(tweet_id != "") post_properties = {status: value,in_reply_to_status_id:tweet_id};
			else post_properties = {status:value};
			tw[account].post("/statuses/update.json",
				post_properties,
				function(err,dat){
					if(err){
						$("body").css("background-color","#FF3333");
						notice("[error]Couldn't post tweet because " + JSON.parse(err.data).errors[0].message);
						$('#tweetText').val(value);
						$(".updating").removeClass("updating_show");
						setTimeout(function(){
							$("body").css("background-color","#007acc");
						},3000)
					} else {
						win.close();
					}
				}
			);
		}
	});
	$("#tweetText").focus();
}

