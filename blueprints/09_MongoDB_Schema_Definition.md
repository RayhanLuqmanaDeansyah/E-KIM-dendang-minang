09 MongoDB Schema Definition (Mongoose)

1. Users Collection

const userSchema = new Schema({
  username: { type: String, unique: true, required: true },
  passwordHash: String,
  role: { type: String, enum: ['PLAYER', 'SUPER_ADMIN', 'OPERATOR', 'VALIDATOR'] },
  balance: { type: Number, default: 0 },
  stats: {
    totalWins: { type: Number, default: 0 },
    cardsTorn: { type: Number, default: 0 }
  }
}, { timestamps: true });


2. GameRooms Collection

const gameRoomSchema = new Schema({
  roomName: String,
  status: { type: String, enum: ['WAITING', 'PLAYING', 'FINISHED'] },
  currentColor: { type: String, enum: ['PINK', 'YELLOW', 'BLUE', 'GREEN', 'WHITE'] },
  drawnNumbers: [Number],
  eventHistory: [{
     time: Date,
     type: { type: String }, // 'DRAW', 'CLAIM_WIN', 'CLAIM_FAIL'
     data: Schema.Types.Mixed
  }],
  winners: {
    pink: { type: Schema.Types.ObjectId, ref: 'User' },
    yellow: { type: Schema.Types.ObjectId, ref: 'User' },
    //...
  }
});


(Koleksi PlayerCards dan Pantuns dijelaskan di file masing-masing).