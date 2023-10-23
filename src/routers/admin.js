// For creating routers.
import express from 'express';
// For accessig the utility functions.
import * as utils from '../../lib/utils.js';

// Router for the administrative endpoints.
const router = new express.Router()

// Endpoint for codesystem creation.
router.post('/admin/codesystem', async (req, res) => {

    // TODO: review the HTTP response codes according to the specification.
    try {

        if(req.body.resourceType !== "CodeSystem") {
            // Only CodeSystems are accepted.
            return res.status(500).send("aaa");
        }
        if(req.body.hasOwnProperty("id")) {
            // The element "id" is not expected in POST requests.
            return res.status(500).send("bbb");
        }

        // Validate the terminology structure using the FHIR® JSON schema.
        const { valid, errors } = await utils.validateTerminologyStructure(JSON.stringify(req.body));
        if (!valid) {
            return res.status(500).send(errors);
        } else {
            return res.status(201).send("ccc");
        }

    } catch (e) {
        res.status(500).send(e);
    }
})

// Export the router.
export {
    router
}
