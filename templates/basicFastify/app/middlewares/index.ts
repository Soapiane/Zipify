
import { FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';

const registerMiddlewares = (fastify: FastifyInstance) => {
  fastify.register(fastifyCors, {
    origin: '*',
  });
};

export default registerMiddlewares;