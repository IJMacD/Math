var MAX_POWER = 16; // 2^16 = 65536 // 2^17 = 131072
var DEFAULT_WIDTH  = 200;
var DEFAULT_HEIGHT = 200;
var MODE_NULL = 0;
var MODE_ALLSECS = 1;
var MODE_BINSECS = 2;
var MODE_HMS = 3;
var TYPE_NULL = 0;
var TYPE_IMG = 1;
var TYPE_SVG = 2;
var TYPE_CAN = 3;
var LAYOUT_NULL = 0;
var LAYOUT_CIRCLE = 1;
var LAYOUT_SQUARE = 2;
var LAYOUT_SIZES = 3;
var LIGHT_OFF = 0;
var LIGHT_ON = 1;
var IMG_DISC = '/img/greenlight.png';
var IMG_NODISC = '/img/offlight.png';
var SVG_FILL_ON = 'radialGradient3600';
var SVG_STRK_ON = 'linearGradient3608';
var SVG_FILL_OF = 'radialGradient3618';
var SVG_STRK_OF = 'linearGradient3616';

var mMode = MODE_BINSECS;//MODE_NULL;
var mType = TYPE_IMG;
var mLayout = LAYOUT_SIZES;
var mDebug = false;
var mCanvasHeight;
var mCanvasWidth;
var mRadius;
var mDiscSize;
var mTargetDiv;
var mSVGElement;
var mLayer1;

function createClock(targetDiv, width, height){
	if(!targetDiv){
		alert("Error");
		return;
	}
	mTargetDiv = targetDiv;
	mCanvasWidth = width || DEFAULT_WIDTH;
	mCanvasHeight = height || DEFAULT_HEIGHT;
	initialiseDimensions();
	if(1)
		createSVGClock(targetDiv);
	else
		createImgClock(targetDiv);
	setInterval("drawVideo();", 50);
	addEvent(window, "resize", initialiseDimensions );
}

function initialiseDimensions() {
	mTargetDiv.style.position = 'relative';
	mTargetDiv.style.background = 'black';
	
	if(mTargetDiv.clientHeight == 0)
		mTargetDiv.style.height = mCanvasHeight + "px";
	if(mTargetDiv.clientHeight == 0)
		mTargetDiv.style.width = mCanvasWidth + "px";
		
	mCanvasHeight = height = mTargetDiv.clientHeight;
	mCanvasWidth =  width = mTargetDiv.clientWidth;
	
	if(mSVGElement)
	{
		mSVGElement.setAttribute('height', mCanvasHeight);
		mSVGElement.setAttribute('width', mCanvasWidth);
	}
	
	mRadius = 0.4 * Math.min(width, height);
	
	divs_in_circle = MAX_POWER + 1; //Max plus 1 for gap and none for zero
	
	each_arc = 2.0 * Math.PI / divs_in_circle;
	
	// Circumference divided by number of arcs ( * 80%)
	mDiscSize = (0.8 * mRadius * each_arc);
	
	midX = (width / 2.0);
	midY = (height / 2.0);
}

function createImgClock()
{
	mType = TYPE_IMG;
	
	mTargetDiv.innerHTML = '';
}

