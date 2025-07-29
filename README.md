# Mikel - Bóveda de Información Inteligente

Mikel es una bóveda de información segura e inteligente construida con Next.js, TypeScript y Tailwind CSS. Utiliza el poder de la IA generativa con Genkit para ofrecer búsqueda inteligente y categorización automática de tus notas, contraseñas, fotos y aplicaciones.

## Características

- **Búsqueda Inteligente:** Realiza búsquedas en lenguaje natural para encontrar tus items.
- **Sugerencias de IA:** Obtén sugerencias de categorías para organizar tu información.
- **Gestión de Items:** Añade, edita y elimina notas, contraseñas, fotos y aplicaciones de forma segura.
- **Interfaz Moderna:** Diseño limpio y responsivo con componentes de ShadCN UI.
- **Despliegue Sencillo:** Configurado para un despliegue fácil con Firebase App Hosting.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/) y [ShadCN UI](https://ui.shadcn.com/)
- **IA Generativa:** [Firebase Genkit](https://firebase.google.com/docs/genkit)
- **Despliegue:** [Firebase App Hosting](https://firebase.google.com/docs/hosting)

---

## Cómo empezar

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

### Prerrequisitos

- [Node.js](https://nodejs.org/en/) (v18 o superior)
- [Firebase CLI](https://firebase.google.com/docs/cli)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio
```

### 2. Crear archivo de entorno

Crea un archivo llamado `.env` en la raíz del proyecto y copia el contenido de `.env.local`. Deberás rellenarlo con la configuración de tu propio proyecto de Firebase.

```bash
cp .env.local .env
```

El contenido del archivo `.env` debería ser el siguiente:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_PROJECT_ID="tu-project-id"
NEXT_PUBLIC_FIREBASE_APP_ID="tu-app-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="tu-storage-bucket"
NEXT_PUBLIC_FIREBASE_API_KEY="tu-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="tu-auth-domain"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="tu-messaging-sender-id"
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Ejecutar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.

## Despliegue

Este proyecto está configurado para ser desplegado con Firebase.

1. **Inicia sesión en Firebase:**
   ```bash
   firebase login
   ```
2. **Vincula tu proyecto:**
   ```bash
   firebase use --add
   ```
   (Selecciona tu proyecto de Firebase de la lista)

3. **Despliega la aplicación:**
   ```bash
   firebase deploy
   ```
