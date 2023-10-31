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
                div: `<div xmlns=\\"http://www.w3.org/1999/xhtml\\"><h1>Operation Outcome</h1><h2>ERROR</h2><h3>FTS-E-001: ${utils.ftsErrors['FTS-E-001']}.</h3>Expected &quot;CodeSystem&quot;, but found &quot;${codesystem.resourceType}&quot;.</div>`,
                severity: "error",
                code: "processing",
                diagnostics: `FTS-E-001: ${utils.ftsErrors['FTS-E-001']}. Expected \\"CodeSystem\\", but found \\"${codesystem.resourceType}\\".`
            }, { });

            return res.status(400).setHeader('Content-Type', 'application/fhir+json').send(filledTemplate);
        }

        // Insert or replace the content of the element "id" with the server-generated ID.
        codesystem.id = (++lastGeneratedId).toString();
        // Insert metadata about the CodeSystem.
        codesystem.meta = {};
        codesystem.meta.versionId = '1';
        codesystem.meta.lastUpdated = date.format(new Date(), 'YYYY-MM-DDTHH:mm:ss.SSSZZ');

        // Validate the CodeSystem structure using the FHIR® JSON schema.
        const { valid, errors } = await utils.validateTerminologyStructure(JSON.stringify(codesystem));
        console.log(errors);
        if (!valid) {

            // Return the fist error.
            // JSON.stringify is called twice to escape quotation marks.
            let firstError = JSON.stringify(JSON.stringify(errors[0]));
            // The second call to JSON.stringify introduces quotation marks at the beginning and
            // at the end of the string. Both are removed to guarantee the correct JSON validation.
            firstError = firstError.replace(/^\"|\"$/g, '');
            filledTemplate = await utils.renderTemplate(template, {
                div: `<div xmlns=\\"http://www.w3.org/1999/xhtml\\"><h1>Operation Outcome</h1><h2>ERROR</h2><h3>FTS-E-002: ${utils.ftsErrors['FTS-E-002']}.</h3>${firstError}</div>`,
                severity: "error",
                code: "processing",
                diagnostics: `FTS-E-002: ${utils.ftsErrors['FTS-E-002']}. ${firstError}`
            }, { });


            return res.status(400).setHeader('Content-Type', 'application/fhir+json').send(filledTemplate);
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
