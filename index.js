// Setting initial variables
const allAvailableParameters = 'node index.js "<googleApiKey>" "<textToBeSynthesized>" "<fileName>" <voiceLanguageCode> <voiceName>';
const { exec } = require("child_process");

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

const voiceLanguageCode = process.argv[5] || "en-US";
const voiceName = process.argv[6] || "en-US-Wavenet-C";

const sorryFile = voiceName == "en-US-Wavenet-C" ? "Sorry.wav" : "Sorry_" + voiceName + ".wav";
const stillFile = voiceName == "en-US-Wavenet-C" ? "Still.wav" : "Still_" + voiceName + ".wav";

if (googleApiKey == "CONCAT") {
	mergeTwoWavFiles(sorryFile, msg + '.wav', msg + '_2.wav');
	mergeTwoWavFiles(stillFile, msg + '.wav', msg + '_3.wav');
	return 0;
}

// Reading rest of inputs
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
const fileNameWithoutWav = fileName.slice(0, -4);

// Setting dependencies
const {google} = require('googleapis');
const fs = require('fs');
const { file } = require('googleapis/build/src/apis/file');
const texttospeech = google.texttospeech({version: 'v1', auth: googleApiKey});

// Create wav file from google API
async function generateTTS(msg, voiceLanguageCode, voiceName, outputFile) {
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
		fs.writeFileSync(outputFile, buf);
		console.log('Created file ' + outputFile);
		return res.data.audioContent;
	} else {
		console.log(res);
		return res;
	}
}

async function mergeTwoWavFiles(fileA, fileB, outputFile){
	return new Promise((resolve, reject) => {
		exec(`ffmpeg -i ${fileA} -i ${fileB} -filter_complex [0][1]concat=n=2:v=0:a=1[out] -map [out] ${outputFile}`, (error, stdout, stderr) => {
			if (error) {
				console.log(`error: ${error.message}`);
				reject(error);
			}
			if (stderr) {
				console.log('Created file ' + outputFile);
				resolve(stderr);
			}
			if (stdout) {
				console.log('Created file ' + outputFile);
				resolve(stdout);
			}
			// console.log('Delete already existing _2 and _3 files');
			reject('Delete already existing files');
		});
	})
}

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
	if(currentStats.totalTextLength >= 900000) {
		console.log(`Error - Already used montly free quota, blocking usage until end of month`);
		return -2;
	}

	// Acquire an auth client, and bind it to all future calls, not needed since auth APIKey is being passed at texttospeech instantiation
	// const auth = new google.auth.GoogleAuth({
	// 	// Scopes can be specified either as an array or as a single, space-delimited string.
	// 	scopes: ['https://www.googleapis.com/auth/cloud-platform'],
	// });
	// const authClient = await auth.getClient();
	// google.options({auth: authClient});

	await generateTTS(msg, voiceLanguageCode, voiceName, fileName);
	// Check if should create DTMF _2 and _3 files
	if (fileName.toLocaleLowerCase().includes('menu')) {
		console.log('Is a menu file, creating _2 _3 and DTMF wav files');
		try {
			fs.rmSync(fileNameWithoutWav + '_DTMF.wav');
			console.log('Deleted file: ' + fileNameWithoutWav + '_DTMF.wav');
		} catch (err) {}		
		if (fileName.toLocaleLowerCase().includes('menunoreg')) {
			await generateTTS(msg, voiceLanguageCode, voiceName, fileNameWithoutWav + '_DTMF.wav');
		} else {
			await generateTTS(msg.replace(/say.*?or /ig, ','), voiceLanguageCode, voiceName, fileNameWithoutWav + '_DTMF.wav');
		}
		try {
			fs.rmSync(fileNameWithoutWav + '_2.wav');
			console.log('Deleted file: ' + fileNameWithoutWav + '_2.wav');
		} catch (err) {}
		try {
			fs.rmSync(fileNameWithoutWav + '_3.wav');
			console.log('Deleted file: ' + fileNameWithoutWav + '_3.wav');
		} catch (err) {}
		try {
			fs.rmSync(fileNameWithoutWav + '_3WithSay.wav');
			console.log('Deleted file: ' + fileNameWithoutWav + '_3WithSay.wav');
		} catch (err) {}
		mergeTwoWavFiles(sorryFile, fileName, fileNameWithoutWav + '_2.wav');
		mergeTwoWavFiles(stillFile, fileNameWithoutWav + '_DTMF.wav', fileNameWithoutWav + '_3.wav');
		mergeTwoWavFiles(stillFile, fileName, fileNameWithoutWav + '_3WithSay.wav');
	}
}

// Run
main().catch(e => {
	console.error(e);
	throw e;
});