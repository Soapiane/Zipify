#!/usr/bin/env node
import { program } from 'commander';
import * as path from 'path';
import * as fs from 'fs';

program
  .name('zipify')
  .description('CLI tool to generate Fastify routes, controllers, and services')
  .version('1.0.0');

program
  .command('route <entity> <method>')
  .description('Generate a new Fastify route')
  .action((entity: string, method: string) => {
    generateRoute(entity, method);
  });

program
  .command('init [outDir]')
  .description('Initialize a basic project into [outDir] (default: ./project)')
  .action((outDir?: string) => {
    initProject(outDir);
  });

program.parse(process.argv);

function generateRoute(entity: string, method: string): void {
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
    fs.writeFileSync(routeFile, getRouteTemplate(entity, method), 'utf8');
    console.log(`✅ Created route: ${routeFile}`);
  } else {
    console.log(`⚠️ Route file already exists: ${routeFile}`);
  }

  if (!fs.existsSync(controllerFile)) {
    fs.writeFileSync(controllerFile, getControllerTemplate(entity, method), 'utf8');
    console.log(`✅ Created controller: ${controllerFile}`);
  }

  if (!fs.existsSync(serviceFile)) {
    fs.writeFileSync(serviceFile, getServiceTemplate(entity), 'utf8');
    console.log(`✅ Created service: ${serviceFile}`);
  }
}

function getRouteTemplate(entity: string, method: string): string {
  return `async function routes(fastify, options) {
  fastify.${method}('/${entity}', async (req, reply) => {
    return await fastify.controllers.${entity}.${method}${capitalize(entity)}(req, reply);
  });
}

module.exports = routes;`;
}

function getControllerTemplate(entity: string, method: string): string {
  return `const ${entity}Service = require('../services/${entity}Service');

async function ${method}${capitalize(entity)}(req, reply) {
  return { message: '${method.toUpperCase()} ${entity}' };
}

module.exports = { ${method}${capitalize(entity)} };`;
}

function getServiceTemplate(entity: string): string {
  return `async function getAll${capitalize(entity)}() {
  return [];
}

module.exports = { getAll${capitalize(entity)} };`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function initProject(outDir?: string): void {
  const templateDir = path.join(__dirname, 'templates', 'basicFastify');
  const destDir = outDir
    ? (path.isAbsolute(outDir) ? outDir : path.join(process.cwd(), outDir, 'ZipifyProject'))
    : path.join(process.cwd(), 'project');

  if (!fs.existsSync(templateDir)) {
    console.error(`❌ Template not found: ${templateDir}`);
    process.exit(1);
  }

  if (fs.existsSync(destDir)) {
    const hasFiles = fs.readdirSync(destDir).length > 0;
    if (hasFiles) {
      console.error(`⚠️ Destination already exists and is not empty: ${destDir}`);
      process.exit(1);
    }
  }

  copyDirSync(templateDir, destDir);
  console.log(`✅ Project initialized at: ${destDir}`);
}

function copyDirSync(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else if (entry.isSymbolicLink()) {
      const link = fs.readlinkSync(srcPath);
      fs.symlinkSync(link, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}