// For creating routers.
import express from 'express';
// For accessig the utility functions.
import * as utils from '../../lib/utils.js';
// For reading/writing content from/to the filesystem.
import * as fs from 'fs';
// For rendering templates.
import Mustache from 'mustache';
// For date and time formatting.
import date from 'date-and-time';

// Router for the administrative endpoints.
const router = new express.Router()

// Endpoint for codesystem creation.
router.post('/admin/codesystem', async (req, res) => {

    try {

        // For generating response bodies.
        let operationOutcomeFilledTemplate = '';
        // For evaluation of the received content (and future adjustements).
        let codeSystem = req.body;

        if(codeSystem.resourceType !== "CodeSystem") {

            // Only CodeSystems are accepted.
            operationOutcomeFilledTemplate = Mustache.render(templates['OperationOutcome'], {
                div: `<div xmlns=\\"http://www.w3.org/1999/xhtml\\"><h1>Operation Outcome</h1><h2>ERROR</h2><h3>FTS-E-001: ${utils.ftsErrors['FTS-E-001']}.</h3>Expected &quot;CodeSystem&quot;, but found &quot;${codeSystem.resourceType}&quot;.</div>`,
                severity: "error",
                code: "processing",
                diagnostics: `FTS-E-001: ${utils.ftsErrors['FTS-E-001']}. Expected \\"CodeSystem\\", but found \\"${codeSystem.resourceType}\\".`
            }, { });

            return res.status(400).setHeader('Content-Type', 'application/fhir+json').send(operationOutcomeFilledTemplate);
        }

        // Insert or replace the content of the element "id" with the server-generated ID.
        codeSystem.id = (++lastGeneratedId).toString();
        // Insert metadata about the CodeSystem.
        codeSystem.meta = {};
        codeSystem.meta.versionId = '1';
        codeSystem.meta.lastUpdated = date.format(new Date(), 'YYYY-MM-DDTHH:mm:ss.SSSZZ');

        // Validate the CodeSystem structure using the FHIR® JSON schema.
        const { valid, errors } = await utils.validateTerminologyStructure(JSON.stringify(codeSystem));
        if (!valid) {

            // Return the fist error.
            // JSON.stringify is called twice to escape quotation marks.
            let firstError = JSON.stringify(JSON.stringify(errors[0]));
            // The second call to JSON.stringify introduces quotation marks at the beginning and
            // at the end of the string. Both are removed to guarantee the correct JSON validation.
            firstError = firstError.replace(/^\"|\"$/g, '');
            operationOutcomeFilledTemplate = Mustache.render(templates['OperationOutcome'], {
                div: `<div xmlns=\\"http://www.w3.org/1999/xhtml\\"><h1>Operation Outcome</h1><h2>ERROR</h2><h3>FTS-E-002: ${utils.ftsErrors['FTS-E-002']}.</h3>${firstError}</div>`,
                severity: "error",
                code: "processing",
                diagnostics: `FTS-E-002: ${utils.ftsErrors['FTS-E-002']}. ${firstError}`
            }, { });

            return res.status(400).setHeader('Content-Type', 'application/fhir+json').send(operationOutcomeFilledTemplate);
        }

        // Save the CodeSystem to disk.
        fs.writeFileSync(`${process.env.TERMINOLOGIES_BASEPATH}/codesystems/${codeSystem.id}_${codeSystem.meta.versionId}.json`,
            JSON.stringify(codeSystem));

        // Load the CodeSystem into the memory map.
        utils.loadCodeSystemIntoManyKeysMap(codeSystem.id, codeSystem.meta.versionId, codeSystem.concept);
//         // for (const [keys, value] of terminologies) {
//         //     console.log(keys);
//         //     console.log(value);
//         // }
        
        // Success!
        return res.status(201).send(codeSystem);

    } catch (e) {

        operationOutcomeFilledTemplate = Mustache.render(templates['OperationOutcome'], {
            div: `<div xmlns=\\"http://www.w3.org/1999/xhtml\\"><h1>Operation Outcome</h1><h2>ERROR</h2><h3>FTS-E-003: ${utils.ftsErrors['FTS-E-003']}.</h3> ${e}</div>`,
            severity: "error",
            code: "processing",
            diagnostics: `FTS-E-003: ${utils.ftsErrors['FTS-E-003']}. ${e}`
        }, { });

        return res.status(500).setHeader('Content-Type', 'application/fhir+json').send(operationOutcomeFilledTemplate);
    }
})

// Export the router.
export {
    router
}
