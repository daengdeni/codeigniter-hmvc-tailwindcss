// Initialize modules
// Importing specific gulp API functions lets us write them below as series() instead of gulp.series()
const {
	src,
	dest,
	watch,
	series,
	parallel
} = require('gulp');
// Importing all the Gulp-related packages we want to use
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const babel = require('gulp-babel');

// File paths
const files = {
	scss: 'resources/scss/*.scss',
	js: 'resources/js/*.js',
	tailwind: 'resources/scss/tailwind/*.scss',
};

function tailwind_task() {
	return src([
        files.tailwind
    ], {
        allowEmpty: true,
    })
		.pipe(postcss([require('tailwindcss'), autoprefixer(), cssnano()]))
		.pipe(concat('tailwind.min.css'))
		.pipe(sourcemaps.write('.')) // write sourcemaps file in current directory
		.pipe(dest('assets/css'));
}

// Sass task: compiles the style.scss file into style.css
function scss_task() {
	return src([
        files.scss
    ], {
        allowEmpty: true,
    })
		.pipe(sourcemaps.init()) // initialize sourcemaps first
		.pipe(sass()) // compile SCSS to CSS
		.pipe(postcss([autoprefixer(), cssnano()]))
		.pipe(concat('style.min.css'))
		.pipe(sourcemaps.write('.')) // write sourcemaps file in current directory
		.pipe(dest('assets/css')); // put final CSS in dist folder
}

// JS task: concatenates and uglifies JS files to script.js
function js_task() {
	return src([
		files.js
	], {
        allowEmpty: true,
    })
		.pipe(
			babel({
				presets: ['@babel/preset-env'],
			})
		)
		.pipe(concat('script.min.js'))
		.pipe(uglify())
		.pipe(dest('assets/js'));
}

async function style_bundle() {
	return src(
		[
			'assets/css/style.min.css',
			'assets/css/tailwind.min.css',
		], {
			allowEmpty: true,
		}
	)
		.pipe(sourcemaps.init()) // initialize sourcemaps first
		.pipe(sass()) // compile SCSS to CSS
		.pipe(postcss([autoprefixer(), cssnano()])) // PostCSS plugins
		.pipe(concat('bundle.min.css'))
		.pipe(sourcemaps.write('.')) // write sourcemaps file in current directory
		.pipe(dest('assets/css')); // put final CSS in dist folder
}

async function script_bunlde() {
	return src(
		[], {
			allowEmpty: true,
		}
	)
		.pipe(concat('bundle.min.js'))
		.pipe(uglify())
		.pipe(dest('assets/js'));
}

// Watch task: watch SCSS and JS files for changes
// If any change, run scss and js tasks simultaneously
function watch_task() {
	watch([files.scss, files.js, files.tailwind], parallel(scss_task, js_task, tailwind_task));
}


// Export the default Gulp task so it can be run
// Runs the scss and js tasks simultaneously
// then runs cacheBust, then watch task
exports.default = series(parallel(scss_task, js_task, tailwind_task), watch_task);

exports.bundle = series(parallel(style_bundle, script_bunlde));