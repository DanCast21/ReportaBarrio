## Integrantes

Daniel Castillo y Devinson Rivaldo

## Descripción
Aplicación web con servidor Node.js + Express que permite a los vecinos registrar reportes (POST), consultarlos y filtrarlos por categoría y barrio (GET) y ver estadísticas básicas. Los datos se guardan en un arreglo en memoria (sin base de datos) y se pierden al reiniciar el servidor. Sin React ni frameworks CSS.

## ODS elegido
**ODS 11 – Ciudades y comunidades sostenibles**, metas:
- **11.1** Acceso a servicios básicos (agua, alcantarillado, alumbrado).
- **11.3** Urbanización participativa (los vecinos participan en la gestión de su entorno).
- **11.6** Reducción del impacto ambiental urbano (residuos y espacio público).

Categorías: vías y huecos, alumbrado público, residuos y basuras, agua y alcantarillado, espacio público y zonas verdes, seguridad vial.

## Instalación y ejecución

```bash
npm install
npm run dev     
npm start       
```
Abrir http://localhost:3000/

## Rutas del servidor
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Página de inicio (estática) |
| GET | `/reportar.html` | Formulario de nuevo reporte (estática) |
| GET | `/reportes` | Listado en tarjetas; filtros `?categoria=` y `?barrio=` (combinables) |
| POST | `/reportes` | Recibe el formulario (`req.body`), valida, guarda y redirige a `/reportes`; responde 400 si falta un campo |
| GET | `/estadisticas` | Conteo por categoría y por estado |
| cualquier otra | `*` | Página 404 |

Ejemplos: `/reportes?categoria=alumbrado`, `/reportes?categoria=residuos&barrio=Centro`

## Estructura

```
reportabarrio/
├── package.json
├── index.js            (servidor Express: rutas y lógica)
├── public/
│   ├── index.html
│   ├── reportar.html
│   ├── estilos.css
│   └── img/logo.svg
└── README.md
```

## Video de sustentación
Enlace: (https://youtu.be/gRYdP4aOWZc)
