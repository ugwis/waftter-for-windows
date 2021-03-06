
//変更があったかどうか
var ischanged = false;

function exit(){
	//stream.close();
	for(var key in watcher){
		watcher[key].close();
	}
	if(ischanged){
		updateSettingFile(function(){
			win.close();
		});
	} else {
		win.close();
	}
}
process.on('exit', exit);

current = 0;
function painFocus(number){
	if(number == current) return;
	$("#pane" + current).removeClass("paneActive");
	$("#pane" + number).addClass("paneActive");
	$(".controlpanes_inner").css({left:(-900*number) + "px"});
	current = number;
}

//配列の中で配列を探す
function findArrayInArray(obj,array){
	for(var i=0;i<array.length;i++){
		if(array[i].toString() == obj.toString()) return i;
	}
	return -1;
}

//canvasで指定したポイント同士を線で結ぶ
function connectPoints(ctx,a,b){
	if(findArrayInArray([a,b],stat.activeEdges) > -1) ctx.strokeStyle = 'rgb(0,122,204)';
	else ctx.strokeStyle = 'rgb(255,255,255)';
	ax = parseInt($("#" + a).css("left")) + parseInt($("#" + a).width())/2;
	ay = parseInt($("#" + a).css("top")) + parseInt($("#" + a).height())/2;
	bx = parseInt($("#" + b).css("left")) + parseInt($("#" + b).width())/2;
	by = parseInt($("#" + b).css("top")) + parseInt($("#" + b).height())/2;
	ctx.beginPath();
	ctx.moveTo(ax, ay);
	ctx.lineTo(bx, by);
	ctx.closePath();
	ctx.stroke();
}

//エッジの表示を更新
function refreshEdges(){
	console.log("refresh");
	var canvas = document.getElementById('canvas');
	if ( ! canvas || ! canvas.getContext ) {
		return false;
	}
	canvas.width = $('#graphs').width();
	canvas.height = $('#graphs').height();
	var ctx = canvas.getContext('2d');
	ctx.strokeStyle = 'rgb(255,255,255)';
	ctx.fillStyle = 'rgb(255,255,255)';
	for(var key in obj.account){
		for(var ley in obj.account[key].next){
			a = getCircleID("account",key);
			b = getCircleID(obj.account[key].next[ley].type,obj.account[key].next[ley].number);
			connectPoints(ctx,a,b);
		}
	}
	for(var key in obj.worker){
		for(var ley in obj.worker[key].next){
			if(ley == "trash") continue;
			for(var mey in obj.worker[key].next[ley]){
				a = getCircleID("worker",key);
				b = getCircleID(obj.worker[key].next[ley][mey].type,obj.worker[key].next[ley][mey].number);
				connectPoints(ctx,a,b);
			}
		}
	}
}

