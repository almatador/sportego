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
const express_1 = require("express");
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
const generateSecretKey = () => {
    return crypto_1.default.randomBytes(64).toString('hex');
};
const userDashpord = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
userDashpord.get('/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield prisma.user.findUnique({
            where: { id: parseInt(id) },
        });
        if (user) {
            res.json(user);
        }
        else {
            res.status(404).json({ error: 'User not found' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
}));
userDashpord.post('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, confPassword, cityId, countryId, status } = req.body;
    try {
        if (password !== confPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }
        const newUser = yield prisma.user.create({
            data: {
                name,
                email,
                password,
                confPassword,
                cityId,
                countryId,
                status,
                secretKeyuser: {
                    create: {
                        token: generateSecretKey(), // Generate and include secret key
                    }
                }
            },
        });
        res.status(201).json(newUser);
    }
    catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
}));
userDashpord.put('/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, email, password, confPassword, cityId, countryId, status } = req.body;
    try {
        if (password && password !== confPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }
        const updatedUser = yield prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                name,
                email,
                password,
                confPassword,
                cityId,
                countryId,
                status,
            },
        });
        res.json(updatedUser);
    }
    catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
}));
userDashpord.delete('/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield prisma.user.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
}));
exports.default = userDashpord;
