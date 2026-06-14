// tests/setup.ts
import 'dotenv/config'

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret-key-with-more-than-32-characters-okay'