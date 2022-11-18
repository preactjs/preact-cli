const LOGO = `
         ▄▄
     ▄▄▓▓▓▓▓▓▄▄
  ▄█▀▀█▓▓▓▓▓▓▓▀▀█▄▄
▐▓▌▐▓▓▓▒▄ ▀▄▄▓▓▓▌▐▓▌
▐▓▓▄▀▓▀ ▄▓▓▄▄▀▓▓ ▓▓▌
▐▓▓▓▌ ▒▓▌  ▐▓▓  ▓▓▓▌
▐▓▓ ▒▓▄▄▀▓▓▀ ▄▓▓ ▓▓▌
▐▓▌▐▓▓▓▀▀▄▄▀▀▓▓▓▌▐▓▌
  ▀█▄▄▒▓▓▓▓▓▓▒▄▄▒▀
      ▀▓▓▓▓▓▓▀▀
         ▀▀
`.replace(/(^\n+|\n+$)/g, '');

const color = (color, text) =>
	`\u001b[${color}m\u001b[2m${text}\u001b[22m\u001b[39m`;

const PURPLE = 35;

module.exports = function (text, useColor = true) {
	let logo = LOGO;

	if (text) {
		logo = logo.split('\n');

		let words = text.split(' ');
		for (let i = 0; i < words.length; i++) {
			let index = words[i].indexOf('\n');
			if (~index) {
				words.splice(
					i,
					1,
					words[i].substring(0, index),
					'\n',
					words[i].substring(index + 1)
				);
				i += 2;
			}
		}
		let index = 3,
			start = 21,
			max = 50;
		while (words.length && index <= 10) {
			let word = words.shift(),
				newlines = 0;
			if (word.match(/^\n/g)) {
				index += word.length - (word = word.replace(/^\n+/g, '')).length;
				words.unshift(word);
				continue;
			}
			if (word.match(/\n/)) {
				newlines = word.length - (word = word.replace(/\n/g, '')).length;
			}
			while (logo[index].length < start - 1) logo[index] += ' ';
			if (logo[index].length + 1 + word.length > max) {
				index++;
				words.unshift(word);
				continue;
			}
			logo[index] += ' ' + word;
			if (newlines) {
				index += newlines;
			}
		}

		if (useColor) {
			for (let index = 3; index <= 10; index++) {
				logo[index] =
					color(PURPLE, logo[index].substring(0, start)) +
					color(0, logo[index].substring(start));
			}
		}

		logo = logo.join('\n');
	}

	if (useColor) {
		logo = color(PURPLE, logo);
	}

	// if (useColor) logo = color(PURPLE, logo);

	return logo;
};

/*
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@ ((( @@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@ ((((((((( @@@@@@@@@@@@@
@@@@@@@@@@@ /(((((((((((((((,,@@@@@@@@@
@@@@@@@@ ((((((((((((((((((((((( @@@@@@
@@@@(.((((    /(((((((((((*    (((( (@@
@@@@(((( /(((((((  (((  (((((((, ((((@@
@@@@(((( .((((((((    .((((((((  ((((@@
@@@@((((( ((((((  (((((  (((((( (((((@@
@@@@((((((  (( ((((   (((( ((  ((((((@@
@@@@(((((((( (((((     ((((( ((((((((@@
@@@@((((((  (( ((((   (((( ((  ((((((@@
@@@@((((( ((((((  (((((  (((((( (((((@@
@@@@(((( .((((((((.   ,((((((((  ((((@@
@@@@(((( /(((((((  (((  (((((((. ((((@@
@@@@# ((((    (((((((((((((    ((((  @@
@@@@@@@@ ((((((((((((((((((((((( @@@@@@
@@@@@@@@@@@.,(((((((((((((((.@@@@@@@@@@
@@@@@@@@@@@@@@@ ((((((((( @@@@@@@@@@@@@
*/
