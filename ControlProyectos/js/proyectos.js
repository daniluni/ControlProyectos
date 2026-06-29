const Proyectos={
  els:{},selectedId:null,editId:null,editRecId:null,
  init(){
    this.els.modal=document.getElementById('proyecto-modal');
    this.els.form=document.getElementById('proyecto-form');
    this.els.openBtn=document.getElementById('proy-nuevo-btn');
    this.els.closeBtn=this.els.modal.querySelector('.modal-close');
    this.els.cancelBtn=this.els.modal.querySelector('.btn--ghost');
    this.els.modalTitle=this.els.modal.querySelector('.modal-header h2');
    this.els.tableBody=document.getElementById('proyectos-tbody');
    this.els.detalle=document.getElementById('proyecto-detalle');
    this.els.detalleTitle=document.getElementById('proy-detalle-title');
    this.els.progresoFill=document.getElementById('proy-progreso-fill');
    this.els.progresoLabel=document.getElementById('proy-progreso-label');
    this.els.progresoText=document.getElementById('proy-progreso-text');
    this.els.recursosBody=document.getElementById('recursos-tbody');
    this.els.recursoForm=document.getElementById('recurso-form');
    this.els.recNuevoBtn=document.getElementById('rec-nuevo-btn');
    this.els.recCancelBtn=document.getElementById('rec-cancel-btn');
    this.els.recFormTitle=document.getElementById('rec-form-title');
    this._bindEvents();
  },
  _bindEvents(){
    this.els.openBtn.addEventListener('click',()=>this._openProyectoModal());
    this.els.closeBtn.addEventListener('click',()=>this._closeProyectoModal());
    this.els.cancelBtn.addEventListener('click',()=>this._closeProyectoModal());
    this.els.modal.addEventListener('click',e=>{if(e.target===this.els.modal)this._closeProyectoModal()});
    this.els.form.addEventListener('submit',e=>{e.preventDefault();this._saveProyecto()});
    this.els.recNuevoBtn.addEventListener('click',()=>this._openRecursoForm());
    this.els.recCancelBtn.addEventListener('click',()=>this._closeRecursoForm());
    this.els.recursoForm.addEventListener('submit',e=>{e.preventDefault();this._saveRecurso()});
  },
  render(){
    this._renderProyectos();
    if(this.selectedId)this._renderDetalle(this.selectedId);
  },
  _renderProyectos(){
    const proyectos=Store.getCollection('proyectos');
    const gastos=Store.getCollection('gastos');
    if(proyectos.length===0){
      this.els.tableBody.innerHTML='<tr><td colspan="6"><div class="empty-state"><p>No hay proyectos registrados</p></div></td></tr>';
      return;
    }
    this.els.tableBody.innerHTML=proyectos.map(p=>{
      const gastado=gastos.filter(g=>g.idProyecto===p.id&&g.estado==='aprobado').reduce((s,g)=>s+g.monto,0);
      const pct=p.presupuesto>0?Math.round(gastado/p.presupuesto*100):0;
      const badgeClass='estado-badge--'+p.estado.replace(' ','\\ ');
      const isSelected=this.selectedId===p.id;
      return '<tr class="'+(isSelected?'selected ':'')+'clickable" data-select="'+p.id+'">'+
        '<td>'+Utils.escapeHtml(p.nombre)+'</td>'+
        '<td class="monto">'+Utils.formatCurrency(p.presupuesto)+'</td>'+
        '<td class="monto">'+Utils.formatCurrency(gastado)+'</td>'+
        '<td><div style="display:flex;align-items:center;gap:8px"><div class="progreso-track" style="flex:1;height:8px"><div class="progreso-fill" style="width:'+pct+'%;height:100%;border-radius:999px"></div></div><span style="font-size:12px">'+pct+'%</span></div></td>'+
        '<td><span class="estado-badge '+badgeClass+'">'+p.estado+'</span></td>'+
        '<td><button class="btn btn--ghost btn--sm" data-edit="'+p.id+'">✏️</button><button class="btn btn--ghost btn--sm" data-delete="'+p.id+'">🗑️</button></td>'+
        '</tr>';
    }).join('');
    this.els.tableBody.querySelectorAll('[data-select]').forEach(tr=>{
      tr.addEventListener('click',e=>{
        if(e.target.closest('button'))return;
        this.selectedId=tr.dataset.select;
        this._renderDetalle(this.selectedId);
        this._renderProyectos();
      });
    });
    this.els.tableBody.querySelectorAll('[data-edit]').forEach(btn=>{
      btn.addEventListener('click',e=>{e.stopPropagation();const p=Store.getById('proyectos',btn.dataset.edit);if(p)this._openProyectoModal(p)});
    });
    this.els.tableBody.querySelectorAll('[data-delete]').forEach(btn=>{
      btn.addEventListener('click',e=>{
        e.stopPropagation();
        if(confirm('¿Eliminar este proyecto? También se eliminarán sus recursos.')){
          Store.removeFromCollection('proyectos',btn.dataset.delete);
          const recursos=Store.getCollection('recursos').filter(r=>r.idProyecto!==btn.dataset.delete);
          Store.set('recursos',recursos);
          if(this.selectedId===btn.dataset.delete){this.selectedId=null;this.els.detalle.classList.add('hidden')}
          document.dispatchEvent(new CustomEvent('data:change'));
        }
      });
    });
  },
  _renderDetalle(id){
    const proyecto=Store.getById('proyectos',id);
    if(!proyecto){this.els.detalle.classList.add('hidden');return}
    this.els.detalle.classList.remove('hidden');
    const gastos=Store.getCollection('gastos');
    const gastado=gastos.filter(g=>g.idProyecto===id&&g.estado==='aprobado').reduce((s,g)=>s+g.monto,0);
    const disponible=Math.max(0,proyecto.presupuesto-gastado);
    const pct=proyecto.presupuesto>0?Math.round(gastado/proyecto.presupuesto*100):0;
    this.els.detalleTitle.textContent=Utils.escapeHtml(proyecto.nombre)+' — Detalle del Proyecto';
    const pctClass=pct>=90?'danger':pct>=70?'warning':'';
    this.els.progresoFill.style.width=pct+'%';
    this.els.progresoFill.className='progreso-fill'+(pctClass?' '+pctClass:'');
    this.els.progresoLabel.innerHTML=
      '<span><strong>Presupuesto:</strong> '+Utils.formatCurrency(proyecto.presupuesto)+'</span>'+
      '<span><strong>Gastado:</strong> '+Utils.formatCurrency(gastado)+'</span>'+
      '<span><strong>Disponible:</strong> '+Utils.formatCurrency(disponible)+'</span>';
    this.els.progresoText.textContent=pct+'% de ejecución';
    this._renderRecursos(id);
  },
  _renderRecursos(idProyecto){
    const recursos=Store.getCollection('recursos').filter(r=>r.idProyecto===idProyecto);
    const categorias=Store.getCollection('categorias');
    if(recursos.length===0){
      this.els.recursosBody.innerHTML='<tr><td colspan="6"><div class="empty-state"><p>No hay recursos en este proyecto</p></div></td></tr>';
      return;
    }
    this.els.recursosBody.innerHTML=recursos.map(r=>{
      const c=categorias.find(c=>c.id===r.idCategoria);
      const total=r.cantidad*r.costoUnitario;
      return '<tr>'+
        '<td>'+Utils.escapeHtml(r.nombre)+'</td>'+
        '<td>'+(c?'<span style="display:inline-flex;align-items:center;gap:4px"><span style="width:10px;height:10px;border-radius:2px;background:'+c.color+'"></span>'+Utils.escapeHtml(c.nombre)+'</span>':'?')+'</td>'+
        '<td>'+r.cantidad+'</td>'+
        '<td class="monto">'+Utils.formatCurrency(r.costoUnitario)+'</td>'+
        '<td class="monto">'+Utils.formatCurrency(total)+'</td>'+
        '<td><button class="btn btn--ghost btn--sm" data-editrec="'+r.id+'">✏️</button><button class="btn btn--ghost btn--sm" data-deleterec="'+r.id+'">🗑️</button></td>'+
        '</tr>';
    }).join('');
    this.els.recursosBody.querySelectorAll('[data-editrec]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const r=Store.getCollection('recursos').find(rec=>rec.id===btn.dataset.editrec);
        if(r)this._openRecursoForm(r);
      });
    });
    this.els.recursosBody.querySelectorAll('[data-deleterec]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        if(confirm('¿Eliminar este recurso?')){
          Store.removeFromCollection('recursos',btn.dataset.deleterec);
          this._renderRecursos(idProyecto);
          document.dispatchEvent(new CustomEvent('data:change'));
        }
      });
    });
  },
  _openProyectoModal(proyecto){
    this.editId=proyecto?proyecto.id:null;
    this.els.modalTitle.textContent=proyecto?'Editar Proyecto':'Nuevo Proyecto';
    document.getElementById('proy-nombre').value=proyecto?proyecto.nombre:'';
    document.getElementById('proy-descripcion').value=proyecto?proyecto.descripcion:'';
    document.getElementById('proy-fecha-inicio').value=proyecto?proyecto.fechaInicio:'';
    document.getElementById('proy-fecha-fin').value=proyecto?proyecto.fechaFin:'';
    document.getElementById('proy-presupuesto').value=proyecto?proyecto.presupuesto:'';
    document.getElementById('proy-estado').value=proyecto?proyecto.estado:'activo';
    this.els.modal.classList.add('active');
  },
  _closeProyectoModal(){
    this.els.modal.classList.remove('active');
    this.editId=null;
    this.els.form.reset();
  },
  _saveProyecto(){
    const data={
      nombre:document.getElementById('proy-nombre').value,
      descripcion:document.getElementById('proy-descripcion').value,
      fechaInicio:document.getElementById('proy-fecha-inicio').value,
      fechaFin:document.getElementById('proy-fecha-fin').value,
      presupuesto:document.getElementById('proy-presupuesto').value,
      estado:document.getElementById('proy-estado').value,
    };
    if(!data.nombre||!data.fechaInicio||!data.fechaFin||!data.presupuesto){
      alert('Completa todos los campos obligatorios.');return;
    }
    if(this.editId){
      Store.updateInCollection('proyectos',this.editId,data);
    }else{
      Store.addToCollection('proyectos',Models.crearProyecto(data));
    }
    this._closeProyectoModal();
    document.dispatchEvent(new CustomEvent('data:change'));
  },
  _openRecursoForm(recurso){
    this.editRecId=recurso?recurso.id:null;
    this.els.recFormTitle.textContent=recurso?'Editar Recurso':'Nuevo Recurso';
    document.getElementById('rec-nombre').value=recurso?recurso.nombre:'';
    document.getElementById('rec-cantidad').value=recurso?recurso.cantidad:1;
    document.getElementById('rec-costo').value=recurso?recurso.costoUnitario:'';
    const catSelect=document.getElementById('rec-categoria');
    const categorias=Store.getCollection('categorias');
    catSelect.innerHTML=categorias.map(c=>
      '<option value="'+c.id+'"'+(recurso&&recurso.idCategoria===c.id?' selected':'')+'>'+Utils.escapeHtml(c.nombre)+'</option>'
    ).join('');
    this.els.recursoForm.classList.remove('hidden');
  },
  _closeRecursoForm(){
    this.els.recursoForm.classList.add('hidden');
    this.editRecId=null;
    document.getElementById('rec-nombre').value='';
    document.getElementById('rec-cantidad').value=1;
    document.getElementById('rec-costo').value='';
  },
  _saveRecurso(){
    if(!this.selectedId){alert('Selecciona un proyecto primero.');return}
    const nombre=document.getElementById('rec-nombre').value.trim();
    const idCategoria=document.getElementById('rec-categoria').value;
    const cantidad=document.getElementById('rec-cantidad').value;
    const costoUnitario=document.getElementById('rec-costo').value;
    if(!nombre||!idCategoria||!cantidad||!costoUnitario){
      alert('Completa todos los campos.');return;
    }
    const data={idProyecto:this.selectedId,nombre,idCategoria,cantidad:Number(cantidad),costoUnitario:Number(costoUnitario)};
    if(this.editRecId){
      Store.updateInCollection('recursos',this.editRecId,data);
    }else{
      Store.addToCollection('recursos',Models.crearRecurso(data));
    }
    this._closeRecursoForm();
    this._renderRecursos(this.selectedId);
    document.dispatchEvent(new CustomEvent('data:change'));
  }
};
