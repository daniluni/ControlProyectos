# ControlProyectos — App de Control de Gastos por Recurso

SPA para gestionar proyectos, sus recursos necesarios y los gastos asociados.
Panel gerencial con información consolidada de presupuesto vs ejecución.

## Estructura

```
ControlProyectos/
  plan.md
  index.html
  css/   reset.css · variables.css · layout.css · components.css · responsive.css
  js/    utils.js · store.js · models.js · charts.js
         dashboard.js  — Panel gerencia (cards + gráficos)
         proyectos.js  — CRUD proyectos + gestión recursos inline
         gastos.js     — CRUD gastos con filtros
         app.js        — Orquestación IIFE
```

## Modelo de datos

**Proyecto**: id (uuid), nombre, descripcion, fechaInicio, fechaFin, presupuesto, estado (activo/completado/en pausa/cancelado)
**Categoría Recurso**: id (uuid), nombre, color
**Recurso**: id (uuid), idProyecto, nombre, idCategoria, cantidad, costoUnitario
**Gasto**: id (uuid), idProyecto, idRecurso (nullable), idCategoria, descripcion, monto, fecha, proveedor, estado (pendiente/aprobado/rechazado), fechaCreacion (ISO)

## Categorías Recurso (7)

Mano de Obra (#e74c3c), Materiales (#3498db), Equipos (#f39c12),
Software/Licencias (#8e44ad), Servicios (#1abc9c), Transporte (#e67e22),
Otros (#95a5a6)

## Vistas (3 tabs)

- **📊 Dashboard**: Cards (presupuesto total, total gastado, proyectos activos, % ejecución) + dona gastos por proyecto + dona presupuesto vs gastado + barras tendencia mensual
- **📋 Proyectos**: Tabla proyectos con CRUD (modal). Al seleccionar, panel inferior con recursos inline (tabla + formulario) + barra de avance presupuesto
- **💰 Gastos**: Tabla con filtros (proyecto, categoría, estado, rango fecha) + modal CRUD

## Presets

- 4 proyectos (Rediseño Web, App Móvil, Migración Cloud, Marketing Digital)
- 7 categorías recurso predefinidas
- 12 recursos distribuidos entre proyectos
- 10 gastos ejemplo (5 aprobados, 3 pendientes, 2 rechazados)
