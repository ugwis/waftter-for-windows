
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
	$(".mainAccountUser").click(function(){
		$('#settings').slideToggle("fast");
	});
	$('#settings').click(function(){
		$('#settings').slideToggle("fast");
	});
	$("#account").mouseover(function(){
		$("#account").css("background-color","#5a5a5a");
	});
	$("#account").mouseout(function(){
		$("#account").css("background-color","#2d2d2d");
	});

	for(var key in obj.account){
		tw[key] = new twitter({
		  consumer_key: obj.option.consumer_key,
		  consumer_secret: obj.option.consumer_secret,
		  access_token_key: obj.account[key].token.access_token_key,
		  access_token_secret: obj.account[key].token.access_token_secret
		});
		var sp = function(err,data){
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
	}
	$("#tweetText").keydown(function(e){
		account = parseInt($('.mainAccountUser').attr('id'));
		var tw = new twitter({
			consumer_key: obj.account[account].token.consumer_key,
			consumer_secret: obj.account[account].token.consumer_secret,
			access_token_key: obj.account[account].token.access_token_key,
			access_token_secret: obj.account[account].token.access_token_secret
		});
		if(e.keyCode == 13 && e.shiftKey == true){
			value = $("#tweetText").val();
			$("#tweetText").val("");
			tw.post("/statuses/update.json",
				{status: value},
				function(err,dat){
					win.close();
				});
		}
	});
}