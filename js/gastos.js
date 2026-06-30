const Gastos={
  els:{},editId:null,
  init(){
    this.els.modal=document.getElementById('gasto-modal');
    this.els.form=document.getElementById('gasto-form');
    this.els.openBtn=document.getElementById('gasto-nuevo-btn');
    this.els.closeBtn=this.els.modal.querySelector('.modal-close');
    this.els.cancelBtn=this.els.modal.querySelector('.btn--ghost');
    this.els.tableBody=document.getElementById('gastos-tbody');
    this.els.filtroProyecto=document.getElementById('filtro-proyecto');
    this.els.filtroCategoria=document.getElementById('filtro-categoria');
    this.els.filtroEstado=document.getElementById('filtro-estado');
    this.els.filtroDesde=document.getElementById('filtro-desde');
    this.els.filtroHasta=document.getElementById('filtro-hasta');
    this.els.modalTitle=this.els.modal.querySelector('.modal-header h2');
    this._bindEvents();
  },
  _bindEvents(){
    this.els.openBtn.addEventListener('click',()=>this.open());
    this.els.closeBtn.addEventListener('click',()=>this.close());
    this.els.cancelBtn.addEventListener('click',()=>this.close());
    this.els.modal.addEventListener('click',e=>{if(e.target===this.els.modal)this.close()});
    this.els.form.addEventListener('submit',e=>{e.preventDefault();this._save()});
    [this.els.filtroProyecto,this.els.filtroCategoria,this.els.filtroEstado,this.els.filtroDesde,this.els.filtroHasta].forEach(el=>{
      el.addEventListener('change',()=>this.render());
    });
    document.getElementById('gasto-proyecto').addEventListener('change',()=>{
      this._populateRecursoSelect(document.getElementById('gasto-proyecto').value,null);
    });
  },
  open(gasto){
    this.editId=gasto?gasto.id:null;
    this.els.modalTitle.textContent=gasto?'Editar Gasto':'Nuevo Gasto';
    this._populateSelects();
    if(gasto){
      document.getElementById('gasto-proyecto').value=gasto.idProyecto;
      document.getElementById('gasto-categoria').value=gasto.idCategoria;
      document.getElementById('gasto-monto').value=gasto.monto;
      document.getElementById('gasto-descripcion').value=gasto.descripcion;
      document.getElementById('gasto-fecha').value=gasto.fecha;
      document.getElementById('gasto-proveedor').value=gasto.proveedor;
      document.getElementById('gasto-estado').value=gasto.estado;
      this._populateRecursoSelect(gasto.idProyecto,gasto.idRecurso);
    }else{
      this.els.form.reset();
      document.getElementById('gasto-fecha').value=Utils.getTodayISO();
      document.getElementById('gasto-estado').value='pendiente';
      this._populateRecursoSelect(null,null);
    }
    this.els.modal.classList.add('active');
  },
  close(){
    this.els.modal.classList.remove('active');
    this.editId=null;
    this.els.form.reset();
  },
  _populateSelects(){
    const pSelect=document.getElementById('gasto-proyecto');
    const cSelect=document.getElementById('gasto-categoria');
    const proyectos=Store.getCollection('proyectos');
    const categorias=Store.getCollection('categorias');
    pSelect.innerHTML='<option value="">Seleccionar...</option>'+proyectos.map(p=>
      '<option value="'+p.id+'">'+Utils.escapeHtml(p.nombre)+'</option>'
    ).join('');
    cSelect.innerHTML='<option value="">Seleccionar...</option>'+categorias.map(c=>
      '<option value="'+c.id+'">'+Utils.escapeHtml(c.nombre)+'</option>'
    ).join('');
  },
  _populateRecursoSelect(idProyecto,selectedId){
    const rSelect=document.getElementById('gasto-recurso');
    if(!idProyecto){
      rSelect.innerHTML='<option value="">Sin recurso específico</option>';
      return;
    }
    const recursos=Store.getCollection('recursos').filter(r=>r.idProyecto===idProyecto);
    rSelect.innerHTML='<option value="">Sin recurso específico</option>'+
      recursos.map(r=>'<option value="'+r.id+'"'+(r.id===selectedId?' selected':'')+'>'+Utils.escapeHtml(r.nombre)+'</option>').join('');
  },
  _save(){
    const data={
      idProyecto:document.getElementById('gasto-proyecto').value,
      idCategoria:document.getElementById('gasto-categoria').value,
      idRecurso:document.getElementById('gasto-recurso').value||null,
      monto:document.getElementById('gasto-monto').value,
      descripcion:document.getElementById('gasto-descripcion').value,
      fecha:document.getElementById('gasto-fecha').value,
      proveedor:document.getElementById('gasto-proveedor').value,
      estado:document.getElementById('gasto-estado').value,
    };
    if(!data.idProyecto||!data.idCategoria||!data.monto||!data.fecha||!data.proveedor){
      alert('Completa todos los campos obligatorios.');return;
    }
    if(this.editId){
      Store.updateInCollection('gastos',this.editId,data);
    }else{
      Store.addToCollection('gastos',Models.crearGasto(data));
    }
    this.close();
    document.dispatchEvent(new CustomEvent('data:change'));
  },
  render(){
    const gastos=Store.getCollection('gastos');
    const proyectos=Store.getCollection('proyectos');
    const categorias=Store.getCollection('categorias');
    const fp=this.els.filtroProyecto.value;
    const fc=this.els.filtroCategoria.value;
    const fe=this.els.filtroEstado.value;
    const fd=this.els.filtroDesde.value;
    const fh=this.els.filtroHasta.value;
    this._populateFilterSelects(proyectos,categorias);
    let filtrados=gastos.filter(g=>{
      if(fp&&g.idProyecto!==fp)return false;
      if(fc&&g.idCategoria!==fc)return false;
      if(fe&&g.estado!==fe)return false;
      if(fd&&g.fecha<fd)return false;
      if(fh&&g.fecha>fh)return false;
      return true;
    }).sort((a,b)=>b.fecha.localeCompare(a.fecha));
    if(filtrados.length===0){
      this.els.tableBody.innerHTML='<tr><td colspan="7"><div class="empty-state"><p>No se encontraron gastos</p></div></td></tr>';
      return;
    }
    this.els.tableBody.innerHTML=filtrados.map(g=>{
      const p=proyectos.find(p=>p.id===g.idProyecto);
      const c=categorias.find(c=>c.id===g.idCategoria);
      const badgeClass='estado-badge--'+g.estado;
      return '<tr>'+
        '<td>'+(p?Utils.escapeHtml(p.nombre):'?')+'</td>'+
        '<td>'+(c?'<span style="display:inline-flex;align-items:center;gap:4px"><span style="width:10px;height:10px;border-radius:2px;background:'+c.color+'"></span>'+Utils.escapeHtml(c.nombre)+'</span>':'?')+'</td>'+
        '<td class="monto">'+Utils.formatCurrency(g.monto)+'</td>'+
        '<td>'+Utils.formatDateShort(g.fecha)+'</td>'+
        '<td>'+Utils.escapeHtml(g.proveedor)+'</td>'+
        '<td><span class="estado-badge '+badgeClass+'">'+g.estado+'</span></td>'+
        '<td><button class="btn btn--ghost btn--sm" data-edit="'+g.id+'">✏️</button><button class="btn btn--ghost btn--sm" data-delete="'+g.id+'">🗑️</button></td>'+
        '</tr>';
    }).join('');
    this.els.tableBody.querySelectorAll('[data-edit]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const g=Store.getById('gastos',btn.dataset.edit);
        if(g)this.open(g);
      });
    });
    this.els.tableBody.querySelectorAll('[data-delete]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        if(confirm('¿Eliminar este gasto?')){
          Store.removeFromCollection('gastos',btn.dataset.delete);
          document.dispatchEvent(new CustomEvent('data:change'));
        }
      });
    });
  },
  _populateFilterSelects(proyectos,categorias){
    const currentP=this.els.filtroProyecto.value;
    const currentC=this.els.filtroCategoria.value;
    this.els.filtroProyecto.innerHTML='<option value="">Todos los proyectos</option>'+
      proyectos.map(p=>'<option value="'+p.id+'"'+(p.id===currentP?' selected':'')+'>'+Utils.escapeHtml(p.nombre)+'</option>').join('');
    this.els.filtroCategoria.innerHTML='<option value="">Todas las categorías</option>'+
      categorias.map(c=>'<option value="'+c.id+'"'+(c.id===currentC?' selected':'')+'>'+Utils.escapeHtml(c.nombre)+'</option>').join('');
  }
};
