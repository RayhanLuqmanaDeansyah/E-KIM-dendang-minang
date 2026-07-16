"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRoom = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const gameRoomSchema = new mongoose_1.Schema({
    roomName: { type: String, required: true },
    status: { type: String, enum: ['WAITING', 'PLAYING', 'FINISHED'], default: 'WAITING' },
    currentColor: { type: String, enum: ['PINK', 'YELLOW', 'BLUE', 'GREEN', 'WHITE'], default: 'PINK' },
    drawnNumbers: [{ type: Number }],
    eventHistory: [
        {
            time: { type: Date, default: Date.now },
            type: { type: String, required: true },
            data: { type: mongoose_1.Schema.Types.Mixed }
        }
    ],
    winners: {
        pink: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
        yellow: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
        blue: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
        green: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
        white: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }
    }
}, { timestamps: true });
exports.GameRoom = mongoose_1.default.model('GameRoom', gameRoomSchema);
