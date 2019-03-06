// keygenRevoke.test.js


const envVars = require('../env.js');
const {user:username, password, env, org, tokenId:id, tokenSecret, key, secret } = envVars;
const keygen = require('../../cli/lib/key-gen.js')();

keygen.revoke({
				username,
				org,
				env,
				password,
				key: process.argv[2],
				secret: process.argv[3]
			}, (err, results)=>{
				if(err) console.error(err)
			});
