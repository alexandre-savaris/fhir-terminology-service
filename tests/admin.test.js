// For reading/writing content from/to the filesystem.
import * as fs from 'fs';
// For path manipulation.
import * as path from 'path';
// For accessing the endpoints from app.
import request from 'supertest';
// For accessing the express instance.
import app from '../src/app.js';

// Count the loaded templates.
test('Should load template files on startup', async () => {

    // Retrieve a list of files with templates' specification.
    const files = fs.readdirSync(`${process.env.TEMPLATES_BASEPATH}/`)
        .filter(file => path.extname(file) === '.mustache');

    // Assert that the available templates were loaded into memory.
    expect(files.length).toBe(Object.keys(templates).length);
});

// POST a valid CodeSystem.
test('Should receive a valid CodeSystem', async () => {

    // Retrieve the file content.
    const fileContent = fs.readFileSync('./tests/fixtures/CodeSystemCboGrandeGrupo.json');

    // POST the valid CodeSystem.
    const response = await request(app)
        .post('/admin/codesystem')
        .send(JSON.parse(fileContent.toString()))
        .expect(201);
}, 10000);
