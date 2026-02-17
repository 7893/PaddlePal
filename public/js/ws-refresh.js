// Auto-refresh helper: connects WebSocket and refreshes page data
(function(){
  var ws, timer;
  function connect(){
    try{
      ws=new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host);
      ws.onmessage=function(){
        // Trigger refresh of playing/toplay data
        if(typeof name_refresh==='function')name_refresh();
        if(typeof score_refresh==='function')score_refresh();
      };
      ws.onclose=function(){setTimeout(connect,3000);};
    }catch(e){}
  }
  connect();
  // Also poll every 5 seconds as fallback
  timer=setInterval(function(){
    if(typeof name_refresh==='function')name_refresh();
  },5000);
})();
