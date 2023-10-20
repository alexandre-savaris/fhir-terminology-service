// For listening to HTTP requests.
import express from 'express';
// For routing administrative endpoints.
import * as adminRouter from './routers/admin.js';

// Port number to be used by the server.
const port = process.env.PORT;

// A new express instance.
const app = express();
// Defines the middleware to parse incoming request bodies as JSON.
app.use(express.json());
// Add routers.
app.use(adminRouter.router)
// Listen do client requests.
app.listen(port, () => {
    console.log('Server is up and running!')
})
