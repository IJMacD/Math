Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
(function(){
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
        canvas = $('canvas')[0],
        ctx = canvas.getContext('2d');
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
          ratios,
          j,
          k,
          m,
          n,
          max = 0,
          xscale,
          last_line,
          x, y,
          title;
      canvas.height = l * 50 + 50;
      tooltips.empty();
      tooltips[0].style.top = canvas.offsetTop+"px";
      tooltips[0].style.left = canvas.offsetLeft+"px";
      for(i=0;i<l;i++){
        ratios = calculateGainRatios(bikes[i]);
        max = Math.max(max, ratios[0][0]);
      }
      xscale = (canvas.width - 20) / max;
      last_line = Math.floor(max);
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
        ratios = calculateGainRatios(bikes[i]);
        m = ratios.length;
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
          n = ratios[j].length;
          for(k=0;k<n;k++){
            x = ratios[j][k]*xscale;
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
              title = bikes[i][0][j]+"×"+bikes[i][1][k];
            else
              title = bikes[i][0][j]+"×"+bikes[i][1][0]+"("+(k+1)+")";
            $('<a>').attr("title", title).css({left:(x-5)+"px",top:(y-5)+"px"}).tooltip().appendTo(tooltips);
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
      if(bike.gearhub){
        for(;i<l;i++){
          o = [];
          m = bike.gearhub.length;
          cr = bike[0][i];
          sp = bike[1][0];
          for(j=m-1;j>=0;j--){
            f = bike.gearhub[j];
            o.push(r * (cr / sp) * f);
          }
          out.push(o);
        }
      }
      else{
        for(;i<l;i++){
          o = [];
          m = bike[1].length;
          cr = bike[0][i];
          for(j=0;j<m;j++){
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
      if(builtin_rad[0].checked){
        bikes.push(builtin_bikes[builtin_lst.val()]);
        drawGainRatios();
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
        bike = [chainset, sprockets, wheelsize, cranksize, name, back, fore];
        if(gearhub[0].style.display != "none")
          bike.gearhub = builtin_hubs[gearhub.val()];
        bikes.push(bike);
        drawGainRatios();
      }
    });
    $(window).resize(drawGainRatios);
  });
})();
