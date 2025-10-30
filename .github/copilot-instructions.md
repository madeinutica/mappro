# Mapro - Interactive Solar Project Map

## Project Overview
Mapro is an interactive map application for showcasing solar energy projects. It features a Mapbox-powered map with clickable project pins, admin editing capabilities, and photo management.

## Tech Stack
- **Frontend**: React 18, Mapbox GL JS
- **Backend**: Supabase (PostgreSQL database)
- **Build Tools**: Webpack 5, Babel
- **Styling**: Tailwind CSS
- **Development**: VS Code with ESLint, Prettier

## Key Features
- Interactive Mapbox map with project location pins
- Clickable pins showing project details, photos, and reviews
- Admin interface for adding/editing projects
- Photo upload functionality (before/after photos)
- Responsive design with Tailwind CSS
- CRUD operations for project management
- Embeddable map for external websites

## Development Setup Checklist
- [x] Verify that the copilot-instructions.md file in the .github directory is created.
- [x] Clarify Project Requirements
- [x] Scaffold the Project
- [x] Customize the Project
- [x] Install Required Extensions
- [x] Compile the Project
- [x] Create and Run Task
- [x] Launch the Project
- [x] Ensure Documentation is Complete

## Database Schema
The application uses Supabase with the following tables:
- `projects`: Main project data (name, location, customer, photos, etc.)
- `reviews`: Customer reviews for projects
- `photos`: Additional project photos

## API Integration
- Mapbox GL JS for mapping functionality
- Supabase client for database operations
- File upload handling for project photos

## Development Best Practices
- Use functional React components with hooks
- Follow Tailwind CSS utility-first approach
- Implement proper error handling and loading states
- Use ESLint and Prettier for code quality
- Keep components modular and reusable

## Deployment
- Frontend builds to static files via Webpack
- Can be deployed to Vercel, Netlify, or any static hosting
- Database remains on Supabase
- Environment variables required for API keys
