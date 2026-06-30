;(function(){
  const init=()=>{
    Models.initDefaults();
    const tabs=document.querySelectorAll('.tab-btn');
    const views=document.querySelectorAll('.view');
    const setActiveTab=(idx)=>{
      tabs.forEach(t=>t.classList.remove('active'));
      views.forEach(v=>v.classList.remove('active'));
      tabs[idx].classList.add('active');
      views[idx].classList.add('active');
    };
    tabs.forEach((tab,i)=>{
      tab.addEventListener('click',()=>{
        setActiveTab(i);
        if(i===1)Proyectos.render();
        else if(i===2)Gastos.render();
      });
    });
    Dashboard.init();
    Proyectos.init();
    Gastos.init();
    const refreshAll=()=>{
      Dashboard.render();
      const activeIdx=[...tabs].findIndex(t=>t.classList.contains('active'));
      if(activeIdx===0)Dashboard.render();
      else if(activeIdx===1)Proyectos.render();
      else if(activeIdx===2)Gastos.render();
    };
    document.addEventListener('data:change',refreshAll);
    setActiveTab(0);
    Dashboard.render();
    Proyectos.render();
    Gastos.render();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
