# 🧩 Elaeht Block - AI Block Edition

**Elaeht Block** es un emocionante juego de rompecabezas minimalista y futurista para web y dispositivos móviles, inspirado en el concepto de **Block Blast**. Desafía tu mente colocando piezas geométricas en un tablero de 8x8, completa filas y columnas para destruirlas y rompe récords antes de quedarte sin espacio.

![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=flat&logo=capacitor&logoColor=white)

---

## ✨ Características Principales

* **Jugabilidad Infinita:** Mecánica clásica de arrastrar y soltar con rotaciones aleatorias para mayor dificultad.
* **Diseño "Mobile-First" (Novedad v1.2):** Interfaz optimizada con **Safe Area Padding**, evitando que el notch o la cámara frontal obstruyan los elementos del juego.
* **Atmósfera Dinámica:** El fondo cambia de tonalidades oscuras (*Slate, Blue, Zinc*) cada vez que superas hitos de 1000 puntos.
* **Sistema de Animaciones:** Efectos de escala al arrastrar, desvanecimiento en líneas completadas y una pantalla de carga temática.
* **Experiencia Sonora Completa:** Sonidos premium para colocar piezas, limpiar líneas, bonus y Game Over, con opción de silenciar desde el menú.
* **Persistencia de Datos:** Guardado automático de tu **High Score** localmente para que siempre tengas un reto pendiente.

---

## 🚀 Tecnologías Utilizadas

* **[React.js](https://react.dev/):** Lógica de componentes, hooks avanzados (`useCallback`, `useRef`) y estados complejos.
* **[Tailwind CSS](https://tailwindcss.com/):** Estilizado moderno, animaciones nativas y diseño responsivo basado en Viewport Units.
* **[dnd-kit](https://dnd-kit.com/):** Motor de alta precisión y rendimiento para la mecánica de *Drag and Drop*.
* **[Capacitor](https://capacitorjs.com/):** Integración nativa para convertir el proyecto en una App Android de alto rendimiento.

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

Para generar tu APK con la última configuración de espaciado y corrección de fondo:

1.  **Generar Build de producción:**
    ```bash
    npm run build
    ```

2.  **Sincronizar con Android Studio:**
    Copia el contenido de la carpeta `/dist` a `app/src/main/assets/www` en tu proyecto de Android.

3.  **Compilar Release:**
    En Android Studio, ve a `Build > Generate Signed Bundle / APK`, asegúrate de marcar las firmas **V1 (Jar Signature)** y **V2 (Full APK Signature)** para máxima compatibilidad.

---

## 🎮 Mecánicas de Juego

1.  **Colocación:** Arrastra las 3 piezas disponibles al tablero. El sistema mostrará una **previsualización inteligente** (blanca si es válida, roja si está obstruida).
2.  **Limpieza:** Completa filas o columnas para ganar puntos. Las líneas múltiples otorgan **bonificadores de combo**.
3.  **Evolución:** Supera los 1000, 2000, 3000 puntos... para desbloquear nuevos colores de ambiente y sonidos de bonus.
4.  **Gestión:** Usa el menú de pausa para silenciar el audio o resetear tu récord personal si deseas empezar de cero.

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**.

---

Desarrollado con pasión por **[Elaehtdev]** 🚀