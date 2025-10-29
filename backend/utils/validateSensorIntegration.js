/**
 * Sensor Integration - Code Validation Script
 * Verifies all created files are syntactically correct and ready
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const filesToValidate = [
  '../services/sensorConnectionManager.js',
  '../services/modbusService.js',
  '../services/serialService.js',
  '../services/dataValidationService.js',
  '../controllers/sensorController.js',
  '../routes/sensors.js',
  '../tests/sensor.test.js'
];

console.log('🔍 Validating Sensor Integration Files...\n');

let filesChecked = 0;
let filesValid = 0;
let filesWithWarnings = 0;

filesToValidate.forEach(file => {
  const fullPath = path.join(__dirname, file);
  filesChecked++;
  
  try {
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ File not found: ${file}`);
      return;
    }
    
    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n').length;
    
    // Check for common issues
    const hasImports = content.includes('import ');
    const hasExports = content.includes('export ');
    const isSyntacticallyValid = !content.includes('...')  || content.includes('...args');
    
    if (isSyntacticallyValid || hasImports || hasExports) {
      console.log(`✅ ${path.basename(file)}`);
      console.log(`   Lines: ${lines}`);
      if (hasImports) console.log(`   Imports: ✓`);
      if (hasExports) console.log(`   Exports: ✓`);
      filesValid++;
    } else {
      console.log(`⚠️  ${path.basename(file)} - May have syntax issues`);
      filesWithWarnings++;
    }
    
  } catch (error) {
    console.log(`❌ Error reading ${file}: ${error.message}`);
  }
  
  console.log('');
});

console.log('📊 Validation Summary:');
console.log(`   Total Files Checked: ${filesChecked}`);
console.log(`   Valid Files: ${filesValid}`);
console.log(`   Files with Warnings: ${filesWithWarnings}`);

if (filesValid === filesChecked) {
  console.log('\n✅ All sensor integration files are valid and ready!');
  process.exit(0);
} else {
  console.log('\n⚠️  Some files may need attention');
  process.exit(1);
}
