// Setting initial variables
const allAvailableParameters = 'node index.js "<googleApiKey>" "<textToBeSynthesized>" "<fileName>" <voiceLanguageCode> <voiceName>';

// Parsing parameters
// console.log(process.env)
let googleApiKey = process.argv[2];
if (googleApiKey.slice(0, 8) == 'ENV_VAR_') googleApiKey = process.env[googleApiKey];
if (googleApiKey == undefined) {
	console.log('Error - If using parameter <googleApiKey> starting ENV_VAR_ (such as done) you need to have it set as an system environment variable (' + googleApiKey + ') and its value be the google api key');
	return -3
}

const msg = process.argv[3];
if (msg == undefined) {
	console.log(`Error - Please specify the text to be used, example:
	node index.js "<googleApiKey>" "example text to be synthesized"
	
	See here all available parameters:
	${allAvailableParameters}`);
	return -1;
}

let fileName = process.argv[4]; // || (msg + '_' + Date() + '.wav').replace(/\\|\/|\:|\*|\?|\"|\<|\>|\|/g, '');
if (fileName == undefined) {
	console.log(`Error - Please specify the file name to be used, example:
	node index.js "<googleApiKey>" "example text to be synthesized" <fileName>
	
	See here all available parameters:
	${allAvailableParameters}`);
	return -4;
}

// Append .wav to file name if needed
if (fileName.slice(-4) != '.wav') fileName+='.wav';
// Check for prefix of file name
if (fileName.slice(0, 2) != './' && fileName.slice(1, 2) != ':' && fileName.slice(1, 2) != '.\\')  {
	fileName = './' + fileName;
}

const voiceLanguageCode = process.argv[5] || "en-US";

const voiceName = process.argv[6] || "en-US-Wavenet-C";

// Setting dependencies
const {google} = require('googleapis');
const fs = require('fs');
const { file } = require('googleapis/build/src/apis/file');
const texttospeech = google.texttospeech({version: 'v1', auth: googleApiKey});

// Main code
async function main() {
	// Incerment usage metrics
	const currentDateTime = new Date();
	const currentMonth = currentDateTime.getMonth() + 1;
	const currentYear = currentDateTime.getFullYear();
	let currentStats;
	try{
			currentStats = require('./usageStats_' + currentMonth + '_' + currentYear + '.json');
			currentStats.requests+=1;
			currentStats.totalTextLength+=msg.length;
			fs.writeFileSync('./usageStats_' + currentMonth + '_' + currentYear + '.json', JSON.stringify(currentStats, null, '\t'));
	} catch (err) {
			if (err.code == 'MODULE_NOT_FOUND') {
					currentStats = {requests: 1, totalTextLength: 0};
					fs.writeFileSync('./usageStats_' + currentMonth + '_' + currentYear + '.json', JSON.stringify(currentStats, null, '\t'));
			} else {
					throw err;
			}
	}

	// Check for currentStatus
	if(currentStats.length >= 900000) {
		console.log(`Error - Already used montly free quota, blocking usage until end of month`);
		return -2;
	}

	const auth = new google.auth.GoogleAuth({
		// Scopes can be specified either as an array or as a single, space-delimited string.
		scopes: ['https://www.googleapis.com/auth/cloud-platform'],
	});

	// Acquire an auth client, and bind it to all future calls, not needed since auth APIKey is being passed at texttospeech instantiation
	// const authClient = await auth.getClient();
	// google.options({auth: authClient});

	const res = await texttospeech.text.synthesize({
		// Request body metadata
		requestBody: {
			"input": {
				"text": msg
			},
			"voice": {
				"languageCode": voiceLanguageCode,
				"name": voiceName
			},
			"audioConfig": {
				"audioEncoding": "LINEAR16",
				"pitch": 0,
				"speakingRate": 0.96,
				"effectsProfileId": [
					"telephony-class-application"
				]
			}
		}
	});
	// Check response
	if (res.status == 200){
		let buf = Buffer.from(res.data.audioContent, 'base64');
		fs.writeFileSync(fileName, buf);
		console.log('Created file ' + fileName);
		// Check if should create DTMF _2 and _3 files
		// if (fileName.toLocaleLowerCase().contains('menu')) {
		// 	fs.writeFileSync(fileName + '_DTMF', buf);
		// }
	} 
	else console.log(res);
}

// Run
main().catch(e => {
	console.error(e);
	throw e;
});