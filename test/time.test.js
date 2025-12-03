// test/time.test.js
const request = require("supertest");
const app = require("../app"); // Import the app logic

let server; // Define a variable to hold the server instance

// This block runs once before all tests
beforeAll((done) => {
  // Start the server on a specific port for testing
  server = app.listen(3000, () => {
    console.log("Test server running on port 3000");
    done(); // Signal that the setup is complete
  });
});

// This block runs once after all tests are finished
afterAll((done) => {
  // Shut down the server and release the port
  server.close(done);
});

describe("API Endpoints", () => {
  it("should return a 200 OK status and welcome message for the root endpoint", async () => {
    // Test against the running server
    const res = await request(server).get("/");
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain("Welcome to the CI/CD Workshop!");
  });
});

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
