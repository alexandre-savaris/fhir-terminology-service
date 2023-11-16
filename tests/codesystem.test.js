// For reading/writing content from/to the filesystem.
import * as fs from 'fs';
// For path manipulation.
import * as path from 'path';
// For accessing the endpoints from app.
import request from 'supertest';
// For accessing the express instance.
import app from '../src/app.js';
// For accessig the utility functions.
import * as utils from '../lib/utils.js';

// Before each test, remove all CodeSystems.
beforeEach(utils.removeCodeSystemsFromDisk);

// Count the loaded templates.
test('Should load template files on startup', async () => {

    // Retrieve a list of files with templates' specification.
    const files = fs.readdirSync(`${process.env.TEMPLATES_BASEPATH}/`)
        .filter(file => path.extname(file) === '.mustache');

    // Assert that the available templates were loaded into memory.
    expect(files.length).toBe(Object.keys(templates).length);
});

// GET a valid CodeSystem.
test('Should send a valid CodeSystem', async () => {

    // Retrieve the file content.
    const fileContent = fs.readFileSync('./tests/fixtures/CodeSystemCboGrandeGrupo.json');

    // POST the valid CodeSystem.
    let response = await request(app)
        .post('/CodeSystem')
        .send(JSON.parse(fileContent.toString()))
        .expect(201);

    // GET the CodeSystem.
    response = await request(app)
        .get('/CodeSystem/1')
        .expect(200);
}, 10000);

// POST a valid CodeSystem.
test('Should receive a valid CodeSystem', async () => {

    // Retrieve the file content.
    const fileContent = fs.readFileSync('./tests/fixtures/CodeSystemCboGrandeGrupo.json');

    // POST the valid CodeSystem.
    const response = await request(app)
        .post('/CodeSystem')
        .send(JSON.parse(fileContent.toString()))
        .expect(201);
}, 10000);

// After all tests, remove all CodeSystems.
afterAll(utils.removeCodeSystemsFromDisk);
