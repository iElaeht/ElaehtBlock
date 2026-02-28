# 🧩 Elaeht Block

**Elaeht Block** es un emocionante juego de rompecabezas para web y dispositivos móviles, inspirado en el exitoso concepto de **Block Blast**. Desafía tu mente colocando piezas geométricas en un tablero de 8x8, completa filas y columnas para destruirlas y acumula la mayor puntuación posible antes de quedarte sin espacio.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=flat&logo=capacitor&logoColor=white)

---

## ✨ Características Principales

* **Jugabilidad Infinita:** Coloca piezas estratégicamente para limpiar el tablero.
* **Efectos Visuales Premium:** Sombras con brillo blanco (*glow*) tipo neón, transiciones suaves y fondos dinámicos que cambian según tu progreso (cada 1000 puntos).
* **Sistema de Combo y Niveles:** Gana puntos extra al limpiar múltiples líneas simultáneamente.
* **Experiencia Sonora Inmersiva:** Audio integrado para colocar piezas, limpiar líneas, bonus y Game Over.
* **Diseño Adaptive:** Totalmente responsivo, optimizado para jugar en navegadores de PC y pantallas táctiles de móviles.

---

## 🚀 Tecnologías Utilizadas

Este proyecto utiliza un stack moderno de desarrollo web para garantizar un rendimiento fluido:

* **[React.js](https://react.dev/):** Estructura de componentes y gestión de estado.
* **[Tailwind CSS](https://tailwindcss.com/):** Estilos, animaciones y efectos de iluminación.
* **[dnd-kit](https://dnd-kit.com/):** Motor de alta precisión para la mecánica de arrastrar y soltar (*Drag and Drop*).
* **[Capacitor](https://capacitorjs.com/):** Puente para convertir la Web App en una aplicación nativa Android (APK).

---

## 🛠️ Instalación y Configuración

Sigue estos pasos para ejecutar el proyecto en tu entorno local:

### Requisitos previos
* **Node.js** (versión 16 o superior)
* **npm** o **yarn**

### Pasos de ejecución
1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/tu-usuario/elaeht-block.git](https://github.com/tu-usuario/elaeht-block.git)
    cd elaeht-block
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Iniciar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

---

## 📱 Compilación para Mobile (Android APK)

Para generar el archivo ejecutable para Android, sigue estos comandos:

1.  **Generar el build de producción:**
    ```bash
    npm run build
    ```

2.  **Sincronizar con Capacitor:**
    ```bash
    npx cap copy
    npx cap sync
    ```

3.  **Abrir en Android Studio:**
    ```bash
    npx cap open android
    ```

> **Nota:** Desde Android Studio, selecciona `Build > Build Bundle(s) / APK(s) > Build APK(s)` para obtener tu archivo instalable.

---

## 🎮 Cómo Jugar

1.  **Arrastra** las piezas desde la parte inferior hacia el tablero de 8x8.
2.  **Completa** filas o columnas enteras para eliminarlas y ganar puntos.
3.  **Evoluciona:** El fondo cambiará de color cada vez que superes un hito de 1000 puntos.
4.  **Estrategia:** Si no puedes colocar ninguna de las tres piezas actuales, el juego termina. ¡Mantén el tablero despejado!

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**. Puedes usarlo, modificarlo y distribuirlo libremente.

---

Desarrollado con ❤️ por **[Elaeht]**