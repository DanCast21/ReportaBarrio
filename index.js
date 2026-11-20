const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

const CATEGORIAS = {
  vias: 'Vías y huecos',
  alumbrado: 'Alumbrado público',
  residuos: 'Residuos y basuras',
  agua: 'Agua y alcantarillado',
  'espacio-publico': 'Espacio público y zonas verdes',
  'seguridad-vial': 'Seguridad vial'
};
const BARRIOS = ['Centro', 'El Prado', 'Boston', 'Villa Campestre', 'Barrio Abajo', 'Ciudad Jardín', 'Rebolo', 'Simón Bolívar'];
const URGENCIAS = ['baja', 'media', 'alta'];
const ESTADOS = ['Pendiente', 'En revisión', 'Resuelto'];

const hace = (horas) => new Date(Date.now() - horas * 3600 * 1000).toISOString();
const reportes = [
  {
    id: 1,
    titulo: 'Vias con huecos',
    categoria: 'vias',
    barrio: 'Centro',
    descripcion: 'Hueco de unos 50 cm que ya dañó varios vehículos y es peligroso para los motociclistas.',
    urgencia: 'alta',
    contacto: 'vecino1@correo.com',
    fecha: hace(5),
    estado: 'Pendiente'
  },
  {
    id: 2,
    titulo: 'Falta de iluminación',
    categoria: 'alumbrado',
    barrio: 'El Prado',
    descripcion: 'Tres focos del parque llevan una semana apagadas y en la noche el sector queda muy oscuro.',
    urgencia: 'media',
    contacto: '3001234567',
    fecha: hace(30),
    estado: 'En revisión'
  },
  {
    id: 3,
    titulo: 'Acumulación de basura',
    categoria: 'residuos',
    barrio: 'Caribe Verde',
    descripcion: 'El camión no pasa hace días y la basura bloquea parte del andén.',
    urgencia: 'media',
    contacto: 'vecino3@correo.com',
    fecha: hace(52),
    estado: 'Pendiente'
  },
  {
    id: 4,
    titulo: 'Fuga de agua',
    categoria: 'agua',
    barrio: 'Boston',
    descripcion: 'Sale agua limpia por una tubería rota desde la madrugada y se desperdicia mucha agua.',
    urgencia: 'alta',
    contacto: '3109876543',
    fecha: hace(75),
    estado: 'En revisión'
  },
  {
    id: 5,
    titulo: 'Semáforo Defectuoso',
    categoria: 'seguridad-vial',
    barrio: 'Ciudadela 20 de Julio',
    descripcion: 'El semáforo frente al colegio no enciende y es peligroso para los niños que tienen que cruzar la calle.',
    urgencia: 'alta',
    contacto: 'vecino5@correo.com',
    fecha: hace(100),
    estado: 'Resuelto'
  },
  {
    id: 6,
    titulo: 'Escombros en el parque',
    categoria: 'espacio-publico',
    barrio: 'Barrio Abajo',
    descripcion: 'Hay escombros de construccion en el parque y las personas no pueden usarlo.',
    urgencia: 'alta',
    contacto: 'vecino6@correo.com',
    fecha: hace(150),
    estado: 'Resuelto'
  }
];
let siguienteId = reportes.length + 1;

