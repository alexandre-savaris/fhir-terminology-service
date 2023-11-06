// For listening to HTTP requests.
import express from 'express';
// For routing administrative endpoints.
import * as adminRouter from './routers/admin.js';
// For mapping the CodeSystems into memory.
import ManyKeysMap from 'many-keys-map';
// For accessig the utility functions.
import * as utils from '../lib/utils.js';

// Port number to be used by the server.
const port = process.env.PORT;

// Last generated ID for POSTed terminologies.
global.lastGeneratedId = 0;
// The ManyKeysMap for storing terminologies into memory.
global.terminologies = new ManyKeysMap();
// Mustache templates.
global.templates = new Object();

// Load CodeSystems from disk.
utils.loadCodeSystemsFromDisk();
// Load templates from disk.
utils.loadTemplatesFromDisk();

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
