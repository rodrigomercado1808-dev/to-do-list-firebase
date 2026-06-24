# TaskFlow — To-Do App con Firebase

Aplicación de lista de tareas en tiempo real desarrollada con **HTML, CSS y JavaScript puro + Firebase Firestore**, como proyecto de portfolio.

## 🔗 Demo en vivo
> Disponible al publicar en GitHub Pages (requiere configurar Firebase primero)

## ✨ Características

- ➕ **Agregar tareas** con prioridad (Alta / Normal / Baja)
- ✅ **Completar / descompletar** tareas con un click
- 🗑️ **Eliminar** tareas individuales o limpiar todas las completadas de una vez
- 🔎 **Filtros** — Todas / Pendientes / Completadas
- ⚡ **Tiempo real** — los cambios se sincronizan instantáneamente con Firebase Firestore
- 📊 **Estadísticas** de tareas totales y pendientes en el header
- 🔔 **Notificaciones toast** para cada acción
- 📱 **100% responsivo** — mobile, tablet y desktop

## 🛠️ Tecnologías

| Tecnología | Uso |
|---|---|
| HTML5 | Estructura semántica |
| CSS3 | Diseño, animaciones, responsive |
| JavaScript ES6+ (módulos) | Lógica de la app |
| Firebase Firestore | Base de datos en tiempo real |

## 📁 Estructura

```
todo-firebase/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── firebase.js
└── README.md
```

## ⚙️ Configuración de Firebase (paso a paso)

### 1. Crear proyecto en Firebase
1. Entrá a [console.firebase.google.com](https://console.firebase.google.com)
2. Click en **Agregar proyecto** → poné un nombre → Crear
3. En el menú lateral, click en **Firestore Database** → Crear base de datos → Modo de prueba → Siguiente → Crear

### 2. Registrar tu app web
1. En la pantalla principal del proyecto, click en el ícono `</>` (Web)
2. Poné un apodo a tu app → Registrar app
3. Copiá el objeto `firebaseConfig` que te muestra

### 3. Pegar la configuración
Abrí `js/firebase.js` y reemplazá el bloque `firebaseConfig` con el tuyo:

```js
const firebaseConfig = {
  apiKey:            "AIzaSy...",
  authDomain:        "mi-proyecto.firebaseapp.com",
  projectId:         "mi-proyecto",
  storageBucket:     "mi-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123...",
};
```

### 4. Listo — abrí index.html
> ⚠️ Necesitás abrirlo desde un servidor local (no doble click) porque usa módulos ES.
> Usá la extensión **Live Server** de VS Code, o ejecutá `npx serve .` en la carpeta.

## 🚀 Subir a GitHub Pages

GitHub Pages no soporta módulos ES directamente desde `file://`, pero sí desde HTTPS. Una vez que lo subas al repo y actives GitHub Pages va a funcionar perfecto.

---

*Desarrollado con ❤️ por Rodrigo Mercado — Argentina*
