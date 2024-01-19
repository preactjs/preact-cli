const { join } = require('path');
const {
	access,
	mkdir,
	readdir,
	readFile,
	rename,
	writeFile,
} = require('fs/promises');
const looksLike = require('html-looks-like');
const { create, build } = require('./lib/cli');
const { snapshot } = require('./lib/utils');
const { subject } = require('./lib/output');
const images = require('./images/build');
const minimatch = require('minimatch');
const shell = require('shelljs');

const prerenderUrlFiles = [
	'prerender-urls.json',
	'prerender-urls.js',
	'prerender-urls.promise.js',
];

async function getBody(dir, file = 'index.html') {
	file = join(dir, `build/${file}`);
	let html = await readFile(file, 'utf-8');
	return html.match(/<body>.*<\/body>/)[0];
}

async function getHead(dir, file = 'index.html') {
	file = join(dir, `build/${file}`);
	let html = await readFile(file, 'utf-8');
	return html.match(/<head>.*<\/head>/)[0];
}

function getRegExpFromMarkup(markup) {
	const minifiedMarkup = markup
		.replace(/\n/g, '')
		.replace(/\t/g, '')
		.replace(/\s{2}/g, '');
	return new RegExp(minifiedMarkup);
}

function testMatch(received, expected) {
	let receivedKeys = Object.keys(received);
	let expectedKeys = Object.keys(expected);
	expect(receivedKeys).toHaveLength(expectedKeys.length);
	for (let key in expected) {
		const receivedKey = receivedKeys.find(k => minimatch(k, key));
		expect(key).toFindMatchingKey(receivedKey);

		expect(receivedKey).toBeCloseInSize(received[receivedKey], expected[key]);
	}
}

/**
 * Get build output file as utf-8 string
 * @param {string} dir
 * @param {RegExp | string} file
 * @returns {Promise<string>}
 */
async function getOutputFile(dir, file) {
	if (typeof file !== 'string') {
		// @ts-ignore
		file = (await readdir(join(dir, 'build'))).find(f => file.test(f));
	}
	return await readFile(join(dir, 'build', file), 'utf8');
}

