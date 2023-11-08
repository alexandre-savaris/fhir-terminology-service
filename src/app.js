// For mapping the CodeSystems into memory.
import ManyKeysMap from 'many-keys-map';
// For accessing the utility functions.
import * as utils from '../lib/utils.js';
// For listening to HTTP requests.
import express from 'express';
// For routing administrative endpoints.
import * as adminRouter from './routers/codesystem.js';

// Last generated ID for POSTed terminologies.
global.lastGeneratedId = 0;
// ManyKeysMap for storing terminologies into memory.
global.terminologies = new ManyKeysMap();
// Terminologies metadata.
global.terminologiesMetadata = new Object();
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
app.use(adminRouter.router);

// Export the express instance.
export default app;
