const fs = require('fs');
const path = require('path');

const rules = [
    [/bg-gray-950/g, 'bg-slate-50'],
    [/bg-gray-900/g, 'bg-white'],
    [/bg-gray-800/g, 'bg-slate-100'],
    [/bg-gray-700/g, 'bg-slate-200'],
    [/bg-gray-600/g, 'bg-slate-300'],
    [/bg-[#0d1117]/g, 'bg-slate-50'], // Monokai/Github dark background override

    [/text-gray-100/g, 'text-slate-900'],
    [/text-gray-200/g, 'text-slate-800'],
    [/text-gray-300/g, 'text-slate-700'],
    [/text-gray-400/g, 'text-slate-600'],
    [/text-gray-500/g, 'text-slate-500'],
    [/text-gray-600/g, 'text-slate-400'], // Less used
    [/text-white/g, 'text-slate-900'], // Often used with badges or specific texts in dark mode. Need to be careful here? Actually buttons have `btn-primary` which specifies text color. Wait, let's leave text-white alone as it is often explicitly for gradient backgrounds. 
    
    // Borders
    [/border-gray-800/g, 'border-slate-200'],
    [/border-gray-700/g, 'border-slate-300'],
    [/border-gray-600/g, 'border-slate-400'],
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    for (let [pattern, replacement] of rules) {
        content = content.replace(pattern, replacement);
    }
    
    // Specific theme tweaks for CodeEditor component to use 'vs' or 'light' theme instead of 'vs-dark'
    if (filePath.endsWith('CodeEditor.tsx')) {
        content = content.replace(/theme="vs-dark"/g, 'theme="light"');
        content = content.replace(/bg-gray-900\/80/g, 'bg-slate-100/80'); // ensure precise replace
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated: ${filePath}`);
    }
}

function traverseDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            traverseDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            processFile(fullPath);
        }
    });
}

traverseDir(path.join(__dirname, '../src'));
console.log('Theme conversion completed!');
