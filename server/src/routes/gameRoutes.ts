import { Router } from 'express';
import { claimKim, createRoom, getRooms, uploadAudio, deleteRoom } from '../controllers/gameController';
import { protect } from '../middleware/authMiddleware';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const router = Router();

router.post('/claim', protect, claimKim);
router.post('/room', protect, createRoom);
router.get('/rooms', protect, getRooms);
router.post('/upload-audio', protect, upload.single('audio'), uploadAudio);
router.delete('/room/:id', protect, deleteRoom);
export default router;
