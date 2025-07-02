const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../');
const appModulePath = path.join(rootDir, 'src/app/app.module.ts');

let source = fs.readFileSync(appModulePath, 'utf-8');

// Modules to remove by source path
const modulesToRemoveMap = {
  '@valtimo/components': [
    'CardModule',
    'ListModule',
    'ButtonModule',
    'PageModule',
    'TitleModule',
    'VCardModule',
  ],
  '@valtimo/task-management': ['TaskManagementModule'],
};

// Reusable function to build regex for import removal
function buildImportRegex(moduleNames, fromPath) {
  return new RegExp(
    `import\\s*{[^}]*\\b(${moduleNames.join('|')})\\b[^}]*}\\s*from\\s*['"]${fromPath}['"];?\\s*`,
    'g'
  );
}

// Remove specified imports
Object.entries(modulesToRemoveMap).forEach(([importPath, moduleList]) => {
  const importRegex = buildImportRegex(moduleList, importPath);
  source = source.replace(importRegex, '');
});

// Flatten list of all modules to remove for usage cleanup
const allModulesToRemove = Object.values(modulesToRemoveMap).flat();

// Remove each module from NgModule arrays like imports, declarations, etc.
allModulesToRemove.forEach(module => {
  const regex = new RegExp(`\\s*${module}\\s*,?\\n?`, 'g');
  source = source.replace(regex, '');
});

// Remove CaseDetailTabContactMomentsComponent from arrays
source = source.replace(/,\s*CaseDetailTabContactMomentsComponent(?=[,\s}])/g, '');
source = source.replace(/CaseDetailTabContactMomentsComponent,\s*/g, '');
source = source.replace(/CaseDetailTabContactMomentsComponent(?=[,\s}])/g, '');

// Remove object property: contactmomenten: CaseDetailTabContactMomentsComponent
source = source.replace(
  /[ \t]*[,\n]?\s*contactmomenten\s*:\s*CaseDetailTabContactMomentsComponent\s*,?/g,
  ''
);

// Remove HttpClientModule import and usage
source = source.replace(/import\s*{\s*HttpClientModule\s*}\s*from\s*['"][^'"]+['"];\s*/g, '');
source = source.replace(/HttpClientModule,\s*\n/g, '');
source = source.replace(/\s*HttpClientModule\s*,?/g, '');

fs.writeFileSync(appModulePath, source, 'utf-8');

console.log('AppModule updated successfully.');
