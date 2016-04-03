var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

// 清理
gulp.task('clean', function() {
  return gulp.src(['.sass-cache'], {read: false})
    .pipe(plugins.clean());
});

// 脚本
gulp.task('scripts', function () {
    return gulp.src('src/scripts/**/*.js')
        .pipe(plugins.jshint())
        //.pipe(plugins.jshint.reporter('default'))
        .pipe(plugins.babel({
            presets: ['es2015']
        }))
        .pipe(plugins.uglify())
        .pipe(plugins.concat('all.js'))
        .pipe(plugins.obfuscate())
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(gulp.dest('dist/scripts'))
        .pipe(reload({stream: true}));
});

// 样式
gulp.task('sass', function() {
  return gulp.src('./src/sass/*.scss')
    .pipe(plugins.sass())
    .pipe(plugins.autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe(plugins.minifyCss())
    .pipe(gulp.dest('dist/css'))
    .pipe(reload({stream: true}));
});

// 图片
gulp.task('images', function() {
  return gulp.src('src/images/**/*.{png,jpg,svg,ico}')  //GIF 报错
    .pipe(plugins.cache(plugins.imagemin({
        optimizationLevel: 3, //类型：Number  默认：3  取值范围：0-7（优化等级）
        progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
        interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
        multipass: true, //类型：Boolean 默认：false 多次优化svg直到完全优化
        svgoPlugins: [{removeViewBox: false}]//不要移除svg的viewbox属性
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe(plugins.notify({ message: 'Images task complete' }));
});

//html
gulp.task('html', function () {
    return gulp.src('./*.html') // 要压缩的html文件
    .pipe(plugins.minifyHtml()) //压缩
    .pipe(plugins.rename(function (path) {
       path.dirname += "/dist/html";
        path.basename += "-min";
        path.extname = ".html";
    }))
    .pipe(gulp.dest('./'))
    .pipe(reload({stream: true}));
});

// 静态服务器 + 监听
gulp.task('serve', ['sass','scripts','html'], function() {

    browserSync.init({
        server: "./"
    });

    // 看守所有.scss档
    gulp.watch('src/sass/**/*.scss', ['sass']);
    // 看守所有.html
    gulp.watch('./*.html', ['html']);
    // 看守所有.js档
    gulp.watch('src/scripts/**/*.js', ['scripts']);

    gulp.watch("./*.html").on('change', reload);
    gulp.watch("./dist/html/*.html").on('change', reload);
});

 //定义默认任务
gulp.task('default', ['serve'],function(){
    //gulp.start('html' ,'images', 'scripts', 'sass');
    console.log('ok');
});

// gulp.task(name[, deps], fn) 定义任务  name：任务名称 deps：依赖任务名称 fn：回调函数
// gulp.src(globs[, options]) 执行任务处理的文件  globs：处理的文件路径(字符串或者字符串数组)
// gulp.dest(path[, options]) 用来写文件的
// gulp.run(tasks...)：尽可能多的并行运行多个task
// gulp.watch(glob, fn)：当glob内容发生改变时，执行fn
//
// glob：可以是一个直接的文件路径。他的含义是模式匹配。
// gulp将要处理的文件通过管道（pipe()）API导向相关插件。通过插件执行文件的处理任
//
// js/app.js 精确匹配文件
// js/*.js 仅匹配js目录下的所有后缀为.js的文件
// js/*/.js 匹配js目录及其子目录下所有后缀为.js的文件
// !js/app.js 从匹配结果中排除js/app.js，这种方法在你想要匹配除了特殊文件之外的所有文件时非常管用
// *.+(js|css) 匹配根目录下所有后缀为.js或者.css的文件