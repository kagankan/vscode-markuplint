import path from 'path';

import { window, workspace, ExtensionContext, StatusBarAlignment } from 'vscode';

import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient';

import { error, info, ready, warning } from './types';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
	const serverModule = context.asAbsolutePath(path.join('out', 'server.js'));
	const debugOptions = {
		execArgv: ['--nolazy', '--inspect=6009'],
	};

	const serverOptions: ServerOptions = {
		run: {
			module: serverModule,
			transport: TransportKind.ipc,
		},
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions,
		},
	};

	const languages = [
		'html',
		'vue',
		'jade',
		'svelte',
		'nunjucks',
		'liquid',
		'handlebars',
		'mustache',
		'ejs',
		'haml',
		'jstl',
		'php',
		'ruby',
		'javascript',
		'javascriptreact',
		'typescript',
		'typescriptreact',
	];

	const clientOptions: LanguageClientOptions = {
		documentSelector: [
			...languages.map((language) => ({ language, scheme: 'file' })),
			...languages.map((language) => ({ language, scheme: 'untitled' })),
		],
		synchronize: {
			configurationSection: 'markuplint',
			fileEvents: workspace.createFileSystemWatcher(
				'**/{.markuplintrc,markuplintrc.json,markuplint.config.json,markuplint.json,markuplint.config.js}',
			),
		},
	};

	client = new LanguageClient('markuplint', 'markuplint Server', serverOptions, clientOptions);
	client.start();

	client.onReady().then(() => {
		const statusBar = window.createStatusBarItem(StatusBarAlignment.Right, 0);

		client.onRequest(ready, (data) => {
			statusBar.show();
			statusBar.text = `$(check)markuplint[v${data.version}]`;
		});

		client.onNotification(error, (message) => {
			window.showErrorMessage(message);
		});

		client.onNotification(warning, (message) => {
			window.showWarningMessage(message);
		});

		client.onNotification(info, (message) => {
			window.showInformationMessage(message);
		});
	});
}

export function deactivate() {
	if (!client) {
		return;
	}
	return client.stop();
}
