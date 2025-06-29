# Environment Setup Guide

This document explains how to configure the environment variables for different deployment environments.

## Environment Variables

The application uses environment variables to determine the API base URL for different environments.

### Available Environment Variables

- `VITE_API_BASE_URL`: The base URL for the API server
  - Default: `http://localhost:3000`

## Environment Files

You need to create the following environment files in the `frontend/` directory:

### 1. `.env.development` (for development)
```
VITE_API_BASE_URL=http://localhost:3000
```

### 2. `.env.production` (for production)
```
VITE_API_BASE_URL=https://skatternoteapi-production.up.railway.app
```

### 3. `.env.local` (for local overrides - optional)
```
VITE_API_BASE_URL=http://localhost:3000
```

## How It Works

1. **Development Mode**: When running `npm run dev`, Vite loads `.env.development`
2. **Production Mode**: When running `npm run build`, Vite loads `.env.production`
3. **Local Overrides**: `.env.local` is always loaded and can override other environment files

## Configuration Files

The environment configuration is handled by:

- `src/config/environment.ts` - Simple export of API_BASE_URL
- `src/services/api.ts` - Uses the API_BASE_URL for all API calls

## Usage in Components

All API calls throughout the application automatically use the correct base URL based on the current environment. No changes are needed in individual components.

## Deployment

### Railway Deployment
When deploying to Railway, set the environment variable:
```
VITE_API_BASE_URL=https://skatternoteapi-production.up.railway.app
```

### Local Development
For local development, the default `http://localhost:3000` will be used unless overridden in `.env.local`.

## Troubleshooting

1. **API calls failing**: Check that the `VITE_API_BASE_URL` is correctly set for your environment
2. **Wrong environment detected**: Ensure you're running the correct npm script (`dev` vs `build`)
3. **Environment variables not loading**: Make sure the `.env` files are in the `frontend/` directory

## Security Notes

- Environment variables prefixed with `VITE_` are exposed to the client-side code
- Never include sensitive information (API keys, passwords) in these variables
- Use server-side environment variables for sensitive data 