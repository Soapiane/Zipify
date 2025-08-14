
import exampleRoutes from './example.routes';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

const registerRoutes = (fastify: FastifyInstance) => {
  // Register example routes with a prefix
  fastify.register(exampleRoutes, { prefix: '/example' });
  

};

export default registerRoutes;