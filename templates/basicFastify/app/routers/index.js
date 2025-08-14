"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const example_routes_1 = __importDefault(require("./example.routes"));
const registerRoutes = (fastify) => {
    // Register example routes with a prefix
    fastify.register(example_routes_1.default, { prefix: '/example' });
};
exports.default = registerRoutes;
