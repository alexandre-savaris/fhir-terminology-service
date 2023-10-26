// For creating routers.
import express from 'express';
// For accessig the utility functions.
import * as utils from '../../lib/utils.js';
// For reading/writing content from/to the filesystem.
import * as fs from 'fs/promises';

// Router for the administrative endpoints.
const router = new express.Router()

// Endpoint for codesystem creation.
router.post('/admin/codesystem', async (req, res) => {

    // TODO: review the HTTP response codes according to the specification.
    try {

        // For evaluation and adjustements.
        let codesystem = req.body;

        if(codesystem.resourceType !== "CodeSystem") {
            // Only CodeSystems are accepted.
            return res.status(500).send("aaa");
        }

        // Insert or replace the content of the element "id" with the server-generated ID.
        codesystem.id = (++lastGeneratedId).toString();
        console.log(codesystem.id);

        // Validate the CodeSystem structure using the FHIR® JSON schema.
        const { valid, errors } = await utils.validateTerminologyStructure(JSON.stringify(codesystem));
        if (!valid) {
            return res.status(500).send(errors);
        }

        // Save the CodeSystem to disk.
        console.log(process.env.TERMINOLOGIES_BASEPATH + '/codesystems/' + `${codesystem.id}.json`);
        await fs.writeFile(process.env.TERMINOLOGIES_BASEPATH + '/codesystems/' + `${codesystem.id}.json`,
            JSON.stringify(codesystem), { encoding: 'utf8' }, (err) => {
            if (err) {
                return res.status(500).send(err);
            }
        })
    
        // Success!
        return res.status(201).send(codesystem.id);

    } catch (e) {
        res.status(500).send(e);
    }
})

// Export the router.
export {
    router
}
