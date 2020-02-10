const gulp = require('gulp');
const less = require('gulp-less');
const minifyCSS = require('gulp-csso');
const autoprefixerCSS = require('gulp-autoprefixer');
const del = require('del');
const browserSync = require('browser-sync');
const webpackStream = require('webpack-stream');
const imgMin = require('gulp-imagemin');
const svgMin = require('gulp-svgmin');
const sourcemaps = require('gulp-sourcemaps');
const gutil = require('gulp-util');
const gulpif = require('gulp-if');

let dev;
gutil.env.type === 'development' ? dev = true : dev = false;

function css(){
    return gulp.src('./css/styles.less')
            .pipe(gulpif(dev, sourcemaps.init()))
            .pipe(less())
            .pipe(autoprefixerCSS())           
            .pipe(minifyCSS())
            .pipe(gulpif(dev, sourcemaps.write()))
            .pipe(gulp.dest('./build/css'))
            .pipe(browserSync.stream());
}

function js(){
    return gulp.src('./js/index.js')
            .pipe(webpackStream(
                {
                    output: {
                        filename: 'main.js'
                    },
                    module: {
                        rules: [
                            {
                                test: /\.m?js$/,
                                exclude: /(node_modules)/,
                                use: {
                                    loader: 'babel-loader',
                                    options: { presets: [
                                        ['@babel/preset-env', 
                                        {
                                        targets: {
                                            browsers: [
                                              'ie >= 11'
                                            ]
                                        }
                                        }
                                    ]]}
                                }
                            }
                        ] 
                    },
                    mode: dev ? 'development' : 'production',
                    devtool: dev ? 'source-map' : 'none'
                }
            ))
            .pipe(gulp.dest('./build/js'))
            .pipe(browserSync.stream());
}

function image() {
    return gulp.src('./images/**/*')
            .pipe(gulpif(!dev, imgMin()))
            .pipe(gulp.dest('./build/images'))
            .pipe(browserSync.stream());
}

function svg() {
    return gulp.src('./icons/**/*')
            .pipe(gulpif(!dev, svgMin()))
            .pipe(gulp.dest('./build/icons'))
            .pipe(browserSync.stream());
}

function html() {
    return gulp.src('./*.html')
        .pipe(gulp.dest('./build'))
        .pipe(browserSync.stream());
}

function watch() {
    browserSync.init({
        server: {
            baseDir: "./build"
        }
    });
    gulp.watch('./js/**/*.js', js);
    gulp.watch('./css/**/*.less', css);
    gulp.watch('./images', image);
    gulp.watch('./icons', svg);
    gulp.watch('./*.html', html);
}

function delBuild(){
    return del(['build/*']);
}

gulp.task('css', css);
gulp.task('js', js);
gulp.task('image', image);
gulp.task('svg', svg);
gulp.task('html', html);
gulp.task('watch', watch);

gulp.task('default', gulp.series(delBuild, gulp.parallel('html','css','js', 'image', 'svg')));
gulp.task('dev', gulp.series('default', 'watch'));