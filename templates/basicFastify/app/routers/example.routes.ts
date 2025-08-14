import { getExample } from '../handlers/exampleHandler';
import { FastifyInstance } from 'fastify';

const exampleRoutes = async (fastify: FastifyInstance) => {
  // GET /example/
  fastify.get('/', getExample);
};

export default exampleRoutes;