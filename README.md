# Pokédex 

Una aplicación web moderna y responsive para explorar el mundo Pokémon con múltiples opciones de búsqueda y un diseño elegante.

## Características

### 🔎 Múltiples Formas de Búsqueda
- **Por ID**: Busca Pokémon por su número de Pokédex (1-1010)
- **Por Nombre**: Encuentra cualquier Pokémon escribiendo su nombre
- **Por Tipo**: Filtra Pokémon por tipo único o combinación de dos tipos
- **Aleatorio**: Descubre Pokémon sorpresa con un solo clic

### 🎨 Diseño Moderno
- **Interfaz con pestañas**: Navegación intuitiva entre diferentes métodos de búsqueda
- **Tarjetas elegantes**: Información del Pokémon presentada en tarjetas estilizadas con gradientes azul/gris
- **Responsive**: Diseño optimizado para desktop, tablet y móvil
- **Efectos visuales**: Animaciones suaves, hover effects y glassmorphism

### 📱 Optimización Móvil
- **Layout adaptativo**: Grid que se reorganiza automáticamente en pantallas pequeñas
- **Información agrupada**: Datos organizados en secciones lógicas (Información Básica, Características, Habilidades)
- **Controles táctiles**: Botones y dropdowns optimizados para dispositivos móviles

### 🏷️ Información Completa del Pokémon
- **Datos básicos**: Nombre, ID, tipos con colores oficiales
- **Características físicas**: Altura, peso
- **Habilidades**: Lista completa de habilidades
- **Estadísticas**: Todas las stats base en formato de cuadrícula
- **Imagen oficial**: Sprite del Pokémon desde la PokéAPI

## Tecnologías Utilizadas

- **HTML5**: Estructura semántica y accesible
- **CSS3**: 
  - Flexbox y CSS Grid para layouts responsive
  - Gradientes y efectos visuales modernos
  - Media queries para diferentes dispositivos
  - Animaciones y transiciones CSS
- **JavaScript ES6+**:
  - Async/await para manejo de APIs
  - Fetch API para peticiones HTTP
  - Manipulación del DOM
  - Event listeners y manejo de eventos

## API Utilizada

- **[PokéAPI](https://pokeapi.co/)**: API RESTful gratuita con información completa de Pokémon
  - Endpoints utilizados:
    - `/pokemon/{id}` - Información individual del Pokémon
    - `/type/` - Lista de todos los tipos
    - `/type/{type}` - Pokémon por tipo específico

## Estructura del Proyecto

```
team_pokedex/
├── index.html          # Estructura HTML principal
├── styles.css          # Estilos CSS con diseño responsive
├── script.js           # Lógica JavaScript y manejo de API
└── README.md          # Documentación del proyecto
```

## Funcionalidades Detalladas

### Búsqueda por ID
- Rango válido: 1-1010 Pokémon
- Validación de entrada
- Mensajes de error informativos

### Búsqueda por Nombre
- Búsqueda case-insensitive
- Manejo de errores para nombres no encontrados

### Búsqueda por Tipo
- **Tipo simple**: Muestra todos los Pokémon de un tipo específico
- **Doble tipo**: Encuentra Pokémon que tienen ambos tipos seleccionados
- **Sin límites**: Muestra todos los resultados (no hay límite de 20)
- **Tarjetas interactivas**: Click en cualquier tarjeta para ver detalles completos

### Pokémon Aleatorio
- Generación aleatoria entre los 1010 Pokémon disponibles
- Perfecto para descubrir nuevos Pokémon

## 📝 Notas del Desarrollador

Este proyecto fue desarrollado con enfoque en:
- **Código limpio**: JavaScript modular y CSS organizado
- **Responsive design**: Mobile-first approach
- **Experiencia de usuario**: Interfaz intuitiva y atractiva
- **Performance**: Peticiones optimizadas a la API

---

**¡Explora, descubre y diviértete con tu nueva Pokédex!**
