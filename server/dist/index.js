"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kim-minang';
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Basic health check route
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});
// Connect to MongoDB
mongoose_1.default
    .connect(MONGO_URI)
    .then(() => {
    console.log('Successfully connected to MongoDB.');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
    .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});
