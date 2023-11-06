// For reading/writing content from/to the filesystem.
import * as fs from 'fs';
// For accessing the endpoints from app.
import request from 'supertest';
// For accessing the express instance.
import app from '../src/app.js';

// POST a valid CodeSystem.
test('Should receive a valid CodeSystem', async () => {

    // Retrieve the file content.
    const fileContent = fs.readFileSync('./tests/fixtures/CodeSystemCboGrandeGrupo.json');

    // ???
    const response = await request(app)
        .post('/admin/codesystem')
        .send(fileContent.toString())
        .expect(201);
})
