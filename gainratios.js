Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
$(function(){
  var props = ['Chainset','Sprocket','Wheelsize','Cranksize'],
      builtin_bikes = {
      // 'bikeid': [ [chainset], [sprockets], wheelradius, cranklength, name, (primary colour), (secondary colour) ]
        //'test': [ [53], [19], 340, 170, "Test" ],
        'tdf': [ [52,39], [12,13,15,17,19,21,23,26], 336, 170, "Carrera Tdf", "rgb(255,255,0)", "rgb(0,0,0)" ],
        'triban3': [ [50,39,30], [12,13,15,17,19,21,23,25], 336, 170, "B'twin Triban 3", "rgb(255,0,0)", "rgb(96,0,0)" ],
        'I1': [ [38], [16], 312, 170, "I1", "rgb(192,192,255)", "rgb(192,192,192)" ],
        'I2': [ [52,42], [12,13,15,17,19,21,23,26], 336, 170, "I2", "rgb(255,255,0)", "rgb(0,0,0)" ],
        'supersix': [ [53,39], [11,12,13,14,15,16,17,19,21,23,25], 336, 170, "Cannondale Supersix Evo", "rgb(128,128,128)", "rgb(0,0,0)" ],
        'nukeproof': [ [36], [11,12,13,14,15,17,19,21,23,26], 330, 170, "Nukeproof Snap Comp", "rgb(202,202,202)", "rgb(40,40,40)" ]
      },
      builtin_hubs = {
        'nexus7': [0.632,0.741,0.843,0.989,1.145,1.335,1.545],
        'alfine11': [0.527,0.681,0.77,0.878,0.995,1.134,1.292,1.462,1.667,1.888,2.153],
        'rohloff14': [0.279,0.316,0.36,0.409,0.464,0.528,0.6,0.682,0.774,0.881,1,1.135,1.292,1.467]
      },
      i = 0,
      l = props.length,
      builtin_rad = $('#builtin_rad'),
      specify_rad = $('#specified_rad'),
      builtin_lst = $('#builtin_lst'),
      tooltips = $('#tooltips'),
      bikes = [],
      ratios = [],
      max_ratio = 0,
      canvas = $('canvas')[0],
      ctx = canvas.getContext('2d'),
      isAnimating = false;
  builtin_bikes['I1'].gearhub = [0.632,0.741,0.843,0.989,1.145,1.335,1.545];
  for(;i<l;i++){
    (function(){
      var name = props[i].toLowerCase(),
          lst = $('#'+name+'_lst'),
          txt = $('#'+name+'_txt');
      $('a[href=#custom'+props[i]+']').click(function(){
        $(this).hide();
        lst.hide();
        txt.val(lst.val());
        txt.show();
        selectSpecify();
      });
    })();
  }
  $('a[href=#gearhub]').click(function(){
    var sprocket_lst = $('#sprocket_lst'),
        sprocket_txt = $('#sprocket_txt'),
        gearhub_lst = $('#gearhub_lst')
        val = sprocket_txt.val() || sprocket_lst.val();
    sprocket_lst.hide();
    $(this).hide();
    $('a[href=#customSprocket]').hide();
    selectSpecify();
    val = val.split(" ")[0];
    sprocket_txt.val(val);
    sprocket_txt.css({width:"30px"}).show();
    gearhub_lst.css({width:"170px"}).show();
  });
  // Build Built in list
  for(b in builtin_bikes){
    $('<option>').attr("value",b).text(builtin_bikes[b][4]).appendTo(builtin_lst);
  }
  function selectBuiltin(){
    builtin_rad.attr("checked", "checked");
    specify_rad.removeAttr("checked");
  }
  function selectSpecify(){
    builtin_rad.removeAttr("checked");
    specify_rad.attr("checked", "checked");
  }
  function drawGainRatios(){
    var i,
        l = bikes.length,
        j,
        k,
        m,
        n,
        xscale,
        last_line,
        x, y,
        title,
        len;
    if(!isAnimating)
      canvas.height = l * 50 + 50;
    tooltips.empty();
    tooltips[0].style.top = canvas.offsetTop+"px";
    tooltips[0].style.left = canvas.offsetLeft+"px";
    xscale = (canvas.width - 20) / max_ratio;
    last_line = Math.floor(max_ratio);
    ctx.strokeStyle = "rgb(192,192,192)";
    ctx.fillStyle = "rgb(192,192,192)";
    ctx.font = "12px sans-serif";
    for(i=1;i<=last_line;i++){
      ctx.beginPath();
      ctx.moveTo(i*xscale, 0);
      ctx.lineTo(i*xscale, canvas.height);
      ctx.stroke();
      ctx.fillText(i,i*xscale,12);
      ctx.fillText(i,i*xscale,canvas.height);
    }
    ctx.font = "16px sans-serif";
    for(i=0;i<l;i++){
      m = ratios[i].length;
      y = 50 + i*50;
      ctx.strokeStyle = "rgb(255,255,255)";
      ctx.fillStyle = "rgb(0,0,0)";
      ctx.lineWidth = 4;
      ctx.strokeText(bikes[i][4], 30, y);
      ctx.fillText(bikes[i][4], 30, y);
      (function(){
        var bike = i,
            p = $('<p>').addClass("removeBike").css({left:"10px",top:(y-16)+"px"}).appendTo(tooltips),
            a = $('<a>').text("×").click(function(){
              bikes.remove(bike);
              calculateRatios();
              drawGainRatios();
            }).appendTo(p);
        p.hover(function(){
          a.show();
        }, function(){
          a.hide();
        });
      })();
      if(bikes[i][5])
        ctx.fillStyle = bikes[i][5];
      for(j=0;j<m;j++){
        n = ratios[i][j].length;
        for(k=0;k<n;k++){
          x = ratios[i][j][k]*xscale;
          y = 50 + i*50 + (m-j-1)*10;
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2, true);
          ctx.fill();
          if(bikes[i][6]){
            ctx.lineWidth = 2;
            ctx.strokeStyle = bikes[i][6];
            ctx.stroke();
          }
          if(typeof bikes[i].gearhub == "undefined")
            title = bikes[i][0][m-j-1]+"×"+bikes[i][1][n-k-1];
          else
            title = bikes[i][0][m-j-1]+"×"+bikes[i][1][0]+"("+(k+1)+")";
          if(!isAnimating){
            $('<a>')
              .attr("title", title)
              .css({left:(x-5)+"px",top:(y-5)+"px"})
              .tooltip()
              .popover({
                content: 'Bike: '+bikes[i][4]+
                  '<br>Gear: '+(bikes[i].gearhub?(k+1):(j+1)+','+(k+1))+
                  '<br>Wheelsize: '+(bikes[i][2]*2).toFixed()+" mm"+
                  '<br>Crank Length: '+bikes[i][3].toFixed()+" mm"+
                  '<br>Ratio: '+ratios[i][j][k].toFixed(2),
                html:true
              })
              .appendTo(tooltips);
          }
        }
      }
    }
  }
  function calculateGainRatios(bike){
    var out = [],
        o,
        i = 0,
        j = 0,
        l = bike[0].length,
        m,
        cl = bike[3],
        wr = bike[2],
        cr,
        sp,
        r = wr / cl,
        f;
    for(i=l-1;i>=0;i--){
      if(bike.gearhub){
        o = [];
        m = bike.gearhub.length;
        cr = bike[0][i];
        sp = bike[1][0];
        for(j=0;j<m;j++){
          f = bike.gearhub[j];
          o.push(r * (cr / sp) * f);
        }
        out.push(o);
      }
      else{
        o = [];
        m = bike[1].length;
        cr = bike[0][i];
        for(j=m-1;j>=0;j--){
          sp = bike[1][j];
          o.push(r * (cr / sp));
        }
        out.push(o);
      }
    }
    return out;
  }
  builtin_lst.click(selectBuiltin).change(selectBuiltin);
  $('#specify input, #specify select').click(selectSpecify).change(selectSpecify);
  $('#addbike_btn').click(function(){
    $('#addbike_modal').modal('hide');
    var bike,
        num_bikes = bikes.length + 1;
    if(builtin_rad[0].checked){
      bike = builtin_bikes[builtin_lst.val()];
    }else{
      var rand = function(){
            return (Math.random()*256).toFixed();
          },
          chainset = $('#chainset_txt').val(),
          sprockets = $('#sprocket_txt').val(),
          wheelsize = $('#wheelsize_txt').val(),
          cranksize = $('#cranksize_txt').val(),
          gearhub = $('#gearhub_lst'),
          name = $('#name_txt').val(),
          fore = "rgb("+rand()+","+rand()+","+rand()+")",
          back = "rgb("+rand()+","+rand()+","+rand()+")",
          bike;
      if(!chainset)
        chainset = $('#chainset_lst').val();
      if(!sprockets)
        sprockets = $('#sprocket_lst').val();
      if(!wheelsize)
        wheelsize = $('#wheelsize_lst').val();
      if(!cranksize)
        cranksize = $('#cranksize_lst').val();
      if(!name)
        name = "bike"+(Math.random()*10000).toFixed();
      chainset = chainset.split(" ");
      sprockets = sprockets.split(" ");
      wheelsize = wheelsize / 2;
      cranksize = cranksize * 1;
      bike = [chainset, sprockets, wheelsize, cranksize, name, back, fore];
      if(gearhub[0].style.display != "" && gearhub[0].style.display != "none")
        bike.gearhub = builtin_hubs[gearhub.val()];
    }

    var cache_ratios = ratios,
        cache_max = max_ratio,
        new_max,
        obj = {max: max_ratio},
        frames = 30;
    bikes.push(bike);
    max_ratio = 0;
    calculateRatios();
    new_max = max_ratio;
    bikes.remove(-1);
    ratios = cache_ratios;
    max_ratio = cache_max;
    animate(canvas, "height", num_bikes * 50 + 50, frames, drawGainRatios, function(){
      bikes.push(bike);
      calculateRatios();
      drawGainRatios();
    });
    if(max_ratio != new_max){
      animate(obj, "max", new_max, frames, function(){
        max_ratio = obj.max;
      });
    }
  });
  function calculateRatios(){
    ratios = [];
    var curr_ratio,
        i = 0,
        l = bikes.length,
        len;
    for(;i<l;i++){
      ratios[i] = curr_ratio = calculateGainRatios(bikes[i]);
      len = curr_ratio.length;
      max_ratio = Math.max(max_ratio, curr_ratio[len-1][curr_ratio[len-1].length-1]);
    }
  }
  function animate(obj, prop, to_val, steps, on_step, on_complete){
    if (typeof obj[prop] != "number")
      return false;
    isAnimating = true;
    var curr_val = obj[prop],
        increment = (to_val - curr_val) / steps,
        func = (function(){
            curr_val += increment;
            obj[prop] = curr_val;
            if (typeof on_step == "function")
              on_step();
            if(curr_val < to_val)
              requestAnimationFrame(func);
            else {
              obj[prop] = to_val;
              if (typeof on_step == "function")
                on_step();
              isAnimating = false;
              if (typeof on_complete == "function")
                on_complete();
            }
          });
    requestAnimationFrame(func);
  }
  $(window).resize(drawGainRatios);
});
