// For reading/writing content from/to the filesystem.
import * as fs from 'fs/promises';
// For validating JSON content using schemas.
import Ajv from 'ajv';

// Validate a terminology structure using the FHIR® JSON schema.
const validateTerminologyStructure = async (terminologyStructure) => {

    // Load the FHIR® JSON schema for validation.
    const fhirSchema = await fs.readFile('./schemas/R5/fhir.schema.json', { encoding: 'utf8' });

    // Validate the terminology structure using the JSON schema.
    // The use of 'strict: false' is suggested in: https://json-schema.org/implementations#validator-javascript .
    const ajv = new Ajv( { strict: false });
    const validate = ajv.compile(JSON.parse(fhirSchema));
    const valid = validate(JSON.parse(terminologyStructure));
    return {
        valid,
        errors: validate.errors
    };
}

// Export the utils functions.
export {
    validateTerminologyStructure
}
