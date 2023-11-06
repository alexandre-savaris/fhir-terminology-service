// For mapping the CodeSystems into memory.
import ManyKeysMap from 'many-keys-map';
// For accessing the utility functions.
import * as utils from '../lib/utils.js';
// For accessing the express instance.
import app from './app.js';

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

// Listen do client requests.
app.listen(port, () => {
    console.log('Server is up and running!')
})
