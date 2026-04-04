// Global configuration for the FloodSense frontend
// API_BASE can be overridden via the VITE_API_BASE environment variable
// (set in .env.local). The default is the same port used by the
// Flask backend in this repository.

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
