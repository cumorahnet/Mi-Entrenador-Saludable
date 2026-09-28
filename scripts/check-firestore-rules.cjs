// Runs simulated requests against the Firebase Rules test API; never writes user data.
const fs = require('node:fs');
const path = require('node:path');
const cli = process.env.FIREBASE_TOOLS_LIB || path.join(process.env.APPDATA, 'npm/node_modules/firebase-tools/lib');
const project = 'mi-entrenador-saludable';
async function main() {
    fs.mkdirSync('work', {recursive:true});
    const account = require(path.join(cli, 'auth')).getGlobalDefaultAccount();
    if (!account) throw new Error('Inicia sesión en Firebase CLI.');
    await require(path.join(cli, 'requireAuth')).requireAuth({ project, ...account });
    const rules = require(path.join(cli, 'gcp/rules'));
    const published = process.argv.includes('--published');
    let files;
    if (published) {
        const releases = await rules.listAllReleases(project);
        const release = releases.find(r=>r.name === `projects/${project}/releases/cloud.firestore`);
        if (!release) throw new Error('No se encontró la publicación de Firestore.');
        files = await rules.getRulesetContent(release.rulesetName);
        fs.mkdirSync('work', {recursive:true});
        fs.writeFileSync('work/firestore-' + release.rulesetName.split('/').at(-1) + '.rules', files[0].content);
        console.log('Reglas publicadas descargadas:', release.rulesetName);
    } else files = [{ name:'firestore.rules', content:fs.readFileSync('firestore.rules','utf8') }];
    const cases = [];
    for (const blocked of [false, true]) {
    for (const collection of ['workouts','history','legal','account']) {
      for (const suffix of ['sample','sample/nested/child']) {
        for (const method of ['get','list','create','update','delete']) {
            for (const uid of ['owner','other',null]) {
                const allowed = !blocked && uid === 'owner' && (collection !== 'account' || ['get','list'].includes(method));
                cases.push({ expectation:allowed ? 'ALLOW' : 'DENY', functionMocks:[{ function:'exists', args:[{anyValue:{}}], result:{value:blocked} }], request:{
                    path:`/databases/(default)/documents/artifacts/mientrenador-v3/users/owner/${collection}/${suffix}`,
                    method, auth:uid ? {uid, token:{}} : null
                } });
            }
        }
      }
    }
    }
    for (const method of ['get','list','create','update','delete']) {
        cases.push({expectation:'DENY',request:{path:'/databases/(default)/documents/accountDeletionLocks/owner',method,auth:{uid:'owner',token:{platformAdmin:true}}}});
    }
    const { Client } = require(path.join(cli, 'apiv2'));
    const client = new Client({urlPrefix:'https://firebaserules.googleapis.com', apiVersion:'v1'});
    const response = await client.post(`/projects/${project}:test`, { source:{files}, testSuite:{testCases:cases} });
    const result = response.body;
    fs.writeFileSync('work/firestore-rules-test-' + (published ? 'published' : 'local') + '.json', JSON.stringify(result,null,2));
    const failures = (result.testResults || []).map((r,i)=>({ ...r, request:cases[i].request })).filter(r=>r.state !== 'SUCCESS');
    console.log(JSON.stringify({ issues:result.issues, total:result.testResults?.length, failures },null,2));
    if (failures.length || result.issues?.some(i=>i.severity === 'ERROR') || result.testResults?.length !== cases.length) process.exitCode=1;
}
main().catch(error=>{ console.error(error.message); process.exitCode=1; });
