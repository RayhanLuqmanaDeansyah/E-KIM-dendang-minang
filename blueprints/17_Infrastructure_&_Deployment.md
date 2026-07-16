17 Infrastructure & Deployment

1. Arsitektur Infrastruktur

Frontend (Next.js): Vercel Edge Network (Untuk responsivitas PWA & caching asset).

Backend (Node.js/Socket.io): AWS EC2 / Render dengan Node Cluster (Multiple instances) + Redis Adapter untuk menyinkronkan Socket.io antar node.

Database: MongoDB Atlas (Dedicated Cluster).

Cache: Redis Upstash / AWS ElastiCache.

2. CI/CD Pipeline (GitHub Actions)

Linting -> Unit Test -> Build Next.js -> Build Docker Node.js -> Deploy ke Staging.