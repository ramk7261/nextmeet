// Server URL loaded from .env file
// Development: set REACT_APP_SERVER_URL=http://localhost:8000 in frontend/.env
// Production:  set REACT_APP_SERVER_URL=https://your-deployed-backend.com

const server = process.env.REACT_APP_SERVER_URL || 'http://localhost:8000';

export default server;
