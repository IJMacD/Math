$(function(){
  function logage(birthdate,todate){
    todate = (typeof todate == "undefined") ? new Date() : todate;
    return Math.log((todate - birthdate) / (1000 * 60 * 60 * 24 * 365 * 1.0006643835616438)) * Math.LOG10E
  }
  var people = $('.people-list li'),
      sorted = false;
  function draw(pagedelta){
    var now = new Date();
    people.each(function(i,item){
      var item = $(item),
          birthdate = item.data('birthdate'),
          deathdate = item.data('deathdate');
      if(!isFinite(birthdate)){
        birthdate = Date.parse(birthdate);
        item.data('birthdate', birthdate);
      }
      if(!isFinite(deathdate)){
        deathdate = Date.parse(deathdate);
        item.data('deathdate', deathdate);
      }
      if(deathdate)
        item.find('p').text(logage(birthdate,deathdate));
      else
        item.find('p').text(logage(birthdate,now));
    });
    if(!sorted){
      people.sort(function(a,b){
        return $(a).text() > $(b).text() ? -1 : 1;
      });
      sorted = true;
    }
    requestAnimationFrame(draw);
  }
  if(people.length)
    requestAnimationFrame(draw);
});
