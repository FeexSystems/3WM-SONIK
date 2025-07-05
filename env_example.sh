# 3WM Sonic AI Platform Environment Variables

# Database Configuration
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here

# Database (Local Development)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/3wm_platform

# Redis Configuration
REDIS_URL=redis://localhost:6379

# AI API Keys
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Grok AI (X.AI) Configuration
GROK_API_KEY=your_grok_api_key_here
GROK_BASE_URL=https://api.x.ai

# Perplexity AI Configuration
PERPLEXITY_API_KEY=your_perplexity_api_key_here

# AWS S3 Configuration (for audio file storage)
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_S3_BUCKET=3wm-audio-files
AWS_REGION=us-east-1

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters
JWT_EXPIRES_IN=7d

# Server Configuration
NODE_ENV=development
PORT=8000
FRONTEND_URL=http://localhost:3000

# Audio Processing Configuration
FFMPEG_PATH=/usr/local/bin/ffmpeg
TEMP_DIR=./temp
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=100MB

# VST Plugin Configuration
VST_PLUGIN_PATH=./plugins/vst
WASM_PLUGIN_PATH=./plugins/wasm

# n8n Configuration
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=admin123
N8N_HOST=localhost
N8N_PORT=5678
N8N_WEBHOOK_URL=http://localhost:5678/webhook

# Music Distribution APIs
BOOMPLAY_API_KEY=your_boomplay_api_key_here
AUDIOMACK_API_KEY=your_audiomack_api_key_here
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password_here

# Monitoring & Analytics
SENTRY_DSN=your_sentry_dsn_here
GOOGLE_ANALYTICS_ID=your_ga_id_here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Limits
MAX_AUDIO_DURATION_SECONDS=1800
MAX_CONCURRENT_UPLOADS=5
SUPPORTED_AUDIO_FORMATS=mp3,wav,flac,aac,ogg,m4a

# AI Agent Configuration
BUSHBOT_PERSONALITY=afrofusion_engineer
GROK_AUDIO_MODEL=grok-audio-beta
PERPLEXITY_MODEL=llama-3.1-sonar-large-128k-online

# WebSocket Configuration
WS_PORT=8001
WS_HEARTBEAT_INTERVAL=30000

# Development Tools
DEBUG=3wm:*
LOG_LEVEL=debug
ENABLE_CORS=true
CORS_ORIGIN=http://localhost:3000

# Production Overrides (uncomment for production)
# NODE_ENV=production
# LOG_LEVEL=info
# ENABLE_CORS=false
# CORS_ORIGIN=https://your-production-domain.com