# GameSave Vault - Admin Dashboard

A modern admin dashboard for GameSave Vault, built with SvelteKit 5, Tailwind CSS 3, and Axios.

## Features

- 🔐 **Authentication**: Secure login, token refresh, and setup wizard
- 🎮 **Game Management**: Create, read, update, and delete games
- 📊 **Game Details**: View game information, API tokens, and save file history
- 🔧 **Client Config Generator**: Generate configuration files (gamesave.yml) for GameSave Vault client
- ⚙️ **Settings**: Update admin profile and change password
- 🎨 **Modern UI**: Professional blue theme with responsive design
- 📱 **Responsive**: Works on desktop and mobile devices
- 🔔 **Notifications**: Toast notifications for user feedback

## Tech Stack

- **Framework**: SvelteKit 5 with TypeScript
- **Styling**: Tailwind CSS 3
- **HTTP Client**: Axios
- **Font**: Poppins (Google Fonts)
- **Icons**: SVG icons

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm 8+ or 10+

### Installation

1. Clone the repository:
```bash
git clone https://github.com/DLandDS/gamesave-vault-frontend.git
cd gamesave-vault-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── lib/
│   ├── api/           # API client configuration
│   ├── components/    # Reusable Svelte components
│   ├── stores/        # Svelte stores (auth, toast)
│   └── types.ts       # TypeScript type definitions
├── routes/
│   ├── games/         # Game management pages
│   ├── login/         # Login page
│   ├── settings/      # Admin settings page
│   └── setup/         # Initial setup wizard
├── app.css            # Global styles with Tailwind
└── app.html           # HTML template
```

## API Configuration

The default API base URL is `http://localhost:8080`. To change this, update the `API_BASE_URL` in `src/lib/api/client.ts`.

## Authentication Flow

1. **First Visit**: Check `/auth/me` endpoint
   - If 503 ("setup not completed"): Redirect to `/setup`
   - If 401: Try to refresh token, else redirect to `/login`
   - If 200: Continue to dashboard

2. **Token Refresh**: Automatically refresh expired access tokens using refresh token

3. **Protected Routes**: All routes except `/login` and `/setup` require authentication

## Pages

### `/login`
- Login with email and password
- Returns access and refresh tokens

### `/setup`
- Initial setup wizard for creating the first admin user
- Only accessible when backend setup is not completed

### `/admin/games`
- List all games with search functionality
- Create new games
- Quick actions: view details, delete

### `/admin/games/[id]`
- View game details
- Copy API token to clipboard
- Reset API token
- View game save file history
- Edit game name
- Delete game
- Generate client configuration

### `/admin/games/[id]/config`
- Client configuration generator for GameSave Vault client
- Auto-generate unique UUID for client instance
- Pre-filled API token from game details
- Configure game executable path and working directory
- Add multiple save file locations
- Set launch countdown duration
- Real-time YAML configuration preview
- Download configuration as `gamesave.yml`
- Copy configuration to clipboard

### `/settings`
- View and update admin profile (name, email)
- Change password

## Development

### Type Checking

```bash
npm run check
```

### Watch Mode

```bash
npm run check:watch
```

## License

This project is part of the GameSave Vault ecosystem.