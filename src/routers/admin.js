// For creating routers.
import express from 'express';
// For accessig the utility functions.
import * as utils from '../../lib/utils.js';
// For reading/writing content from/to the filesystem.
import * as fs from 'fs/promises';
// For date and time formatting.
import date from 'date-and-time';

// Router for the administrative endpoints.
const router = new express.Router()

// Endpoint for codesystem creation.
router.post('/admin/codesystem', async (req, res) => {

    // TODO: review the HTTP response codes according to the specification.
    try {

        // Read the Mustache templates.
        const template = await utils.readTemplate('templates/OperationOutcome.mustache');
        let filledTemplate = '';

        // For evaluation and adjustements.
        let codesystem = req.body;

        if(codesystem.resourceType !== "CodeSystem") {

            // Only CodeSystems are accepted.
            filledTemplate = await utils.renderTemplate(template, {
                div: `<div xmlns=\\"http://www.w3.org/1999/xhtml\\"><h1>Operation Outcome</h1><h2>ERROR</h2>FTS-001: Incorrect resource type found, expected &quot;CodeSystem&quot; but found &quot;CodeSystemm&quot;</div>`,
                severity: "error",
                code: "processing",
                diagnostics: `FTS-001: Incorrect resource type found, expected "CodeSystem" but found "CodeSystemm"`
            }, { });
    
            return res.status(400).send(filledTemplate);
        }

        // Insert or replace the content of the element "id" with the server-generated ID.
        codesystem.id = (++lastGeneratedId).toString();
        // Insert metadata about the CodeSystem.
        codesystem.meta = {};
        codesystem.meta.versionId = '1';
        codesystem.meta.lastUpdated = date.format(new Date(), 'YYYY-MM-DDTHH:mm:ss.SSSZZ');

        // Validate the CodeSystem structure using the FHIR® JSON schema.
        const { valid, errors } = await utils.validateTerminologyStructure(JSON.stringify(codesystem));
        if (!valid) {

            // Return the fist error.
            const firstError = JSON.stringify(errors[0]);
            filledTemplate = await utils.renderTemplate(template, {
                div: `<div xmlns=\\"http://www.w3.org/1999/xhtml\\"><h1>Operation Outcome</h1><h2>ERROR</h2>FTS-002: Incorrect resource structure<br /><br />${firstError}</div>`,
                severity: "error",
                code: "processing",
                diagnostics: `FTS-002: Incorrect resource structure\n\n${firstError}`
            }, { });


            return res.status(400).send(filledTemplate);
        }

        // Save the CodeSystem to disk.
        await fs.writeFile(process.env.TERMINOLOGIES_BASEPATH + '/codesystems/' + `${codesystem.id}.json`,
            JSON.stringify(codesystem), { encoding: 'utf8' }, (err) => {
            if (err) {
                return res.status(500).send(err);
            }
        })
    
        // Success!
        return res.status(201).send(codesystem);

    } catch (e) {
        res.status(500).send(e);
    }
})

// Export the router.
export {
    router
}
