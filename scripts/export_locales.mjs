import fs from 'node:fs';
import {LANG_DATA} from '../assets/js/translations.js';
const source=fs.readFileSync('assets/js/upgrade.js','utf8');
const copy=Function('return ('+source.match(/const copy = ([\s\S]*?);\nconst keys/)[1]+')')();
fs.writeFileSync('data/locales.json',JSON.stringify(Object.fromEntries(Object.entries(LANG_DATA).map(([code,t])=>[code,{museum:t.nav_museum,machine:t.nav_machine,library:t.nav_armory,role:t.role,posters:copy[code][10]}])),null,2));