describe('preact build', () => {
	it('builds the `default` template', async () => {
		let dir = await create('default');

		await build(dir);

		let output = await snapshot(join(dir, 'build'));
		testMatch(output, images.default);
	});

	it('builds the `typescript` template', async () => {
		let dir = await create('typescript');

		await expect(build(dir)).resolves.not.toThrow();
	});

	it('should patch global location object', async () => {
		let dir = await subject('location-patch');

		await expect(build(dir)).resolves.not.toThrow();
	});

	it('should copy resources from static to build directory', async () => {
		let dir = await subject('static-root');
		await build(dir);
		let file = join(dir, 'build', '.htaccess');
		expect(await access(file)).toBeUndefined();
	});

	it('should use a custom `.env` with prefixed environment variables', async () => {
		let dir = await subject('custom-dotenv');
		await build(dir);

		const bundleFile = (await readdir(`${dir}/build`)).find(file =>
			/bundle\.\w{5}\.js$/.test(file)
		);
		const transpiledChunk = await readFile(
			`${dir}/build/${bundleFile}`,
			'utf8'
		);

		// "Hello World!" should replace 'process.env.PREACT_APP_MY_VARIABLE'
		expect(transpiledChunk.includes('"Hello World!"')).toBe(true);
		expect(transpiledChunk.includes('PREACT_APP_MY_VARIABLE')).toBe(false);
	});

	it('should respect `publicPath` value', async () => {
		let dir = await subject('public-path');
		await build(dir);
		const html = await getOutputFile(dir, 'index.html');

		expect(html).toEqual(
			expect.stringMatching(getRegExpFromMarkup(images.publicPath))
		);
	});

	describe('CLI Options', () => {
		it('--src', async () => {
			let dir = await subject('minimal');

			await mkdir(join(dir, 'renamed-src'));
			await rename(join(dir, 'index.js'), join(dir, 'renamed-src/index.js'));
			await rename(join(dir, 'style.css'), join(dir, 'renamed-src/style.css'));

			await expect(build(dir, { src: 'renamed-src' })).resolves.not.toThrow();
		});

		it('--dest', async () => {
			let dir = await subject('minimal');

			await build(dir, { dest: 'renamed-dest' });
			expect(await access(join(dir, 'renamed-dest'))).toBeUndefined();
		});

		it('--sw', async () => {
			let dir = await subject('minimal');

			const logSpy = jest.spyOn(process.stdout, 'write');

			await build(dir, { sw: true });
			expect(await access(join(dir, 'build', 'sw.js'))).toBeUndefined();
			expect(logSpy).toHaveBeenCalledWith(
				expect.stringContaining('Could not find sw.js')
			);

			await build(dir, { sw: false });
			await expect(access(join(dir, 'build', 'sw.js'))).rejects.toThrow(
				'no such file or directory'
			);
		});

		it('--babelConfig', async () => {
			// Targets IE11, so arrow functions should be removed
			// Prerendering is disabled to avoid (non-relevant) regenerator issues
			let dir = await subject('custom-babelrc');

			await build(dir, { prerender: false });
			let transpiledChunk = await getOutputFile(dir, /bundle\.\w{5}\.js$/);
			expect(/=>\s?setTimeout/.test(transpiledChunk)).toBe(false);

			await rename(join(dir, '.babelrc'), join(dir, 'babel.config.json'));
			await build(dir, {
				babelConfig: 'babel.config.json',
				prerender: false,
			});
			transpiledChunk = await getOutputFile(dir, /bundle\.\w{5}\.js$/);
			expect(/=>\s?setTimeout/.test(transpiledChunk)).toBe(false);
		});

		it('--template', async () => {
			let dir = await subject('custom-template');

			await rename(
				join(dir, 'template.ejs'),
				join(dir, 'renamed-template.ejs')
			);
			await build(dir, { template: 'renamed-template.ejs' });

			const html = await getOutputFile(dir, 'index.html');
			expect(html).toEqual(
				expect.stringMatching(getRegExpFromMarkup(images.template))
			);
		});

		it('--prerender', async () => {
			let dir = await subject('minimal');

			await build(dir, { prerender: true });
			let html = await getOutputFile(dir, 'index.html');
			expect(html).toMatch('<h1>Minimal App</h1>');

			await build(dir, { prerender: false });
			html = await getOutputFile(dir, 'index.html');
			expect(html).not.toMatch('<h1>Minimal App</h1>');
		});

		it('--prerenderUrls', async () => {
			let dir = await subject('multiple-prerendering');

			await build(dir, { prerenderUrls: 'prerender-urls.json' });
			expect(await access(join(dir, 'build/index.html'))).toBeUndefined();
			expect(
				await access(join(dir, 'build/route66/index.html'))
			).toBeUndefined();
			expect(
				await access(join(dir, 'build/custom/index.html'))
			).toBeUndefined();

			await rename(
				join(dir, 'prerender-urls.json'),
				join(dir, 'renamed-urls.json')
			);
			await build(dir, { prerenderUrls: 'renamed-urls.json' });
			expect(await access(join(dir, 'build/index.html'))).toBeUndefined();
			expect(
				await access(join(dir, 'build/route66/index.html'))
			).toBeUndefined();
			expect(
				await access(join(dir, 'build/custom/index.html'))
			).toBeUndefined();
		});

		it('--inlineCss', async () => {
			let dir = await subject('minimal');

			await build(dir, { inlineCss: true });
			let head = await getHead(dir);
			expect(head).toMatch('<style>h1{color:red}</style>');

			await build(dir, { inlineCss: false });
			head = await getOutputFile(dir, 'index.html');
			expect(head).not.toMatch(/<style>[^<]*<\/style>/);
		});

		it('--config', async () => {
			let dir = await subject('custom-webpack');

			await build(dir, { config: 'preact.config.js' });
			expect(await access(join(dir, 'build/bundle.js'))).toBeUndefined();

			await rename(
				join(dir, 'preact.config.js'),
				join(dir, 'renamed-config.js')
			);
			await build(dir, { config: 'renamed-config.js' });
			expect(await access(join(dir, 'build/bundle.js'))).toBeUndefined();
		});

		it('--invalid-arg', async () => {
			const { code, stderr } = shell.exec(
				`node ${join(__dirname, '../src/index.js')} build --invalid-arg`
			);
			expect(stderr).toMatch(
				"Invalid argument '--invalid-arg' passed to build."
			);
			expect(code).toBe(1);
		});
	});

	describe('CSS', () => {
		it('should resolve CSS imports', async () => {
			let dir = await subject('css-imports');

			await mkdir(`${dir}/node_modules/fake-module`, { recursive: true });
			await writeFile(
				`${dir}/node_modules/fake-module/style.css`,
				'h2{color:green}'
			);

			await build(dir);
			const builtStylesheet = await getOutputFile(dir, /bundle\.\w{5}\.css$/);

			expect(builtStylesheet).toMatch('h1{color:red}');
			expect(builtStylesheet).toMatch('h1{background:#ffdab9}');
			expect(builtStylesheet).toMatch(/body{background:url\(\/.*\.jpg\)}/);
			expect(builtStylesheet).toMatch('h2{color:green}');
		});

		it('should use plain CSS & CSS Modules together, determining loading method by filename', async () => {
			let dir = await subject('css-modules');
			await build(dir);
			const builtStylesheet = await getOutputFile(dir, /bundle\.\w{5}\.css$/);

			expect(builtStylesheet).toMatch('h1{color:red}');
			expect(builtStylesheet).toMatch(/\.text__\w{5}{color:blue}/);
		});

		it('should inline critical CSS only', async () => {
			let dir = await subject('css-inline');
			await build(dir);
			const builtStylesheet = await getOutputFile(dir, /bundle\.\w{5}\.css$/);
			const html = await getOutputFile(dir, 'index.html');

			expect(builtStylesheet).toMatch('h1{color:red}div{background:tan}');
			expect(html).toMatch('<style>h1{color:red}</style>');
		});

		// Issue #1411
		it('should preserve side-effectful CSS imports even if package.json claims no side effects', async () => {
			let dir = await subject('css-side-effect');
			await build(dir);

			const builtStylesheet = await getOutputFile(dir, /bundle\.\w{5}\.css$/);
			expect(builtStylesheet).toMatch('h1{background:#673ab8}');
		});

		it('should use SASS, SCSS, and CSS Modules for each', async () => {
			let dir = await subject('css-sass');
			await build(dir);
			const builtStylesheet = await getOutputFile(dir, /bundle\.\w{5}\.css$/);

			expect(builtStylesheet).toMatch('h1{background:blue;color:red}');
			expect(builtStylesheet).toMatch(/\.text__\w{5}{color:blue}/);
			expect(builtStylesheet).toMatch(/\.text__\w{5}{background:red}/);
		});
	});

	describe('prerender', () => {
		prerenderUrlFiles.forEach(prerenderUrls => {
			it(`should prerender the routes provided with '${prerenderUrls}'`, async () => {
				let dir = await subject('multiple-prerendering');
				await build(dir, { prerenderUrls });

				const body1 = await getBody(dir);
				looksLike(body1, images.prerender.home);

				const body2 = await getBody(dir, 'route66/index.html');
				looksLike(body2, images.prerender.route);

				const body3 = await getBody(dir, 'custom/index.html');
				looksLike(body3, images.prerender.custom);

				const head1 = await getHead(dir);
				expect(head1).toEqual(
					expect.stringMatching(
						getRegExpFromMarkup(images.prerender.heads.home)
					)
				);

				const head2 = await getHead(dir, 'route66/index.html');
				expect(head2).toEqual(
					expect.stringMatching(
						getRegExpFromMarkup(images.prerender.heads.route66)
					)
				);

				const head3 = await getHead(dir, 'custom/index.html');
				expect(head3).toEqual(
					expect.stringMatching(
						getRegExpFromMarkup(images.prerender.heads.custom)
					)
				);
			});
		});

		prerenderUrlFiles.forEach(prerenderUrls => {
			it(`should prerender the routes with data provided with '${prerenderUrls}' via provider`, async () => {
				let dir = await subject('multiple-prerendering-with-provider');
				await build(dir, { prerenderUrls });

				const body1 = await getBody(dir);
				looksLike(body1, images.prerender.home);

				const body2 = await getBody(dir, 'route66/index.html');
				looksLike(body2, images.prerender.route);

				const body3 = await getBody(dir, 'custom/index.html');
				looksLike(body3, images.prerender.custom);

				const body4 = await getBody(dir, 'customhook/index.html');
				looksLike(body4, images.prerender.customhook);

				const body5 = await getBody(dir, 'htmlsafe/index.html');
				looksLike(body5, images.prerender.htmlSafe);

				const head1 = await getHead(dir);
				expect(head1).toEqual(
					expect.stringMatching(
						getRegExpFromMarkup(images.prerender.heads.home)
					)
				);

				const head2 = await getHead(dir, 'route66/index.html');
				expect(head2).toEqual(
					expect.stringMatching(
						getRegExpFromMarkup(images.prerender.heads.route66)
					)
				);

				const head3 = await getHead(dir, 'custom/index.html');
				expect(head3).toEqual(
					expect.stringMatching(
						getRegExpFromMarkup(images.prerender.heads.custom)
					)
				);
			});
		});
	});
});
