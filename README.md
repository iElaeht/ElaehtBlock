# 🧩 Elaeht Block - AI Block Edition

**Elaeht Block** es un emocionante juego de rompecabezas minimalista y futurista para web y dispositivos móviles, inspirado en el concepto de **Block Blast**. Desafía tu mente colocando piezas geométricas en un tablero de 8x8, completa filas y columnas para destruirlas y rompe récords antes de quedarte sin espacio.

![Version](https://img.shields.io/badge/version-3.4.0-emerald.svg)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=flat&logo=capacitor&logoColor=white)

---

## ✨ Características Principales (v3.4)

* **Jugabilidad Infinita:** Mecánica clásica de arrastrar y soltar con generación inteligente de piezas.
* **HUD Adaptable y Ergonómico:** Interfaz diseñada con **espaciado superior preventivo** para evitar bloqueos por notificaciones del sistema o cámaras frontales en dispositivos móviles.
* **Visualización Dinámica de Puntos:** Ventana de **Bonus (+150)** y **Multiplicador de Combo** flotantes, ubicados estratégicamente al costado del puntaje para un feedback inmediato sin obstruir el juego.
* **Atmósfera Dinámica:** Cambio automático de temas y colores al superar hitos de puntaje, creando una experiencia visual inmersiva.
* **Sistema de Gestión Avanzado:** Menú de opciones completo con control de audio, reinicio rápido, salida al menú y borrado seguro de récord personal.
* **Persistencia de Datos:** Tu récord se guarda automáticamente de forma local.

---

## ⚡ Modo Rendimiento (Optimización de Hardware)

La versión 3.4 introduce un **Modo Rendimiento** alternable desde el menú, diseñado para dispositivos de gama media/baja o para usuarios que buscan la máxima precisión competitiva:

* **Latencia Cero:** Elimina las transiciones y suavizados CSS de las piezas, permitiendo un arrastre instantáneo (1:1 con el dedo o mouse).
* **Simplificación Visual:** Reduce la opacidad del preview en el tablero y elimina efectos de desenfoque (*backdrop-blur*) y sombras complejas para liberar recursos de la GPU.
* **Ahorro de Batería:** Al reducir las animaciones constantes, el consumo energético del dispositivo disminuye significativamente durante sesiones largas de juego.

---

## 🚀 Tecnologías Utilizadas

* **[React.js](https://react.dev/):** Estructura de componentes y gestión de estados complejos con Hooks.
* **[Tailwind CSS](https://tailwindcss.com/):** Estilizado moderno, animaciones fluidas y diseño responsivo móvil.
* **[dnd-kit](https://dnd-kit.com/):** Motor de alto rendimiento para la lógica de arrastrar y soltar.
* **[Capacitor](https://capacitorjs.com/):** Puente nativo para la exportación y rendimiento en Android.

---

## 🛠️ Instalación y Configuración

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/tu-usuario/elaeht-block.git](https://github.com/tu-usuario/elaeht-block.git)
    cd elaeht-block
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Iniciar en desarrollo:**
    ```bash
    npm run dev
    ```

---

## 📱 Compilación para Android (APK)

Para generar tu APK con la última configuración de la versión 3.4:

1.  **Generar Build de producción:**
    ```bash
    npm run build
    ```

2.  **Sincronizar con Capacitor:**
    ```bash
    npx cap sync android
    ```

3.  **Compilar Release:**
    En Android Studio, utiliza `Build > Generate Signed Bundle / APK`. Asegúrate de usar firmas **V1** y **V2** para compatibilidad con versiones antiguas de Android.

---

## 🎮 Mecánicas de Juego

1.  **Colocación:** Arrastra las piezas al tablero. El sistema mostrará un **Preview sutil** (blanco si encaja, rojo si está bloqueado).
2.  **Combos:** Limpia múltiples filas o columnas simultáneamente o de forma consecutiva para activar el multiplicador de combo.
3.  **Ventana de Bonus:** Los puntos extra aparecerán flotando al lado del score principal con una animación de desvanecimiento hacia arriba.
4.  **Gestión de Récords:** En el menú de ajustes, puedes borrar tu récord histórico mediante una confirmación roja de seguridad.

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**.

---

Desarrollado con pasión por **[Elaehtdev]** 🚀