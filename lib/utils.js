// For reading/writing content from/to the filesystem.
import * as fs from 'fs';
// For validating JSON content using schemas.
import Ajv from 'ajv';
// For path manipulation.
import * as path from 'path';

// Error messages.
const ftsErrors = {
    'FTS-E-001': 'Incorrect resource type',
    'FTS-E-002': 'Incorrect resource structure',
    'FTS-E-003': 'Internal Server Error',
    'FTS-E-004': 'Resource instance not found'
};

// Validate a terminology structure using the FHIR® JSON schema.
const validateTerminologyStructure = async (terminologyStructure) => {

    // Load the FHIR® JSON schema for validation.
    const fhirSchema = await fs.promises.readFile('./schemas/R5/fhir.schema.json', 'utf8');

    // Validate the terminology structure using the JSON schema.
    // The use of 'strict: false' is suggested in: https://json-schema.org/implementations#validator-javascript .
    // TODO: verify the output.
    const ajv = new Ajv( { strict: false } );
    const validate = ajv.compile(JSON.parse(fhirSchema));
    const valid = validate(JSON.parse(terminologyStructure));
    return {
        valid,
        errors: validate.errors
    };
}

// Insert a CodeSystem into the memory map.
const insertCodeSystemIntoManyKeysMap = (codeSystemId, codeSystemMetaVersionId, concept) => {

    concept.forEach((item) => {
        // Each concept is identified by the CodeSystem id, the CodeSystem versionId and by its own code.
        terminologies.set([codeSystemId, codeSystemMetaVersionId, item.code], item.display);
    });
}

// Load CodeSystems from disk.
const loadCodeSystemsFromDisk = () => {

    // Retrieve a list of files with CodeSystems' data.
    const files = fs.readdirSync(`${process.env.TERMINOLOGIES_BASEPATH}/codesystems/`)
        .filter(file => path.extname(file) === '.json');

    // Loop on the file list.
    files.forEach(file => {
        // Retrieve the file content.
        const fileContent = fs.readFileSync(path.join(`${process.env.TERMINOLOGIES_BASEPATH}/codesystems/`, file));
        // Convert the content to JSON.
        const codeSystem = JSON.parse(fileContent.toString());
        // Insert the CodeSystem into the memory map.
        insertCodeSystemIntoManyKeysMap(codeSystem.id, codeSystem.meta.versionId, codeSystem.concept);
        // Update the terminology's metadata.
        updateTerminologyMetadata(codeSystem.id, parseInt(codeSystem.meta.versionId));
        // Update the lastGeneratedId based on the CodeSystems read from disk.
        if (parseInt(codeSystem.id) > global.lastGeneratedId) {
            global.lastGeneratedId = parseInt(codeSystem.id);
        }
        console.log(`Loaded content from file '${file}' (CodeSystem with id '${codeSystem.id}', versionId '${codeSystem.meta.versionId}', name '${codeSystem.name}') into the memory map!`);
    });
    console.log(terminologiesMetadata);
}

// Load a CodeSystems from disk.
const loadCodeSystemFromDisk = (codeSystemId, codeSystemMetaVersionId) => {

    // Retrieve the file content, returning its representation as a JSON object.
    const fileContent = fs.readFileSync(path.join(`${process.env.TERMINOLOGIES_BASEPATH}/codesystems/`, `${codeSystemId}_${codeSystemMetaVersionId}.json`));
    return JSON.parse(fileContent.toString());
}

// Remove CodeSystems from disk.
const removeCodeSystemsFromDisk = () => {

    // Retrieve a list of files with CodeSystems' data.
    const files = fs.readdirSync(`${process.env.TERMINOLOGIES_BASEPATH}/codesystems/`)
        .filter(file => path.extname(file) === '.json');

    // Loop on the file list.
    files.forEach(file => {
        // Remove the file.
        fs.rmSync(path.join(`${process.env.TERMINOLOGIES_BASEPATH}/codesystems/`, file));
    });
}

// Load templates from disk.
const loadTemplatesFromDisk = () => {

    // Retrieve a list of files with templates' specification.
    const files = fs.readdirSync(`${process.env.TEMPLATES_BASEPATH}/`)
        .filter(file => path.extname(file) === '.mustache');

    // Loop on the file list.
    files.forEach(file => {
        // Retrieve the file content.
        const fileContent = fs.readFileSync(path.join(`${process.env.TEMPLATES_BASEPATH}/`, file));
        // Load the file content into the templates object.
        templates[path.parse(file).name] = fileContent.toString();
        console.log(`Loaded content from file '${file}' into the templates object!`);
    });
}

// Update metadata for a given terminology
const updateTerminologyMetadata = (terminologyId, terminologyMetaVersionId) => {

    if (!terminologiesMetadata[terminologyId]) {
        // Generate a new metadata object.
        terminologiesMetadata[terminologyId] = { lastVersionId: terminologyMetaVersionId };
    } else if (terminologiesMetadata[terminologyId].lastVersionId < terminologyMetaVersionId) {
        // Update the metadata object (only if a most recent version is available).
        terminologiesMetadata[terminologyId].lastVersionId = terminologyMetaVersionId;
    }
}

// Export the utils functions.
export {
    ftsErrors,
    validateTerminologyStructure,
    insertCodeSystemIntoManyKeysMap,
    loadCodeSystemsFromDisk,
    loadCodeSystemFromDisk,
    removeCodeSystemsFromDisk,
    loadTemplatesFromDisk,
    updateTerminologyMetadata
}
