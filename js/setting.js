

current = 0;
function painFocus(number){
	if(number == current) return;
	$("#pane" + current).removeClass("paneActive");
	$("#pane" + number).addClass("paneActive");
	$(".controlpanes_inner").css({left:(-900*number) + "px"});
	current = number;
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
	$('#tpm').val(stat.totalTweets/(parseInt((new Date)/60000) - stat.beginStreaming)).trigger('change');
	fs.watch(statusFile, watchStatusFile.bind(function(){
		stat = loadStatusFile();
		$('#tpm').val(stat.totalTweets/(parseInt((new Date)/60000) - stat.beginStreaming)).trigger('change');
		$('#ltc').val(stat.processTime).trigger('change');
	}));
}