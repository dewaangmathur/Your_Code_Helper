import * as vscode from 'vscode';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

// Function to interact with AI21 API
async function getAI21Completion(prompt: string): Promise<string> {
    try {
        const response = await axios.post('https://api.ai21.com/studio/v1/chat/completions', {
            model: 'jamba-instruct-preview',
            messages: [
                {
                    role: 'user',
                    content: prompt,
                }
            ],
            n: 1,
            max_tokens: 1024,
            temperature: 0.7,
            top_p: 1,
            stop: []
        }, {
            headers: {
                'Authorization': `Bearer ${'HuXJPdvU348BNAhzLB6pf1PBScz9y5vq'}`,
                'Content-Type': 'application/json',
            }
        });

        console.log("API Response Data:", response.data); // Debugging log
        return response.data.choices[0].message.content.trim(); // Adjust based on the actual response format
    } catch (error) {
        let errorMessage = 'An unknown error occurred';

        if (axios.isAxiosError(error) && error.response) {
            errorMessage = `Error: ${error.response.status} - ${error.response.statusText}`;
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        vscode.window.showErrorMessage('Error fetching completion: ' + errorMessage);
        return '';
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "copilot" is now active!');

    const disposable = vscode.commands.registerCommand('wingmen.helloWorld', async () => {
        const prompt = "Translate the following English text to French: 'Hello, how are you?'";
        const completionText = await getAI21Completion(prompt);
        vscode.window.showInformationMessage('Completion: ' + completionText);
    });

    context.subscriptions.push(disposable);

    // Register a CompletionItemProvider for Python, C, and C++
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(['python', 'cpp', 'c'], {
        async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
            const linePrefix = document.lineAt(position).text.substr(0, position.character).trim();
            if (linePrefix.startsWith('##')) {
                const prompt = linePrefix.substring(2).trim();
                const completionText = await getAI21Completion(prompt);
                if (completionText) {
                    const completionItem = new vscode.CompletionItem(completionText, vscode.CompletionItemKind.Snippet);
                    return [completionItem];
                }
            }
            return undefined;
        }
    }));
}

export function deactivate() {}
