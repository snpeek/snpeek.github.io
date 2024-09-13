import { describe, it, expect } from 'vitest';
import fs from 'fs';

describe('JSON structure test', () => {
	it('should have the expected keys and nested objects', function (done) {
		const data = fs.readFileSync('./static/mps/mps-data.json', 'utf8');
		const json = JSON.parse(data);

		const geneVariantFields = ['phenotype', 'pathogenic', 'gene', 'notes'];

		Object.values(json).forEach((geneVariant: any) => {
			Object.keys(geneVariant).forEach(function (geneVariantField) {
				expect(geneVariantFields).to.include(geneVariantField);
			});
		});
	});
});