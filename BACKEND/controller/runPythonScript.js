const { spawn } = require('child_process');

// controller function to run model
function runPythonScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [scriptPath, ...args]);
    let outputData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve(outputData);
      } else {
        reject(new Error(`Python script exited with code ${code}: ${errorData}`));
      }
    });
  });
}


// Path for python script
const pythonScriptPath = '../AI_MODEL/app.py'; 
const cropRecommendationPath = '../AI_MODEL/Crop_Recommendation.csv'

//arguments available as input for python script
//import sys in python file and access argument from element 1
const scriptArguments = [cropRecommendationPath, 'data2' ];

runPythonScript(pythonScriptPath, scriptArguments)
  .then((result) => {
    const result1 = result
    //const Output = JSON.parse(result1)
    console.log( result1);
  })
  .catch((error) => {
    console.error('Error running Python script:', error);
  });

module.exports = runPythonScript;