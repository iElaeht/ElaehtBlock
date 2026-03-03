# 🧩 AI BLOCK - Elaeht Edition (v3.7)

**AI BLOCK** es un rompecabezas minimalista de alto rendimiento diseñado para ofrecer una experiencia táctil instantánea y visualmente envolvente. esta versión v3.7 redefine la fluidez en dispositivos móviles mediante una optimización profunda del renderizado y una interfaz ergonómica.

![Version](https://img.shields.io/badge/version-3.7.0-blue.svg)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=flat&logo=capacitor&logoColor=white)

---

## ✨ Características Principales (v3.7)

* **Motor de Arrastre Ultra-Responsivo:** Implementación de `dnd-kit` con una distancia de activación de **1px**, eliminando cualquier retraso entre el movimiento del dedo y la pieza.
* **Elevación Ergonómica (Offset):** Las piezas se posicionan **60px por encima** del punto de contacto durante el arrastre, permitiendo una visibilidad total del tablero sin que el dedo obstruya la jugada.
* **HUD Inteligente:** Puntaje de gran formato con animaciones de **Bonus (+150)** y **Multiplicadores de Combo (X2, X3...)** situados estratégicamente para no interferir con el área de juego.
* **Temas Dinámicos:** El fondo y los acentos del juego cambian automáticamente al completar líneas, manteniendo la experiencia visual fresca y motivadora.
* **Gestión de Datos:** Sistema de persistencia local para el **High Score** y configuración de preferencias (Mute, Modo Rendimiento).

---

## ⚡ Innovación: Modo Rendimiento Pro

La versión 3.7 introduce un rediseño total del **Modo Rendimiento**, ideal para sesiones competitivas o dispositivos con recursos limitados:

* **Dual-Tone Visuals:** Al activar este modo, las piezas cambian de diseños complejos a una **paleta de colores planos y minimalistas** (Mate), reduciendo la carga de dibujo de la GPU.
* **Zero Latency Engine:** Se desactivan todas las transiciones CSS y filtros de desenfoque (`backdrop-blur`), logrando una respuesta 1:1 absoluta.
* **Hardware Acceleration:** Forzado de capas mediante `will-change: transform` para evitar el re-pintado (re-paint) innecesario del DOM durante el movimiento.

---

## 🚀 Tecnologías Utilizadas

* **[React.js](https://react.dev/):** Arquitectura de componentes con `memo` y `useMemo` para evitar re-renders innecesarios.
* **[Tailwind CSS](https://tailwindcss.com/):** Estilizado de última generación con soporte para animaciones personalizadas.
* **[dnd-kit](https://dnd-kit.com/):** El estándar de oro para lógica de arrastrar y soltar en la web moderna.
* **[Capacitor](https://capacitorjs.com/):** Optimizado para empaquetado nativo en Android con rendimiento cercano al lenguaje C++.

---

## 🛠️ Instalación y Configuración

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/tu-usuario/ai-block.git](https://github.com/tu-usuario/ai-block.git)
    cd ai-block
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

Para generar el paquete optimizado de la versión 3.7:

1.  **Build de producción:**
    ```bash
    npm run build
    ```

2.  **Sincronizar:**
    ```bash
    npx cap sync android
    ```

3.  **Finalizar en Android Studio:**
    Generar el APK firmado asegurando el uso de firmas **V1 y V2** para máxima compatibilidad con dispositivos de diversas gamas.

---

## 🎮 Mecánicas de Juego

1.  **Ubicación Precisa:** El sistema de **Preview Dinámico** muestra exactamente dónde caerá la pieza. Se torna rojo si el movimiento es inválido.
2.  **Sistema de Combos:** Limpiar líneas de forma consecutiva aumenta el multiplicador, disparando el puntaje exponencialmente.
3.  **Confirmación de Seguridad:** El borrado de récords en el menú de ajustes requiere una doble confirmación para evitar pérdidas accidentales.

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**.

---

Desarrollado con pasión por **[Elaehtdev]** 🚀