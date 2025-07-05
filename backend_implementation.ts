import express from 'express';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { Server } from 'socket.io';
import { createServer } from 'http';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import winston from 'winston';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

// Initialize services
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Initialize clients
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Logger setup
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  },
});

// Validation schemas
const trackUploadSchema = z.object({
  title: z.string().min(1).max(100),
  artist: z.string().min(1).max(100),
  genre: z.string().optional(),
  bpm: z.number().optional(),
  key: z.string().optional(),
});

const aiProcessingSchema = z.object({
  trackId: z.string().uuid(),
  command: z.string().min(1),
  agent: z.enum(['bushbot', 'grok', 'perplexity']),
  parameters: z.record(z.any()).optional(),
});

// Authentication middleware
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// AI Agent Classes
class BushBot {
  async processCommand(command: string, audioFile: string) {
    logger.info(`BushBot processing: ${command}`);
    
    const prompt = `
      You are BushBot, an expert Afrofusion studio engineer from Lagos.
      Command: ${command}
      
      Analyze the audio and provide specific mixing/mastering suggestions.
      Focus on the warm, precise, wise approach typical of Lagos studios.
      
      Return your response as JSON with the following structure:
      {
        "analysis": "detailed audio analysis",
        "suggestions": ["specific suggestion 1", "specific suggestion 2"],
        "settings": {
          "eq": {"low": 0, "mid": 0, "high": 0},
          "compression": {"ratio": 1, "attack": 0, "release": 0},
          "reverb": {"type": "shrine", "amount": 0}
        }
      }
    `;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      });

      return JSON.parse(response.content[0].text);
    } catch (error) {
      logger.error('BushBot error:', error);
      throw new Error('BushBot processing failed');
    }
  }
}

class GrokAudio {
  async analyzeTrack(audioFile: string) {
    logger.info(`Grok analyzing: ${audioFile}`);
    
    // Simulate Grok AI analysis
    const analysis = {
      frequencies: {
        bass: Math.random() * 10,
        midrange: Math.random() * 10,
        treble: Math.random() * 10,
      },
      dynamics: {
        range: Math.random() * 20,
        rms: Math.random() * -20,
        peak: Math.random() * -6,
      },
      genre: 'Afrofusion',
      suggestions: [
        'Boost the sub-bass around 60Hz for more punch',
        'Add subtle compression to the midrange for consistency',
        'Consider adding some high-frequency excitement around 10kHz',
      ],
    };

    return analysis;
  }
}

class PerplexityMixin {
  async processAutomation(trackId: string, command: string) {
    logger.info(`Perplexity processing automation: ${command}`);
    
    const prompt = `
      As an expert plugin wizard, analyze this command and provide automation settings:
      Command: ${command}
      
      Return JSON with plugin automation settings for:
      - EQ adjustments
      - Compression settings  
      - Reverb parameters
      - Any other relevant effects
      
      Focus on Afrofusion and Lagos sound aesthetics.
    `;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      logger.error('Perplexity error:', error);
      throw new Error('Perplexity processing failed');
    }
  }
}

// Initialize AI agents
const bushBot = new BushBot();
const grokAudio = new GrokAudio();
const perplexityMixin = new PerplexityMixin();

// Audio processing utilities
const processAudioFile = async (filePath: string, settings: any) => {
  return new Promise((resolve, reject) => {
    const outputPath = filePath.replace(/\.[^/.]+$/, '_processed.wav');
    
    let command = ffmpeg(filePath)
      .audioCodec('pcm_s24le')
      .audioFrequency(44100)
      .audioChannels(2);

    // Apply EQ settings
    if (settings.eq) {
      const { low, mid, high } = settings.eq;
      command = command.audioFilters([
        `equalizer=f=100:g=${low}`,
        `equalizer=f=1000:g=${mid}`,
        `equalizer=f=10000:g=${high}`,
      ]);
    }

    // Apply compression
    if (settings.compression) {
      const { ratio, attack, release } = settings.compression;
      command = command.audioFilters([
        `compand=attacks=${attack}:decays=${release}:points=-80/-80|-60/-60|-40/-40|-20/-20:soft-knee=6:gain=0:volume=0:delay=0`,
      ]);
    }

    command
      .on('end', () => {
        logger.info(`Audio processing completed: ${outputPath}`);
        resolve(outputPath);
      })
      .on('error', (error) => {
        logger.error('FFmpeg error:', error);
        reject(error);
      })
      .save(outputPath);
  });
};

// API Routes

// Track upload endpoint
app.post('/api/tracks/upload', authenticateToken, upload.single('audio'), async (req, res) => {
  try {
    const validation = trackUploadSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid track data', details: validation.error });
    }

    const { title, artist, genre, bpm, key } = validation.data;
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Store track metadata in Supabase
    const { data: track, error } = await supabase
      .from('tracks')
      .insert({
        title,
        artist,
        genre,
        bpm,
        key,
        file_path: