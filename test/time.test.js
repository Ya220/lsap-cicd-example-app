// test/time.test.js

const request = require('supertest');
const app = require('../server'); // Import your Express app instance

describe('Time API Endpoint', () => {
    it('should return a JSON object containing a valid ISO-formatted date string', async () => {
        // 1. Make the request to the endpoint
        const response = await request(app)
            .get('/api/time')
            .expect(200) // Expect HTTP status 200 (OK)
            .expect('Content-Type', /json/); // Expect JSON response
            
        // 2. Check that the 'time' property exists
        expect(response.body).toHaveProperty('time');
        
        const timeString = response.body.time;
        
        // 3. Check for valid ISO 8601 format (e.g., 2025-11-24T16:50:58.000Z)
        // A simple way to check is to attempt to parse it and verify it's not "Invalid Date"
        const dateObject = new Date(timeString);
        
        // Check 1: If it can be parsed into a valid date object
        expect(dateObject.toString()).not.toBe('Invalid Date');
        
        // Check 2: (Optional but good) Check if the string matches the common ISO format regex
        // /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
        expect(timeString).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
});
