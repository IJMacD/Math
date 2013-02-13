(function(window){
	var MAX_POWER = 16, // 2^16 = 65536 // 2^17 = 131072
		DEFAULT_WIDTH  = 200,
		DEFAULT_HEIGHT = 200,
		MODE_NULL = 0,
		MODE_ALLSECS = 1,
		MODE_BINSECS = 2,
		MODE_HMS = 3,
		TYPE_NULL = 0,
		TYPE_IMG = 1,
		TYPE_SVG = 2,
		TYPE_CAN = 3,
		LAYOUT_NULL = 0,
		LAYOUT_CIRCLE = 1,
		LAYOUT_SQUARE = 2,
		LAYOUT_SIZES = 3,
		LAYOUT_LINEAR = 4,
		LAYOUT_CONCENTRIC = 5,
		LAYOUT_ROOT2 = 6,
		LIGHT_OFF = 0,
		LIGHT_ON = 1,
		IMG_DISC = '/img/greenlight.png',
		IMG_NODISC = '/img/offlight.png',
		SVG_FILL_ON = 'radialGradient3600',
		SVG_STRK_ON = 'linearGradient3608',
		SVG_FILL_OF = 'radialGradient3618',
		SVG_STRK_OF = 'linearGradient3616',
		SVG_STRK_W = 2.5;

	var createClock = function(targetDiv, width, height, layout){

		if(arguments.length < 1)
			return false;
		if(arguments.length < 3){
			layout = width;
			width = DEFAULT_WIDTH;
			height = DEFAULT_HEIGHT;
		}

		var mMode = MODE_BINSECS,
			mType = TYPE_SVG,
			mLayout = layout || LAYOUT_LINEAR,
			mDebug = false,
			mCanvasWidth = width || DEFAULT_WIDTH,
			mCanvasHeight = height || DEFAULT_HEIGHT,
			mRadius,
			mDiscSize,
			mTargetDiv,
			mSVGElement,
			mSVGLayer,
			mSVGId,
			mStrokeWidth = SVG_STRK_W,
			mLights = [],
			midX, midY,

		initialiseDimensions = function() {

			if(mTargetDiv.clientHeight == 0)
				mTargetDiv.style.height = mCanvasHeight + "px";
			if(mTargetDiv.clientWidth == 0)
				mTargetDiv.style.width = mCanvasWidth + "px";

			mCanvasHeight = height = mTargetDiv.clientHeight;
			mCanvasWidth =  width = mTargetDiv.clientWidth;


			if(mType == TYPE_IMG){
				mTargetDiv.style.position = 'relative';
			}
			else if(mType == TYPE_SVG) {
				if(mSVGElement)
				{
					mSVGElement.setAttribute('height', mCanvasHeight);
					mSVGElement.setAttribute('width', mCanvasWidth);
				}
			}

			if(mLayout == LAYOUT_CIRCLE){
				mRadius = 0.4 * Math.min(width, height);

				divs_in_circle = MAX_POWER + 1; //Max plus 1 for gap and none for zero

				each_arc = 2.0 * Math.PI / divs_in_circle;

				// Circumference divided by number of arcs ( * 80%)
				mDiscSize = (0.8 * mRadius * each_arc);
			}
			else if(mLayout == LAYOUT_SQUARE){
				mDiscSize = 0.8 * Math.min(width, height) / 4;
			}
			else if(mLayout == LAYOUT_LINEAR){
				// mEachBlock:
				each_block = width / MAX_POWER;
				// Disk size is 80% of relevant dimension of block
				mDiscSize = 0.8 * Math.min(height, each_block);
			}
			else if(mLayout == LAYOUT_ROOT2){
				mStrokeWidth = Math.min(width, height) * 0.005;
			}

			midX = (width / 2.0);
			midY = (height / 2.0);
		},

		createImgClock = function()
		{
			mType = TYPE_IMG;

			mTargetDiv.innerHTML = '';
		},

		createSVGClock = function(targetDiv)
		{
			mType = TYPE_SVG,
			mSVGId = (Math.random()*10000).toFixed();

			html = '<svg id="svgclock_'+mSVGId+'" xmlns="http://www.w3.org/2000/svg" height="'+(mCanvasHeight-4)+'" width="'+mCanvasWidth+'">'
				+ '<defs>'
				+ '<linearGradient id="linearGradient3626" ><stop id="stop3628" offset="0" style="stop-color:#3d4042;stop-opacity:1;" ></stop><stop id="stop3630" offset="1" style="stop-color:#000000;stop-opacity:1;" ></stop></linearGradient>'
				+ '<linearGradient id="linearGradient3620" ><stop id="stop3622" offset="0" style="stop-color:#323232;stop-opacity:1;" ></stop><stop id="stop3624" offset="1" style="stop-color:#000000;stop-opacity:1;" ></stop></linearGradient>'
				+ '<linearGradient id="linearGradient3602" ><stop style="stop-color:#00a800;stop-opacity:1;" offset="0" id="stop3604" ></stop><stop style="stop-color:#005200;stop-opacity:1;" offset="1" id="stop3606" ></stop></linearGradient>'
				+ '<linearGradient id="linearGradient3592" ><stop style="stop-color:#bbdd4b;stop-opacity:1;" offset="0" id="stop3594" ></stop><stop style="stop-color:#00b400;stop-opacity:1;" offset="1" id="stop3596" ></stop></linearGradient>'
				+ '<radialGradient id="radialGradient3600" xlink:href="#linearGradient3592" cx="0.65" cy="0.35" fx="0.65" fy="0.35" r="0.81428574" gradientUnits="objectBoundingBox" ></radialGradient>'
				+ '<linearGradient id="linearGradient3608" xlink:href="#linearGradient3602" x1="0.5" y1="0" x2="0.5" y2="1" gradientUnits="objectBoundingBox" ></linearGradient>'
				+ '<radialGradient id="radialGradient3618" xlink:href="#linearGradient3620" cx="0.65" cy="0.35" fx="0.65" fy="0.35" r="0.81428574" ></radialGradient>'
				+ '<linearGradient id="linearGradient3616" xlink:href="#linearGradient3626" x1="0.5" y1="0" x2="0.5" y2="1" ></linearGradient>'
				+ '</defs>'
				+ '<g id="layer_'+mSVGId+'"></g>'
				+ '</svg>';
			mTargetDiv.innerHTML = html;
			mSVGElement = document.getElementById('svgclock_'+mSVGId);
			mSVGLayer = document.getElementById('layer_'+mSVGId);
		},

		drawVideo = function(){
			//start with half arc offset:
			//theta = each_arc / 2.0;
			var theta = 0,

			//currentMillis = new Date().getTime();
				date = new Date(),
				local = date.getTime() - (date.getTimezoneOffset() * 60000),
				currentDayMillis = (local % 86400000),
				currentDaySecs = 0;
			switch(mMode){
			case MODE_ALLSECS:
				currentDaySecs = Math.round(currentDayMillis / 1000.0);
				break;
			case MODE_BINSECS:
				currentDaySecs = (Math.round(currentDayMillis * Math.pow(2, MAX_POWER)/86400000));
				break;
			case MODE_NULL:
			default:
			}

			if(mLayout == LAYOUT_CIRCLE)
			{
				var i, x, y, test;
				for(i = 0; i < MAX_POWER; i++){
					x = (midX + mRadius * Math.sin(theta));
					y = (midY - mRadius * Math.cos(theta));
					test = currentDaySecs & Math.pow(2, i);
					if(test != 0){
						drawDisc(i, x, y, mDiscSize / 2, LIGHT_ON);
					}else{
						drawDisc(i, x, y, mDiscSize / 2, LIGHT_OFF);
					}
					if(mDebug) drawText(x-10, y+10, Math.pow(2, i), RED);
					theta += each_arc;
				}
			}
			else if(mLayout == LAYOUT_SQUARE)
			{
				var row = 0,
					i = MAX_POWER - 1,
					x, y, test, col;
				while(i >= 0)
				{
					for(col = 0; col < 4 && i >= 0; col++, i--)
					{
						x = (col - 1.5) * mDiscSize * 1.2 + (width / 2);
						y = (row - 1.5) * mDiscSize * 1.2 + (height / 2);
						test = currentDaySecs & Math.pow(2, i);
						if(test != 0){
							drawDisc(i, x, y, mDiscSize / 2, LIGHT_ON);
						}else{
							drawDisc(i, x, y, mDiscSize / 2, LIGHT_OFF);
						}
						if(mDebug) drawText(x-10, y+10, Math.pow(2, i), RED);
					}
					row++;
				}
			}
			else if(mLayout == LAYOUT_LINEAR)
			{
				var y = midY, i, j, x, test, oldTest,
					firstOff = 0, toMove = [];
				for(i = MAX_POWER - 1; i >= 0; i--){
					oldTest = mLights[i];
					mLights[i] = currentDaySecs & Math.pow(2, MAX_POWER - i - 1);
					x = (each_block / 2) + (i * each_block);
					if(!firstOff && !mLights[i] && oldTest){
						hideSVGDisc(MAX_POWER - i - 1);
						toMove.push([x,y]);
					}
					else if(!firstOff){
						firstOff = i;
						for(j=toMove.length-1;j>=0;j--){
							animateSVGDisc(toMove[j],[x,y],250);
						}
					}
					if(mLights[i] != 0){
						drawDisc(i, x, y, mDiscSize / 2, LIGHT_ON);
					}else{
						drawDisc(i, x, y, mDiscSize / 2, LIGHT_OFF);
					}
					if(mDebug) drawText(x-10, y+10, Math.pow(2, i), RED);
				}
			}
			else if(mLayout == LAYOUT_SIZES)
			{
				var r1 = mCanvasWidth / 6,
					xcum = 10,
					i, r, x, y;
				for(i = 0; i < MAX_POWER; i++)
				{
					r = Math.pow(1 / 2, (i - 1) /  2) * r1;
					x = xcum + r;
					y = r + 20;
					xcum = xcum + (r * 1.2);
					test = currentDaySecs & Math.pow(2, MAX_POWER - i - 1);
					if(test != 0){
						drawDisc(i, x, y, r, LIGHT_ON);
					}else{
						drawDisc(i, x, y, r, LIGHT_OFF);
					}
					if(mDebug) drawText(x-10, y+10, Math.pow(2, i), RED);
				}
			}
			else if(mLayout == LAYOUT_CONCENTRIC)
			{
				var r1 = 0.95 * Math.min(midX, midY),
					r, i, test;
				for(i = 0; i < MAX_POWER; i++)
				{
					r = r1 * (1 - i / MAX_POWER);
					test = currentDaySecs & Math.pow(2, MAX_POWER - i - 1);
					if(test != 0){
						drawDisc(i, midX, midY, r, LIGHT_ON);
					}else{
						drawDisc(i, midX, midY, r, LIGHT_OFF);
					}
					if(mDebug) drawText(x-10, y+10, Math.pow(2, i), RED);
				}
			}
			else if(mLayout == LAYOUT_ROOT2)
			{
				var factor = Math.E,
					x = 0,
					w = mCanvasWidth/factor,
					y = 0,
					h = mCanvasHeight,
					i;
				for(i = MAX_POWER - 1; i >= 0; i--)
				{
					test = currentDaySecs & Math.pow(2, i);
					drawRect(i, x, y, w, h, test ? LIGHT_ON : LIGHT_OFF);

					if(mDebug) drawText(x-10, y+10, Math.pow(2, i), RED);

					if(i == 1){
						x = x+w;
						w = w / (factor - 1);
					}
					else if(i == 2){
						y = y+h;
						w = w * (factor - 1) / factor;
						h = h * (factor - 1);
					}
					else if(i%2){
						x = x+w;
						h = h / factor;
						w = w * (factor - 1);
					}
					else {
						y = y+h;
						w = w / factor;
						h = h * (factor - 1);
					}
				}
			}
			if(mDebug) drawText(145, 225, currentDaySecs, RED);
		},

		drawDisc = function(i, x, y, r, state)
		{
			switch(mType)
			{
				case TYPE_IMG:
					drawImgDisc(i, x, y, state);
					break;
				case TYPE_SVG:
					drawSVGDisc(i, x, y, r, state);
					break;
			}
		},

		drawRect = function(i, x, y, w, h, state)
		{
			switch(mType)
			{
				case TYPE_IMG:
					break;
				case TYPE_SVG:
					drawSVGRect(i, x, y, w, h, state);
					break;
			}
		},

		drawImgDisc = function(i, x, y, state)
		{
			var disc = null;
			if(!(disc = $('disc_'+i))){
				disc = document.createElement('div');
				disc.setAttribute('id', 'disc_'+i);
				mTargetDiv.appendChild(disc);
			}
			var left = x - (mDiscSize / 3.0);
			var top = y - (mDiscSize / 3.0);
			img = (state == LIGHT_ON) ? IMG_DISC : IMG_NODISC;
			disc.setAttribute('style', 'position: absolute; left: '+left+'px; top: '+top+'px; height: '+mDiscSize+'px; width: '+mDiscSize+'px; background: url('+img+') no-repeat; background-size: 100%;');
		},

		drawSVGDisc = function(i, x, y, r, state){
			var disc = null;
			if(!(disc = $('disc_'+mSVGId+'_'+i))){
				disc = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
				disc.setAttribute('id', 'disc_'+mSVGId+'_'+i);
				mSVGLayer.appendChild(disc);
			}
			fill = (state == LIGHT_ON) ? SVG_FILL_ON : SVG_FILL_OF;
			stroke = (state == LIGHT_ON) ? SVG_STRK_ON : SVG_STRK_OF;
			disc.setAttribute('cx', x);
			disc.setAttribute('cy', y);
			disc.setAttribute('r',  r);
			disc.setAttribute('style', 'fill:url(#'+fill+');stroke:url(#'+stroke+');stroke-width:'+mStrokeWidth);
		},

		drawSVGRect = function(i, x, y, w, h, state){
			var disc = null;
			if(!(disc = $('rect_'+mSVGId+'_'+i))){
				disc = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
				disc.setAttribute('id', 'rect_'+mSVGId+'_'+i);
				mSVGLayer.appendChild(disc);
			}
			fill = (state == LIGHT_ON) ? SVG_FILL_ON : SVG_FILL_OF;
			stroke = (state == LIGHT_ON) ? SVG_STRK_ON : SVG_STRK_OF;
			disc.setAttribute('x', x);
			disc.setAttribute('y', y);
			disc.setAttribute('width', w);
			disc.setAttribute('height', h);
			disc.setAttribute('style', 'fill:url(#'+fill+');stroke:url(#'+stroke+');stroke-width:'+mStrokeWidth);
		},

		tempDiscPool = [],
		tempDiscCount = 0,
		mAnimations = [],

		animateSVGDisc = function(from, to, time){
			var tempDisc;
			if(!(tempDisc = tempDiscPool.pop())){
				tempDisc = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
				tempDisc.setAttribute('r', mDiscSize/2);
				tempDisc.setAttribute('style', 'fill:url(#'+SVG_FILL_ON+');stroke:url(#'+SVG_STRK_ON+');stroke-width:'+mStrokeWidth);
			}
			tempDisc.setAttribute('cx', from[0]);
			tempDisc.setAttribute('cy', from[1]);
			mSVGLayer.appendChild(tempDisc);
			mAnimations.push([tempDisc,from,to,time]);
		},

		hideSVGDisc = function(i){
			if(disc = $('disc_'+mSVGId+'_'+i)){
				disc.setAttribute('cy', -100);
			}
		},

		lastTime = 0,

		runAnimations = function(pageTime){
			var delta = pageTime - lastTime,
				i, anim, disc, from, to, time, frac,
				animations = [];
			for (i = mAnimations.length - 1; i >= 0; i--) {
				anim = mAnimations[i];
				disc = anim[0];
				from = anim[1];
				to = anim[2];
				time = anim[3];
				frac = delta / time;
				from = [(to[0] - from[0])*frac + from[0], (to[1] - from[1])*frac + from[1]];
				if(time <=0){
					mSVGLayer.removeChild(disc);
					tempDiscPool.push(disc);
				}
				else{
					disc.setAttribute('cx', from[0]);
					disc.setAttribute('cy', from[1]);
					animations.push([disc,from,to,time - delta]);
				}
			};
			mAnimations = animations;
			lastTime = pageTime;
		},

		drawText = function(x, y, text, color){},

		$ = function(id){
			return document.getElementById(id);
		},

		addEvent = function(elem, type, eventHandle) {
		    if (elem == null || elem == undefined) return;
		    if ( elem.addEventListener ) {
		        elem.addEventListener( type, eventHandle, false );
		    } else if ( elem.attachEvent ) {
		        elem.attachEvent( "on" + type, eventHandle );
		    }
		},

		loop = function(time){
			drawVideo(time);
			runAnimations(time);
			requestAnimationFrame(loop);
		};


		if(!targetDiv){
			alert("Error");
			return;
		}
		if(!(targetDiv instanceof HTMLElement)){
			targetDiv = $(targetDiv);
		}
		mTargetDiv = targetDiv;

		initialiseDimensions();

		if(mType == TYPE_SVG)
			createSVGClock(targetDiv);
		else if(mType == TYPE_IMG)
			createImgClock(targetDiv);

		requestAnimationFrame(loop);
		addEvent(window, "resize", initialiseDimensions );
	}

	// Export public API
	window.TBC = {
		createClock: createClock,
		LAYOUT_NULL: LAYOUT_NULL,
		LAYOUT_CIRCLE: LAYOUT_CIRCLE,
		LAYOUT_SQUARE: LAYOUT_SQUARE,
		LAYOUT_SIZES: LAYOUT_SIZES,
		LAYOUT_CONCENTRIC: LAYOUT_CONCENTRIC,
		LAYOUT_LINEAR: LAYOUT_LINEAR,
		LAYOUT_ROOT2: LAYOUT_ROOT2
	}

}(window));
