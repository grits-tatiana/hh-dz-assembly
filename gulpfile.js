const gulp = require('gulp');
const less = require('gulp-less');
const minifyCSS = require('gulp-csso');
const autoprefixerCSS = require('gulp-autoprefixer');
const del = require('del');
const browserSync = require('browser-sync');
const webpackStream = require('webpack-stream');
const imgMin = require('gulp-imagemin');
const svgMin = require('gulp-svgmin');

function css(){
    return gulp.src('./css/styles.less')
            .pipe(less())
            .pipe(autoprefixerCSS())           
            .pipe(minifyCSS())
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
                    }
                }
            ))
            .pipe(gulp.dest('./build/js'))
            .pipe(browserSync.stream());
}

function image() {
    return gulp.src('./images/**/*')
            .pipe(imgMin())
            .pipe(gulp.dest('./build/images'))
            .pipe(browserSync.stream());
}

function svg() {
    return gulp.src('./icons/**/*')
            .pipe(svgMin())
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