import swaggerJsDoc from 'swagger-jsdoc';
import { config } from './index.js';

const options = {
  definition: {
    openapi: '3.0.0',

    info: {
      title: 'Job Board API',
      version: '1.0.0',
      description: 'API documentation for job board backend',
    },

    servers: [
      {
        url: `http://localhost:${config.port}/api/v1`,
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },

  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsDoc(options);

export default swaggerSpec;
