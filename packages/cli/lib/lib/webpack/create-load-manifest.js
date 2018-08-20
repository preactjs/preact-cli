module.exports = (assets, isESMBuild) => {
  let mainJs, mainCss, scripts=[], styles=[];
  for (let filename in assets) {
    if (!/\.map$/.test(filename)) {
      if (/route-/.test(filename) && !isESMBuild) {
        scripts.push(filename);
      } else if (/route-(.+)\.esm\.js/.test(filename) && isESMBuild) {
        scripts.push(filename);
      } else if (/chunk\.(.+)\.css$/.test(filename)) {
        styles.push(filename);
      } else if (/^bundle(.+)\.css$/.test(filename)) {
        mainCss = filename;
      } else if (!isESMBuild && /^bundle(.+)\.js$/.test(filename)) {
        mainJs = filename;
      } else if (isESMBuild && /bundle\.\w{5}\.esm\.js/.test(filename)) {
        mainJs = filename;
      }
    }
  }

  let defaults = {
    [mainCss]: {
      type: 'style',
      weight: 1
    },
    [mainJs]: {
      type: 'script',
      weight: 1
    },
  },
  manifest = {};

  let path, css, obj;
  scripts.forEach((filename, idx) => {
    css = styles[idx];
    obj = Object.assign({}, defaults);
    obj[filename] = { type:'script', weight:0.9 };
    if (css) obj[css] = { type:'style', weight:0.9 };
    path = filename.replace(/route-/, '/')
      .replace(/\.chunk(\.\w+)?\.js$/, '')
      .replace(/\.chunk(\.\w+)?\.esm\.js$/, '')
      .replace(/\/home/, '/');
    if (!manifest[path]) {
      manifest[path] = obj;
    } else {
      manifest[path][filename] = { type:'script', weight:0.9 };
    }
  });

  return manifest;
};