function esc(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function formatearFecha(iso) {
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

function claseEstado(estado) {
  return { 'Pendiente': 'pendiente', 'En revisión': 'revision', 'Resuelto': 'resuelto' }[estado];
}

function pagina(titulo, activa, contenido) {
  const enlaces = [
    ['/', 'Inicio', 'inicio'],
    ['/reportar.html', 'Reportar', 'reportar'],
    ['/reportes', 'Reportes', 'reportes'],
    ['/estadisticas', 'Estadísticas', 'estadisticas']
  ].map(([href, texto, clave]) =>
    `<a href="${href}"${clave === activa ? ' class="activo" aria-current="page"' : ''}>${texto}</a>`
  ).join('\n        ');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(titulo)} · ReportaBarrio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/estilos.css">
</head>
<body>
  <header class="encabezado">
    <div class="encabezado-interior">
      <a class="logo" href="/"><img src="/img/logo.svg" alt="" width="36" height="36"><span>ReportaBarrio</span></a>
      <nav class="menu" aria-label="Navegación principal">
        ${enlaces}
      </nav>
    </div>
  </header>
  <main>
${contenido}
  </main>
  <footer class="pie">
    <div class="contenedor pie-interior">
      <p><strong>ReportaBarrio</strong> · Proyecto de aula de Tecnologías Web · ODS 11</p>
    </div>
  </footer>
</body>
</html>`;
}

function opciones(lista, seleccionado, esObjeto = false) {
  const items = esObjeto ? Object.entries(lista) : lista.map((x) => [x, x]);
  return items.map(([valor, texto]) =>
    `<option value="${esc(valor)}"${valor === seleccionado ? ' selected' : ''}>${esc(texto)}</option>`
  ).join('');
}

app.get('/reportes', (req, res) => {
  const categoria = (req.query.categoria || '').trim();
  const barrio = (req.query.barrio || '').trim();

  let lista = reportes;
  if (categoria) lista = lista.filter((r) => r.categoria === categoria);
  if (barrio) lista = lista.filter((r) => r.barrio.toLowerCase() === barrio.toLowerCase());
  lista = [...lista].sort((a, b) => b.id - a.id);

  const tarjetas = lista.map((r) => `
        <article class="tarjeta">
          <div class="tarjeta-cabecera">
            <span class="etiqueta">${esc(CATEGORIAS[r.categoria])}</span>
            <span class="urgencia urgencia-${r.urgencia}">Urgencia ${r.urgencia}</span>
          </div>
          <h3>${esc(r.titulo)}</h3>
          <p class="ubicacion">📍 ${esc(r.barrio)}</p>
          <p>${esc(r.descripcion)}</p>
          <div class="tarjeta-pie">
            <span class="estado estado-${claseEstado(r.estado)}">${esc(r.estado)}</span>
            <time datetime="${r.fecha}">${formatearFecha(r.fecha)}</time>
          </div>
        </article>`).join('');

  const hayFiltros = categoria || barrio;
  const vacio = `
        <div class="mensaje-vacio">
          <p><strong>No hay reportes</strong> que cumplan los filtros seleccionados.</p>
          <a class="boton boton-secundario" href="/reportes">Quitar filtros</a>
        </div>`;

  const contenido = `
    <section class="cabecera-pagina">
      <div class="contenedor">
        <h1>Reportes del barrio</h1>
        <p>Filtra los problemas reportados por categoría y barrio.</p>
      </div>
    </section>
    <section class="contenedor">
      <form class="filtros" action="/reportes" method="GET">
        <div class="campo">
          <label for="categoria">Categoría</label>
          <select id="categoria" name="categoria">
            <option value="">Todas las categorías</option>
            ${opciones(CATEGORIAS, categoria, true)}
          </select>
        </div>
        <div class="campo">
          <label for="barrio">Barrio</label>
          <select id="barrio" name="barrio">
            <option value="">Todos los barrios</option>
            ${opciones(BARRIOS, BARRIOS.find((b) => b.toLowerCase() === barrio.toLowerCase()) || '')}
          </select>
        </div>
        <button class="boton" type="submit">Filtrar</button>
        ${hayFiltros ? '<a class="boton boton-secundario" href="/reportes">Limpiar</a>' : ''}
      </form>
      <p class="contador" aria-live="polite">Mostrando <strong>${lista.length}</strong> de ${reportes.length} reportes</p>
      <div class="cuadricula-tarjetas">${lista.length ? tarjetas : vacio}
      </div>
    </section>`;
  res.send(pagina('Reportes', 'reportes', contenido));
});

app.post('/reportes', (req, res) => {
  const { titulo, categoria, barrio, descripcion, urgencia, contacto } = req.body;
  const errores = [];

  if (!titulo || !titulo.trim()) errores.push('El título es obligatorio.');
  if (!categoria || !CATEGORIAS[categoria]) errores.push('Debes seleccionar una categoría válida.');
  if (!barrio || !barrio.trim()) errores.push('Debes indicar el barrio.');
  if (!descripcion || !descripcion.trim()) errores.push('La descripción es obligatoria.');
  if (!urgencia || !URGENCIAS.includes(urgencia)) errores.push('Debes elegir el nivel de urgencia (baja, media o alta).');
  if (!contacto || !contacto.trim()) {
    errores.push('El medio de contacto (correo o teléfono) es obligatorio.');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacto.trim()) && !/^[+\d][\d\s-]{6,}$/.test(contacto.trim())) {
    errores.push('El contacto debe ser un correo electrónico o un teléfono válido.');
  }

  if (errores.length > 0) {
    const contenido = `
    <section class="contenedor contenedor-estrecho">
      <div class="alerta-error" role="alert">
        <h1>No se pudo guardar el reporte</h1>
        <p>Corrige lo siguiente e inténtalo de nuevo:</p>
        <ul>${errores.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>
        <a class="boton" href="/reportar.html">Volver al formulario</a>
      </div>
    </section>`;
    return res.status(400).send(pagina('Error en el reporte', 'reportar', contenido));
  }

  reportes.push({
    id: siguienteId++,
    titulo: titulo.trim(),
    categoria,
    barrio: barrio.trim(),
    descripcion: descripcion.trim(),
    urgencia,
    contacto: contacto.trim(),
    fecha: new Date().toISOString(),
    estado: 'Pendiente'
  });
  res.redirect('/reportes');
});

app.get('/estadisticas', (req, res) => {
  const total = reportes.length;
  const porCategoria = Object.entries(CATEGORIAS).map(([clave, nombre]) => ({
    nombre,
    cantidad: reportes.filter((r) => r.categoria === clave).length
  }));
  const porEstado = ESTADOS.map((estado) => ({
    estado,
    cantidad: reportes.filter((r) => r.estado === estado).length
  }));
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);

  const filasCategoria = porCategoria.map((c) => `
        <li class="barra-fila">
          <div class="barra-texto"><span>${esc(c.nombre)}</span><span><strong>${c.cantidad}</strong> · ${pct(c.cantidad)}%</span></div>
          <div class="barra"><div class="barra-relleno" style="width: ${pct(c.cantidad)}%"></div></div>
        </li>`).join('');

  const tarjetasEstado = porEstado.map((e) => `
        <article class="kpi kpi-${claseEstado(e.estado)}">
          <p class="kpi-etiqueta">${e.estado}</p>
          <p class="kpi-numero">${e.cantidad}</p>
          <p class="kpi-detalle">${pct(e.cantidad)}% del total</p>
        </article>`).join('');

  const contenido = `
    <section class="cabecera-pagina">
      <div class="contenedor">
        <h1>Estadísticas del barrio</h1>
        <p>Reportes registrados por estado y por categoría.</p>
      </div>
    </section>
    <section class="contenedor">
      <div class="cuadricula-kpi">
        <article class="kpi kpi-total">
          <p class="kpi-etiqueta">Total de reportes</p>
          <p class="kpi-numero">${total}</p>
          <p class="kpi-detalle">Registrados en la plataforma</p>
        </article>${tarjetasEstado}
      </div>
    </section>
    <section class="contenedor seccion-estadisticas">
      <article class="panel">
        <h2>Reportes por categoría</h2>
        <ul class="lista-barras">${filasCategoria}
        </ul>
      </article>
    </section>`;
  res.send(pagina('Estadísticas', 'estadisticas', contenido));
});

app.get('/reportar', (req, res) => {
  res.redirect('/reportar.html');
});

app.use((req, res) => {
  const contenido = `
    <section class="contenedor contenedor-estrecho">
      <div class="alerta-404">
        <p class="codigo-404">404</p>
        <h1>Página no encontrada</h1>
        <p>La ruta <code>${esc(req.originalUrl)}</code> no existe en ReportaBarrio.</p>
        <a class="boton" href="/">Volver al inicio</a>
      </div>
    </section>`;
  res.status(404).send(pagina('Página no encontrada', '', contenido));
});

app.listen(PORT, () => {
  console.log(`ReportaBarrio funcionando en http://localhost:${PORT}`);
});
