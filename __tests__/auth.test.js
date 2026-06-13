// Run with: npm test (requires jest and supertest)
const request = require('supertest');

describe('Auth Endpoints', () => {
    describe('POST /register', () => {
        it('should return 400 when fields are missing', async () => {
            // TODO: import app and test
        });

        it('should not return OTP in response', async () => {
            // TODO: ensure register response has no otp field
        });
    });

    describe('POST /login', () => {
        it('should return 400 for missing credentials', async () => {
            // TODO
        });
    });

    describe('GET /allusers', () => {
        it('should return 401 without auth token', async () => {
            // TODO
        });
    });
});
