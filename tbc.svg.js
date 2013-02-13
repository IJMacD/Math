var MAX_POWER = 16; // 2^16 = 65536 // 2^17 = 131072
var DEFAULT_WIDTH  = 200;
var DEFAULT_HEIGHT = 200;
var MODE_NULL = 0;
var MODE_ALLSECS = 1;
var MODE_BINSECS = 2;
var MODE_HMS = 3;
var LIGHT_OFF = 0;
var LIGHT_ON = 1;
var GRAD_FILL_ON = 'radialGradient3600';
var GRAD_STRK_ON = 'linearGradient3608';
var GRAD_FILL_OF = 'radialGradient3618';
var GRAD_STRK_OF = 'linearGradient3616';

var mMode = MODE_BINSECS;//MODE_NULL; 
var mDebug = false;
var mRadius;
var mDiskSize;
var mTargetDiv;
var mSvgElement;
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
	setInterval("drawVideo();", 200);
}

function initialiseDimensions() {
	mTargetDiv.style.position = 'relative';
	mTargetDiv.style.background = 'black';
	height = mTargetDiv.clientHeight;
	width  = mTargetDiv.clientWidth;
	
	if(height == 0)
		mTargetDiv.style.height = height + "px";
	if(width == 0)
		mTargetDiv.style.width = width + "px";
	
	xmlns = "http://www.w3.org/2000/svg";
	//mSvgElement = document.createElementNS(xmlns, "svg");
	mSvgElement = document.createElement("svg");
	mSvgElement.setAttribute('xmlns', "http://www.w3.org/2000/svg");
	mSvgElement.setAttribute('height', height);
	mSvgElement.setAttribute('width', width);
	//defs = document.createElementNS(xmlns, "defs");
	defs = document.createElement("defs");
	defs.innerHTML = '<linearGradient id="linearGradient3626" xmlns="http://www.w3.org/2000/svg"><stop id="stop3628" offset="0" style="stop-color:#3d4042;stop-opacity:1;" xmlns="http://www.w3.org/2000/svg"></stop><stop id="stop3630" offset="1" style="stop-color:#000000;stop-opacity:1;" xmlns="http://www.w3.org/2000/svg"></stop></linearGradient><linearGradient id="linearGradient3620" xmlns="http://www.w3.org/2000/svg"><stop id="stop3622" offset="0" style="stop-color:#323232;stop-opacity:1;" xmlns="http://www.w3.org/2000/svg"></stop><stop id="stop3624" offset="1" style="stop-color:#000000;stop-opacity:1;" xmlns="http://www.w3.org/2000/svg"></stop></linearGradient><linearGradient id="linearGradient3602" xmlns="http://www.w3.org/2000/svg"><stop style="stop-color:#00a800;stop-opacity:1;" offset="0" id="stop3604" xmlns="http://www.w3.org/2000/svg"></stop><stop style="stop-color:#005200;stop-opacity:1;" offset="1" id="stop3606" xmlns="http://www.w3.org/2000/svg"></stop></linearGradient><linearGradient id="linearGradient3592" xmlns="http://www.w3.org/2000/svg"><stop style="stop-color:#bbdd4b;stop-opacity:1;" offset="0" id="stop3594" xmlns="http://www.w3.org/2000/svg"></stop><stop style="stop-color:#00b400;stop-opacity:1;" offset="1" id="stop3596" xmlns="http://www.w3.org/2000/svg"></stop></linearGradient>'
		+ '<radialGradient id="radialGradient3600" xlink:href="#linearGradient3592" cx="0.65" cy="0.35" fx="0.65" fy="0.35" r="0.81428574" gradientUnits="objectBoundingBox" xmlns="http://www.w3.org/2000/svg"></radialGradient>'
		+ '<linearGradient id="linearGradient3608" xlink:href="#linearGradient3602" x1="0.5" y1="0" x2="0.5" y2="1" gradientUnits="objectBoundingBox" xmlns="http://www.w3.org/2000/svg"></linearGradient>'
		+ '<radialGradient id="radialGradient3618" xlink:href="#linearGradient3620" cx="0.65" cy="0.35" fx="0.65" fy="0.35" r="0.81428574" xmlns="http://www.w3.org/2000/svg"></radialGradient>'
		+ '<linearGradient id="linearGradient3616" xlink:href="#linearGradient3626" x1="0.5" y1="0" x2="0.5" y2="1" xmlns="http://www.w3.org/2000/svg"></linearGradient>'; 
	e = document.createElementNS(xmlns, "linearGradient");
	e.id = "linearGradient3626";
	es = document.createElementNS(xmlns, "stop");
	es.setAttribute('offset', 0);
	es.setAttribute('style', "stop-color:#3d4042;stop-opacity:1;");
	e.appendChild(es);
	es = document.createElementNS(xmlns, "stop");
	es.setAttribute('offset', 1);
	es.setAttribute('style', "stop-color:#000000;stop-opacity:1;");
	e.appendChild(es);
	defs.appendChild(e);
	mSvgElement.appendChild(defs);
	mLayer1 = document.createElementNS(xmlns, "g");
	//mLayer1 = document.createElement("g");
	mSvgElement.appendChild(mLayer1);
	mTargetDiv.appendChild(mSvgElement);
	
	mRadius = 0.4 * Math.min(width, height);
	
	divs_in_circle = MAX_POWER + 1; //Max plus 1 for gap and none for zero
	
	each_arc = 2.0 * Math.PI / divs_in_circle;
	
	// Circumference divided by number of arcs ( * 80%) then convert to radius
	mDiscSize = (0.4 * mRadius * each_arc);
	
	midX = (width / 2.0);
	midY = (height / 2.0);
}
	
function drawVideo()
{
	//currentMillis = new Date().getTime();
	date = new Date();
	local = date.getTime() - (date.getTimezoneOffset() * 60000)
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
	
	//start with half arc offset:
	//theta = each_arc / 2.0;
	theta = 0;
	
	for(i = 0; i < MAX_POWER; i++){
		x = (midX + mRadius * Math.sin(theta));
		y = (midY - mRadius * Math.cos(theta));
		test = currentDaySecs & Math.pow(2, i);
		if(test != 0){
			drawDisc(i, x, y, LIGHT_ON);
		}else{
			drawDisc(i, x, y, LIGHT_OFF);
		}
		if(mDebug) drawText(x-10, y+10, Math.pow(2, i), RED);
		theta += each_arc;
	}
	if(mDebug) drawText(145, 225, currentDaySecs, RED);
}

function drawDisc(i, x, y, state){
	var disc = null;
	if(!(disc = $('disc_'+i))){
		disc = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
		//disc = document.createElement('circle');
		disc.setAttribute('id', 'disc_'+i);
		mLayer1.appendChild(disc);
	}
	fill = (state == LIGHT_ON) ? GRAD_FILL_ON : GRAD_FILL_OF;
	stroke = (state == LIGHT_ON) ? GRAD_STRK_ON : GRAD_STRK_OF;
	disc.setAttribute('cx', x);
	disc.setAttribute('cy', y);
	disc.setAttribute('r',  mDiscSize);
	disc.setAttribute('style', 'fill:url(#'+fill+');stroke:url(#'+stroke+');stroke-width:2.5');
}

function drawText(x, y, text, color){}

function $(id){
	return document.getElementById(id);
}