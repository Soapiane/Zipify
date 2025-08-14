"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const fastify_1 = __importDefault(require("fastify"));
const middlewares_1 = __importDefault(require("./middlewares"));
const routers_1 = __importDefault(require("./routers"));
const generated_1 = require("./prisma/generated");
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const isProd = process.env.ENV ? (process.env.ENV === 'PROD') : false;
const host = process.env.HOST || 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const domain = process.env.DOMAIN || host + ':' + port;
// Load environment variables from .env
dotenv_1.default.config();
// Ensure DATABASE_URL is available
if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
}
const fastify = (0, fastify_1.default)({ logger: true });
// Initialize Prisma once at app startup
const prisma = new generated_1.PrismaClient();
// Check database connection
function checkDatabaseConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield prisma.$connect();
            console.log('Database connection established');
        }
        catch (error) {
            console.error('Failed to connect to database:', error);
            process.exit(1);
        }
    });
}
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        // Check database connection first
        yield checkDatabaseConnection();
        // 1. Register middlewares
        (0, middlewares_1.default)(fastify);
        // 2. Register Swagger plugin (generates the OpenAPI JSON/YAML endpoints)
        fastify.register(swagger_1.default, {
            swagger: {
                info: {
                    title: 'My API',
                    description: 'API Documentation generated with Fastify Swagger',
                    version: '1.0.0'
                },
                externalDocs: {
                    url: 'https://swagger.io',
                    description: 'Find more info here'
                },
                host: domain,
                schemes: isProd ? ['https'] : ['http'],
                consumes: ['application/json'],
                produces: ['application/json']
            },
            exposeRoute: true,
        });
        fastify.register(swagger_ui_1.default, {
            routePrefix: '/docs'
        });
        // 2. Register routes
        (0, routers_1.default)(fastify);
        // 3. Start server
        try {
            const port = Number(process.env.PORT) || 3000;
            const host = process.env.HOST || '0.0.0.0';
            yield fastify.listen({ port, host });
            fastify.log.info(`Server started on port ${port}`);
        }
        catch (err) {
            fastify.log.error(err);
            process.exit(1);
        }
    });
}
// Add graceful shutdown
const gracefulShutdown = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Shutting down gracefully');
    yield prisma.$disconnect();
    process.exit(0);
});
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
startServer();
