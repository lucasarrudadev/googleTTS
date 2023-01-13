const fs = require('fs');
let fileContent = fs.readFileSync('./run.bat');
let fileContentMatchs = fileContent.toString().match(/".*?"/gs);
// console.log(fileContentMatchs);
let replacedFileContext = fileContent.toString();
for (fileContentMatch of fileContentMatchs){
    if (fileContentMatch.includes('\r\n')){
        replacedFileContext = replacedFileContext.replace(fileContentMatch, fileContentMatch.replace(/\r\n/g, " "));
        console.log("1");
    } 
    continue;
    if (fileContentMatch.includes('\n')){
        replacedFileContext = replacedFileContext.replace(fileContentMatch, fileContentMatch.replace(/\n/g, " "));
        console.log("2");
    }
    // console.log(fileContent.includes(fileContentMatch))
}
console.log(replacedFileContext)
fs.writeFileSync('runParsed.bat', replacedFileContext, 'utf8');