declare const process: any;

export const environment = {
  production: true,
  apiUrl: process.env['API_URL'] || 'https://node-backend-online.onrender.com'
};
