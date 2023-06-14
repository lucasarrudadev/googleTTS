# Text to Audio Using GoogleTTS

## Requirements
- Node js (https://nodejs.org/en)
- Google Cloud Account with API Key setup
- ffmpeg (https://github.com/BtbN/FFmpeg-Builds/releases)

## Examples:
- node index.js "ENV_VAR_GOOGLE_API_KEY" "December" "Dec"
  -  Will read the Google API Key at the OS Env. Variable "ENV_VAR_GOOGLE_API_KEY" and use it to create a file named "Dec.wav" with the audio "December"
- node index.js "ENV_VAR_GOOGLE_API_KEY" "Clientèle." "frenchExample" "fr-FR" "fr-FR-Wavenet-C"
  -  .. and use it to create a file named "frenchExample.wav" using "fr-FR" language with the voice "fr-FR-Wavenet-C" having the wording "Clientèle"
