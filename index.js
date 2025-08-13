#!/usr/bin/env node
const { program } = require('commander');
const path = require('path');
const fs = require('fs');

program
  .name('fastify-gen')
  .description('CLI tool to generate Fastify routes, controllers, and services')
  .version('1.0.0');

program
  .command('route <entity> <method>')
  .description('Generate a new Fastify route')
  .action((entity, method) => {
    generateRoute(entity, method);
  });

program.parse(process.argv);

function generateRoute(entity, method) {
  const routesDir = path.join(process.cwd(), 'src/routes');
  const controllersDir = path.join(process.cwd(), 'src/controllers');
  const servicesDir = path.join(process.cwd(), 'src/services');

  fs.mkdirSync(routesDir, { recursive: true });
  fs.mkdirSync(controllersDir, { recursive: true });
  fs.mkdirSync(servicesDir, { recursive: true });

  const routeFile = path.join(routesDir, `${entity}.js`);
  const controllerFile = path.join(controllersDir, `${entity}Controller.js`);
  const serviceFile = path.join(servicesDir, `${entity}Service.js`);

  if (!fs.existsSync(routeFile)) {
    fs.writeFileSync(routeFile, getRouteTemplate(entity, method));
    console.log(`✅ Created route: ${routeFile}`);
  } else {
    console.log(`⚠️ Route file already exists: ${routeFile}`);
  }

  if (!fs.existsSync(controllerFile)) {
    fs.writeFileSync(controllerFile, getControllerTemplate(entity, method));
    console.log(`✅ Created controller: ${controllerFile}`);
  }

  if (!fs.existsSync(serviceFile)) {
    fs.writeFileSync(serviceFile, getServiceTemplate(entity));
    console.log(`✅ Created service: ${serviceFile}`);
  }
}

function getRouteTemplate(entity, method) {
  return `async function routes(fastify, options) {
  fastify.${method}('/${entity}', async (req, reply) => {
    return await fastify.controllers.${entity}.${method}${capitalize(entity)}(req, reply);
  });
}

module.exports = routes;`;
}

function getControllerTemplate(entity, method) {
  return `const ${entity}Service = require('../services/${entity}Service');

async function ${method}${capitalize(entity)}(req, reply) {
  return { message: '${method.toUpperCase()} ${entity}' };
}

module.exports = { ${method}${capitalize(entity)} };`;
}

function getServiceTemplate(entity) {
  return `async function getAll${capitalize(entity)}() {
  return [];
}

module.exports = { getAll${capitalize(entity)} };`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
