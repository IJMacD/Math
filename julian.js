(function($){

	function Julian (renderElement) 
	{

		this.re = $(renderElement);

		this.loop = function ()
		{
			this.computeC();
			this.render();
		}

		this.computeC = function (date)
		{
			if(!date)
				date = new Date();

			var a = Math.floor((13 - date.getMonth()) / 12),
				y = date.getFullYear() + 4800 - a,
				m = date.getMonth() + 12*a - 2;

			this.jd = date.getDate() + Math.floor((153 * m + 2)/5) + 365 * y
				+ Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
				+ (date.getHours() - 12)/24 + date.getMinutes()/1440
				+ date.getSeconds()/86400 + date.getMilliseconds()/86400000;
		}

		this.computeB = function (date)
		{
			if(!date)
				date = new Date();
			
			var t = date.getTime();
			t = t + 210863476800000;
			
			this.jd = t / ( 24 * 60 * 60 * 1000 );
		}
		
		this.computeA = function (date)
		{
			if(!date)
				date = new Date();
			
			HR = date.getHours();
			with (Math) {  
			  HR = HR + (MN / 60) + (SS / 3600);
			  GGG = 1;
			  if( YY < 1582 ) GGG = 0;
			  if( YY <= 1582 && MM < 10 ) GGG = 0;
			  if( YY <= 1582 && MM == 10 && DD < 5 ) GGG = 0;
			  JD = -1 * floor(7 * (floor((MM + 9) / 12) + YY) / 4);
			  S = 1;
			  if ((MM - 9)<0) S=-1;
			  A = abs(MM - 9);
			  J1 = floor(YY + S * floor(A / 7));
			  J1 = -1 * floor((floor(J1 / 100) + 1) * 3 / 4);
			  JD = JD + floor(275 * MM / 9) + DD + (GGG * J1);
			  JD = JD + 1721027 + 2 * GGG + 367 * YY - 0.5;
			  JD = JD + (HR / 24);
			}
			
			this.jd = JD;
		}

		this.getDate = function (){
			this.computeC();
			return this.jd;
		}
		
		this.render = function ()
		{
			if(this.re)
				this.re.text(this.jd.toFixed(10));
		}

		var testDiv = $('<div>').insertAfter(this.re),
			targetWidth = this.re.width(),
			fontSizeA = 20,
			fontSizeB = 30,
			widthA,
			widthB;
		testDiv.text(this.getDate());
		testDiv.css({fontSize: fontSizeA+"px"});
		widthA = testDiv.width();
		testDiv.css({fontSize: fontSizeB+"px"});
		widthB = testDiv.width();

		if(testDiv.width() > 0)
		{
			scale = (fontSizeB - fontSizeA) / (widthB - widthA);
			fontSize = fontSizeA + (targetWidth - widthA) * scale;

			this.re.css({fontSize: fontSize+"px", lineHeight: fontSize+"px"});

			testDiv.remove();
		}

		(function(j){
			var f = function(){
				j.loop();
				requestAnimationFrame(f);
			}
			requestAnimationFrame(f);
		}(this));
	}

	window.Julian = Julian;

}(jQuery));