function createSVGClock(targetDiv)
{
	mType = TYPE_SVG;
	
	html = '<svg id="svgclock" xmlns="http://www.w3.org/2000/svg" height="'+mCanvasHeight+'" width="'+mCanvasWidth+'">'
		+ '<defs>'
		+ '<linearGradient id="linearGradient3626" ><stop id="stop3628" offset="0" style="stop-color:#3d4042;stop-opacity:1;" ></stop><stop id="stop3630" offset="1" style="stop-color:#000000;stop-opacity:1;" ></stop></linearGradient><linearGradient id="linearGradient3620" ><stop id="stop3622" offset="0" style="stop-color:#323232;stop-opacity:1;" ></stop><stop id="stop3624" offset="1" style="stop-color:#000000;stop-opacity:1;" ></stop></linearGradient><linearGradient id="linearGradient3602" ><stop style="stop-color:#00a800;stop-opacity:1;" offset="0" id="stop3604" ></stop><stop style="stop-color:#005200;stop-opacity:1;" offset="1" id="stop3606" ></stop></linearGradient><linearGradient id="linearGradient3592" ><stop style="stop-color:#bbdd4b;stop-opacity:1;" offset="0" id="stop3594" ></stop><stop style="stop-color:#00b400;stop-opacity:1;" offset="1" id="stop3596" ></stop></linearGradient>'
		+ '<radialGradient id="radialGradient3600" xlink:href="#linearGradient3592" cx="0.65" cy="0.35" fx="0.65" fy="0.35" r="0.81428574" gradientUnits="objectBoundingBox" ></radialGradient>'
		+ '<linearGradient id="linearGradient3608" xlink:href="#linearGradient3602" x1="0.5" y1="0" x2="0.5" y2="1" gradientUnits="objectBoundingBox" ></linearGradient>'
		+ '<radialGradient id="radialGradient3618" xlink:href="#linearGradient3620" cx="0.65" cy="0.35" fx="0.65" fy="0.35" r="0.81428574" ></radialGradient>'
		+ '<linearGradient id="linearGradient3616" xlink:href="#linearGradient3626" x1="0.5" y1="0" x2="0.5" y2="1" ></linearGradient>'
		+ '</defs>'
		+ '<g id="layer1"></g>'
		+ '</svg>';
	mTargetDiv.innerHTML = html;
	mSVGElement = document.getElementById('svgclock');
	mLayer1 = document.getElementById('layer1');
}
	
function drawVideo(){
	//start with half arc offset:
	//theta = each_arc / 2.0;
	theta = 0;
		
	//currentMillis = new Date().getTime();
	date = new Date();
	local = date.getTime() - (date.getTimezoneOffset() * 60000);
	currentDayMillis = (local % 86400000);
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
		row = 0;
		i = MAX_POWER - 1;
		while(i >= 0)
		{
			for(col = 0; col < 4 && i >= 0; col++, i--)
			{
				x = (col + 1) * mDiscSize * 1.2;
				y = (row + 1) * mDiscSize * 1.2;
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
	else if(mLayout == LAYOUT_SIZES)
	{
		r1 = 220;
		xcum = 10;
		for(i = 0; i < MAX_POWER; i++)
		{
			r = Math.pow(1 / 2, (i - 1) /  2) * r1;
			x = xcum + r;
			y = r + 20;
			xcum = xcum + (r * 1.2);
			test = currentDaySecs & Math.pow(2, MAX_POWER - i + 1);
			if(test != 0){
				drawDisc(i, x, y, r, LIGHT_ON);
			}else{
				drawDisc(i, x, y, r, LIGHT_OFF);
			}
			if(mDebug) drawText(x-10, y+10, Math.pow(2, i), RED);
		}
		row++;
	}
	if(mDebug) drawText(145, 225, currentDaySecs, RED);
}

function drawDisc(i, x, y, r, state)
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
}

function drawImgDisc(i, x, y, state)
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
}

function drawSVGDisc(i, x, y, r, state){
	var disc = null;
	if(!(disc = $('disc_'+i))){
		disc = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
		//disc = document.createElement('circle');
		disc.setAttribute('id', 'disc_'+i);
		mLayer1.appendChild(disc);
	}
	fill = (state == LIGHT_ON) ? SVG_FILL_ON : SVG_FILL_OF;
	stroke = (state == LIGHT_ON) ? SVG_STRK_ON : SVG_STRK_OF;
	disc.setAttribute('cx', x);
	disc.setAttribute('cy', y);
	disc.setAttribute('r',  r);
	disc.setAttribute('style', 'fill:url(#'+fill+');stroke:url(#'+stroke+');stroke-width:2.5');
}

function drawText(x, y, text, color){}

function $(id){
	return document.getElementById(id);
}
var addEvent = function(elem, type, eventHandle) {
    if (elem == null || elem == undefined) return;
    if ( elem.addEventListener ) {
        elem.addEventListener( type, eventHandle, false );
    } else if ( elem.attachEvent ) {
        elem.attachEvent( "on" + type, eventHandle );
    }
};