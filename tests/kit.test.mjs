import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('public kit renders context without private application dependencies',async()=>{
 const html=await readFile('.next/server/app/index.html','utf8');assert.match(html,/Atelier public/);assert.match(html,/Construire les modules ensemble/);
});