function main(){
	win.on('focus',function(){
		$("body").css("background-color","#007acc");
	});
	win.on('blur',function(){
		$("body").css("background-color","#5a5a5a");
	});
	var isMaximum = false;
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
		isMaximum =! isMaximum;
	})
	$("#exit").click(exit);
    var editor = ace.edit("jseditor");
    editor.setTheme("ace/theme/monokai");
    editor.setFontSize(14);
    editor.getSession().setMode("ace/mode/javascript");
    editor.getSession().setUseWrapMode(true);
    editor.getSession().setTabSize(4);

	$(".knob").knob({
		change : function (value) {
		},
		release : function (value) {
			//console.log(this.$.attr('value'));
			if(this.$.context.id === "mct"){
				status["max tweet"] = value;
			}
		},
		cancel : function () {
		},
		/*format : function (value) {
			return value + '%';
		},*/
		draw : function () {

			// "tron" case
			if(this.$.data('skin') == 'tron') {

				this.cursorExt = 0.3;

				var a = this.arc(this.cv)  // Arc
					, pa                   // Previous arc
					, r = 1;

				this.g.lineWidth = this.lineWidth;

				if (this.o.displayPrevious) {
					pa = this.arc(this.v);
					this.g.beginPath();
					this.g.strokeStyle = this.pColor;
					this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, pa.s, pa.e, pa.d);
					this.g.stroke();
				}

				this.g.beginPath();
				this.g.strokeStyle = r ? this.o.fgColor : this.fgColor ;
				this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, a.s, a.e, a.d);
				this.g.stroke();

				this.g.lineWidth = 2;
				this.g.beginPath();
				this.g.strokeStyle = this.o.fgColor;
				this.g.arc( this.xy, this.xy, this.radius - this.lineWidth + 1 + this.lineWidth * 2 / 3, 0, 2 * Math.PI, false);
				this.g.stroke();

				return false;
			}
		}
	});
	$('#mct').val(status["max tweet"]).trigger('change');
	setInterval("$('#tpm').val(stat.totalTweets/(parseInt((new Date)/60000) - stat.beginStreaming)).trigger('change');",1000);
	watcher.push(fs.watch(statusFile, watchStatusFile.bind(function(){
		stat = loadStatusFile();
		$('#tpm').val(stat.totalTweets/(parseInt((new Date)/60000) - stat.beginStreaming)).trigger('change');
		$('#ltc').val(stat.processTime).trigger('change');
		refreshEdges();
	})));
	for(var key in obj.column){
		additionalCircle("column",obj.column[key].id,obj.column[key]);
	}
	for(var key in obj.worker){
		additionalCircle("worker",obj.worker[key].id,obj.worker[key]);
	}
	for(var key in obj.account){
		additionalCircle("account",obj.account[key].screen_name,obj.account[key]);
	}
	refreshEdges();
}

//サークルを追加する
function additionalCircle(type,id,circle){
	if(circle === undefined) circle = [];
	color = "";
	if(type == "account"){
		color = "#FF0047"
		html = $('<img/>').attr("src",circle.profile_image_url);
		focus_number = 1;
	}
	if(type == "worker"){
		color = "#EBFF00"
		html = $('<p/>').html(circle.display);
		focus_number = 2;
	}
	if(type == "column"){
		color = "#00B8FF"
		html = $('<p/>').html(circle.display);
		focus_number = 3;
	}
	var left = Math.random()*($('#graphs').width()-77);
	var top = Math.random()*($('#graphs').height()-77);
	if(circle.left !== undefined) left = circle.left;
	if(circle.top !== undefined) top = circle.top;
	$('#graphs').append(
		$('<div/>').css({
			left:left,
			top:top,
			position:'absolute'
		}).attr('onclick','circleFocus("' + type + '","' + id + '");')
		  .attr('id',"circle_" + type + "_" + id)
		  .css("color",color)
		  .addClass('circle')
		  .addClass('node_click_enable')
		  .addClass('unselectable').append(
			html
		).draggable({
			containment: '#graphs',
			scroll: false ,
			drag: function(e,ui){
				refreshEdges();
			},
			stop: function(e,ui){
				ischanged = true;
				if(circle !== []){
					circle.top = parseInt($("#circle_" + type + "_" + id).css("top"));
					circle.left = parseInt($("#circle_" + type + "_" + id).css("left"));
				}
				refreshEdges();
			}
		}).fadeIn('fast')
	);
	if(type!="account"){
		var p = $("#circle_" + type + "_" + id).children("p");
		p.css("margin-top",-(p.height()/2));
	}

}

//サークルをクリックされた時
function circleFocus(type,id){
	$(".circle_focused").removeClass('circle_focused');
	if(type == "none") painFocus(0);
	if(type == "account"){
		painFocus(1);
		$("#user_id").html("<b>Twitter Screen Name:</b> " + id);
	}
	if(type == "worker") painFocus(2);
	if(type == "column") painFocus(3);
	$("#circle_" + type + "_" + id).addClass('circle_focused');
}