const Models={
  defaultCategorias:[
    {id:'cat-1',nombre:'Mano de Obra',color:'#e74c3c'},
    {id:'cat-2',nombre:'Materiales',color:'#3498db'},
    {id:'cat-3',nombre:'Equipos',color:'#f39c12'},
    {id:'cat-4',nombre:'Software/Licencias',color:'#8e44ad'},
    {id:'cat-5',nombre:'Servicios',color:'#1abc9c'},
    {id:'cat-6',nombre:'Transporte',color:'#e67e22'},
    {id:'cat-7',nombre:'Otros',color:'#95a5a6'},
  ],
  PRESET_PROYECTOS:[
    {id:'proy-1',nombre:'Rediseño Web Corporativo',descripcion:'Rediseño completo del sitio web corporativo con nuevo branding',fechaInicio:'2026-06-01',fechaFin:'2026-08-31',presupuesto:15000000,estado:'activo'},
    {id:'proy-2',nombre:'Desarrollo App Móvil',descripcion:'Aplicación móvil para clientes con catálogo y pedidos',fechaInicio:'2026-05-01',fechaFin:'2026-10-31',presupuesto:25000000,estado:'activo'},
    {id:'proy-3',nombre:'Migración Infraestructura Cloud',descripcion:'Migración de servidores on-premise a AWS',fechaInicio:'2026-03-01',fechaFin:'2026-04-30',presupuesto:10000000,estado:'completado'},
    {id:'proy-4',nombre:'Campaña Marketing Digital',descripcion:'Campaña de marketing digital para lanzamiento de producto',fechaInicio:'2026-07-01',fechaFin:'2026-07-31',presupuesto:8000000,estado:'en pausa'},
  ],
  PRESET_RECURSOS:[
    {idProyecto:'proy-1',nombre:'Diseñador UX/UI',idCategoria:'cat-1',cantidad:1,costoUnitario:1500000},
    {idProyecto:'proy-1',nombre:'Desarrollador Frontend',idCategoria:'cat-1',cantidad:2,costoUnitario:2000000},
    {idProyecto:'proy-1',nombre:'Licencia Figma',idCategoria:'cat-4',cantidad:1,costoUnitario:300000},
    {idProyecto:'proy-2',nombre:'Desarrollador Mobile',idCategoria:'cat-1',cantidad:2,costoUnitario:2500000},
    {idProyecto:'proy-2',nombre:'Backend Developer',idCategoria:'cat-1',cantidad:1,costoUnitario:2000000},
    {idProyecto:'proy-2',nombre:'Servidor Cloud',idCategoria:'cat-5',cantidad:1,costoUnitario:500000},
    {idProyecto:'proy-2',nombre:'Licencia API Maps',idCategoria:'cat-4',cantidad:1,costoUnitario:200000},
    {idProyecto:'proy-3',nombre:'Ingeniero Cloud',idCategoria:'cat-1',cantidad:2,costoUnitario:1800000},
    {idProyecto:'proy-3',nombre:'Herramientas Migración',idCategoria:'cat-5',cantidad:1,costoUnitario:600000},
    {idProyecto:'proy-4',nombre:'Community Manager',idCategoria:'cat-1',cantidad:1,costoUnitario:1000000},
    {idProyecto:'proy-4',nombre:'Facebook Ads',idCategoria:'cat-5',cantidad:1,costoUnitario:800000},
    {idProyecto:'proy-4',nombre:'Equipo Streaming',idCategoria:'cat-3',cantidad:1,costoUnitario:400000},
  ],
  PRESET_GASTOS:[
    {idProyecto:'proy-1',idRecurso:'rec-2',idCategoria:'cat-1',monto:2000000,descripcion:'Sueldo Desarrollador Frontend Junio',fecha:'2026-06-15',proveedor:'Freelancer',estado:'aprobado'},
    {idProyecto:'proy-1',idRecurso:'rec-1',idCategoria:'cat-1',monto:1500000,descripcion:'Sueldo Diseñador UX/UI Junio',fecha:'2026-06-10',proveedor:'Freelancer',estado:'aprobado'},
    {idProyecto:'proy-2',idRecurso:'rec-4',idCategoria:'cat-1',monto:2500000,descripcion:'Sueldo Desarrollador Mobile Junio',fecha:'2026-06-20',proveedor:'Agencia',estado:'pendiente'},
    {idProyecto:'proy-2',idRecurso:'rec-6',idCategoria:'cat-5',monto:500000,descripcion:'Servidor Cloud mes Junio',fecha:'2026-06-01',proveedor:'AWS',estado:'aprobado'},
    {idProyecto:'proy-2',idRecurso:'rec-7',idCategoria:'cat-4',monto:200000,descripcion:'Licencia API Google Maps',fecha:'2026-05-15',proveedor:'Google',estado:'aprobado'},
    {idProyecto:'proy-3',idRecurso:'rec-8',idCategoria:'cat-1',monto:3600000,descripcion:'Honorarios Ingenieros Cloud',fecha:'2026-04-30',proveedor:'Consultora',estado:'aprobado'},
    {idProyecto:'proy-3',idRecurso:'rec-9',idCategoria:'cat-5',monto:600000,descripcion:'Herramientas migración datos',fecha:'2026-04-15',proveedor:'CloudMove',estado:'aprobado'},
    {idProyecto:'proy-4',idRecurso:'rec-10',idCategoria:'cat-1',monto:500000,descripcion:'Adelanto Community Manager',fecha:'2026-06-25',proveedor:'Freelancer',estado:'pendiente'},
    {idProyecto:'proy-1',idRecurso:null,idCategoria:'cat-3',monto:250000,descripcion:'Monitor 4K equipo diseño',fecha:'2026-06-22',proveedor:'PC Factory',estado:'pendiente'},
    {idProyecto:'proy-4',idRecurso:'rec-11',idCategoria:'cat-5',monto:800000,descripcion:'Campaña Facebook Ads Junio',fecha:'2026-06-28',proveedor:'Meta',estado:'rechazado'},
  ],
  initDefaults(){
    if(!Store.get('proyectos')){
      Store.set('proyectos',this.PRESET_PROYECTOS);
    }
    if(!Store.get('categorias')){
      Store.set('categorias',this.defaultCategorias);
    }
    if(!Store.get('recursos')){
      const recursos=this.PRESET_RECURSOS.map((r,i)=>({
        id:'rec-'+(i+1),
        ...r
      }));
      Store.set('recursos',recursos);
    }
    if(!Store.get('gastos')){
      const gastos=this.PRESET_GASTOS.map((g,i)=>({
        id:'gasto-'+(i+1),
        ...g,
        fechaCreacion:new Date().toISOString()
      }));
      Store.set('gastos',gastos);
    }
  },
  crearProyecto(data){
    return{
      id:Utils.uuid(),
      nombre:data.nombre.trim(),
      descripcion:data.descripcion.trim(),
      fechaInicio:data.fechaInicio,
      fechaFin:data.fechaFin,
      presupuesto:Number(data.presupuesto),
      estado:data.estado||'activo'
    };
  },
  crearRecurso(data){
    return{
      id:Utils.uuid(),
      idProyecto:data.idProyecto,
      nombre:data.nombre.trim(),
      idCategoria:data.idCategoria,
      cantidad:Number(data.cantidad),
      costoUnitario:Number(data.costoUnitario)
    };
  },
  crearGasto(data){
    return{
      id:Utils.uuid(),
      idProyecto:data.idProyecto,
      idRecurso:data.idRecurso||null,
      idCategoria:data.idCategoria,
      monto:Number(data.monto),
      descripcion:data.descripcion.trim(),
      fecha:data.fecha,
      proveedor:data.proveedor.trim(),
      estado:data.estado||'pendiente',
      fechaCreacion:new Date().toISOString()
    };
  }
};
