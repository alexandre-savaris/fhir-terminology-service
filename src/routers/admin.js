// For creating routers.
import express from 'express';
// For accessig the utility functions.
import * as utils from '../../lib/utils.js';

// Router for the administrative endpoints.
const router = new express.Router()

// Endpoint for codesystem creation.
router.post('/admin/codesystem', async (req, res) => {

    try {

        // Validate the terminology structure using the FHIR® JSON schema.
        // TODO: review the HTTP response codes according to the specification.
        const { valid, errors } = await utils.validateTerminologyStructure(JSON.stringify(req.body));
        if (!valid) {
            res.status(500).send(errors);
        } else {
            res.status(201).send();
        }

    } catch (e) {
        res.status(500).send(e);
    }
})

// Export the router.
export {
    router
}
