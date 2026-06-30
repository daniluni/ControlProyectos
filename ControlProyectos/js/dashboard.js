const Dashboard={
  els:{},
  init(){
    this.els.presupuestoCard=document.getElementById('dash-presupuesto');
    this.els.gastadoCard=document.getElementById('dash-gastado');
    this.els.activosCard=document.getElementById('dash-activos');
    this.els.ejecucionCard=document.getElementById('dash-ejecucion');
  },
  render(){
    const proyectos=Store.getCollection('proyectos');
    const gastos=Store.getCollection('gastos');
    const categorias=Store.getCollection('categorias');
    const presupuestoTotal=proyectos.reduce((s,p)=>s+p.presupuesto,0);
    const gastosAprobados=gastos.filter(g=>g.estado==='aprobado');
    const totalGastado=gastosAprobados.reduce((s,g)=>s+g.monto,0);
    const activos=proyectos.filter(p=>p.estado==='activo').length;
    const proyectosConGastos=proyectos.filter(p=>gastosAprobados.some(g=>g.idProyecto===p.id));
    const ejecucionPromedio=proyectosConGastos.length>0?Math.round(
      proyectosConGastos.reduce((s,p)=>{
        const gastado=gastosAprobados.filter(g=>g.idProyecto===p.id).reduce((sum,g)=>sum+g.monto,0);
        return s+(gastado/p.presupuesto*100);
      },0)/proyectosConGastos.length
    ):0;
    this.els.presupuestoCard.innerHTML='<div class="card-label">Presupuesto Total</div><div class="card-value">'+Utils.formatCurrency(presupuestoTotal)+'</div>';
    this.els.gastadoCard.innerHTML='<div class="card-label">Total Gastado</div><div class="card-value">'+Utils.formatCurrency(totalGastado)+'</div>';
    this.els.activosCard.innerHTML='<div class="card-label">Proyectos Activos</div><div class="card-value">'+activos+' de '+proyectos.length+'</div>';
    this.els.ejecucionCard.innerHTML='<div class="card-label">Ejecución Promedio</div><div class="card-value">'+ejecucionPromedio+'%</div>';
    this._renderCharts(proyectos,gastos,categorias);
  },
  _renderCharts(proyectos,gastos,categorias){
    const gastosAprobados=gastos.filter(g=>g.estado==='aprobado');
    const porProyecto=proyectos.map(p=>{
      const total=gastosAprobados.filter(g=>g.idProyecto===p.id).reduce((s,g)=>s+g.monto,0);
      const colors=['#6366f1','#f59e0b','#10b981','#ec4899','#8b5cf6','#14b8a6'];
      return{label:p.nombre,valor:total,color:colors[proyectos.indexOf(p)%colors.length]};
    }).filter(d=>d.valor>0);
    Charts.renderDona('chart-dona-proy',porProyecto);
    const totalPresupuesto=proyectos.reduce((s,p)=>s+p.presupuesto,0);
    const totalGastado=gastosAprobados.reduce((s,g)=>s+g.monto,0);
    const disponible=Math.max(0,totalPresupuesto-totalGastado);
    Charts.renderDona('chart-dona-ejec',[
      {label:'Gastado',valor:totalGastado,color:'#6366f1'},
      {label:'Disponible',valor:disponible,color:'#e2e8f0'}
    ]);
    const meses=[];
    for(let i=5;i>=0;i--){
      const d=new Date();d.setMonth(d.getMonth()-i);
      const m=d.toISOString().slice(0,7);
      const total=gastosAprobados.filter(g=>g.fecha.startsWith(m)).reduce((s,g)=>s+g.monto,0);
      meses.push({label:Utils.getMonthName(m),valor:total});
    }
    Charts.renderBarras('chart-barras',meses);
  }
};
