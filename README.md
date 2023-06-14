# Text to Audio Using GoogleTTS

## Depencencies
- Node js (https://nodejs.org/en)
- Google Cloud Account with API Key setup (https://support.google.com/googleapi/answer/6158862?hl=en)
- ffmpeg (https://github.com/BtbN/FFmpeg-Builds/releases) (Windows Tip: .exe file should be placed somewhere the OS Env. Variable %PATH% points to, to see where %PATH points to run "echo %PATH%" at your Windows Computer CMD)

## Examples:
- node index.js "ENV_VAR_GOOGLE_API_KEY" "December" "Dec"
  -  Will read the Google API Key at the OS Env. Variable "ENV_VAR_GOOGLE_API_KEY" and use it to create a file named "Dec.wav" with the audio "December"
- node index.js "ENV_VAR_GOOGLE_API_KEY" "Clientèle." "frenchExample" "fr-FR" "fr-FR-Wavenet-C"
  -  .. and use it to create a file named "frenchExample.wav" using "fr-FR" language with the voice "fr-FR-Wavenet-C" having the wording "Clientèle"

## Additional Features:
- If the file name has the wording "Menu" in it, 4 output wav files will bre created:
  - Normal file
  - "\_2" file
  - "\_3" file
  - "\_DTMF" file
  - "\_3WithSay" file
- Create report file to track usage on the current month
