// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// This function interacts with the Groq API to get code completions
async function getGroqCompletion(codeContext: string): Promise<string> {
    try {
        const response = await axios.post('https://api.groq.com/completions', {
            prompt: codeContext,
            max_tokens: 50,
            // Add more parameters as needed
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            }
        });

        return response.data.choices[0].text;
    } catch (error) {
        let errorMessage = 'An unknown error occurred';

        // Check if the error is an AxiosError and has a response
        if (axios.isAxiosError(error) && error.response) {
            errorMessage = `Error: ${error.response.status} - ${error.response.statusText}`;
        } else if (error instanceof Error) {
            // General error handling
            errorMessage = error.message;
        }

        vscode.window.showErrorMessage('Error fetching completion: ' + errorMessage);
        return '';
    }
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "copilot" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const disposable = vscode.commands.registerCommand('copilot.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from copilot!');
    });

    context.subscriptions.push(disposable);

    // Register a CompletionItemProvider for Python, C, and C++
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(['python', 'cpp', 'c'], {
        async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
            const linePrefix = document.lineAt(position).text.substr(0, position.character);
            if (!linePrefix) {
                return undefined;
            }

            const completionText = await getGroqCompletion(linePrefix);

            const completionItem = new vscode.CompletionItem(completionText, vscode.CompletionItemKind.Snippet);
            return [completionItem];
        }
    }));
}

// This method is called when your extension is deactivated
export function deactivate() {}
