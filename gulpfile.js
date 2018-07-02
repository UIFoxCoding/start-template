'use strict';
// Using Gulp4
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var fileinclude = require('gulp-file-include');
var imageminJpegRecompress = require('imagemin-jpeg-recompress');
var imageminPngquant = require('imagemin-pngquant');
var browserSync = require('browser-sync').create();

// -------------------- Config
var config = {
  production: false,

  // -------------------- Project
  projectDir: './../_package/',
  projectName: 'project-name',
  projectVersion: 'v1.0.0',

  // -------------------- Path
  path: {
    clean: './dist/'
  },

  // -------------------- Autoprefixer
  autoprefixer: {
    opts: {
      browsers: ["last 8 versions"],
      cascade: false
    }
  },

  // -------------------- Browsersync
  browsersync: {
    opts: {
      server: {
        baseDir: './dist/'
      },
      port: 4000,
      notify: false
    },
    watch: [
      './src/**/*.html',
      './src/assets/styles/sass/**/*.{scss,sass}',
      './src/assets/scripts/js/**/*.js'
    ]
  },

  // -------------------- Html
  html: {
    src: [
      './src/**/*.html',
      '!src/template/**/*'
    ],
    dest: './dist/'
  },

  // -------------------- Sass
  sass: {
    src: [
      "./src/assets/styles/sass/**/*.{scss,sass}"
    ],
    dest: './dist/assets/css/'
  },

  // -------------------- Scripts
  scripts: {
    src: [
      './src/assets/scripts/js/**/*.js',
    ],
    dest: './dist/assets/js'
  },

  // -------------------- Images
  img: {
    src: [
      './src/assets/img/**/*',
    ],
    dest: './dist/assets/img'
  },

  // -------------------- Fonts
  fonts: {
    src: [
      './src/assets/fonts/**/*',
    ],
    dest: './dist/assets/fonts'
  },

  // -------------------- Favicons
  favicons: {
    src: [
      './src/favicons/*.{jpg,jpeg,png,gif}'
    ],
    opts: {
      icons: {
        appleIcon: true,
        favicons: true,
        online: false,
        appleStartup: false,
        android: true,
        firefox: false,
        yandex: false,
        windows: false,
        coast: false
      }
    },
    dest: './dist/favicons/'
  },

  // -------------------- Vendors
  vendors: {
    js: {
      src: [
        './src/assets/scripts/vendor/*.js'
      ],
      dest: './dist/assets/vendor/js'
    },
    css: {
      src: [
        './node_modules/bootstrap/dist/css/bootstrap.css'
      ],
      dest: './dist/assets/vendor/css'
    },
    sass: {
      src: [
        './src/assets/styles/vendor/*.{scss,sass}'
      ],
      dest: './dist/assets/vendor/css'
    },
    fonts: {
      src: [
        './node_modules/@fortawesome/fontawesome-free/webfonts/**/*'
      ],
      dest: './dist/assets/vendor/fonts'
    }
  }
};

// -------------------- Tasks
gulp.task('clean', (done) => {
  del(config.path.clean);
  done();
});

gulp.task('html', function () {
  return gulp.src(config.html.src)
    .pipe(plugins.plumber())
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest(config.html.dest));
});

gulp.task('styles', function () {
  return gulp.src(config.sass.src)
    .pipe(plugins.plumber())
    .pipe(plugins.if(config.production, plugins.sourcemaps.init()))
    .pipe(plugins.sass().on('error', plugins.sass.logError))
    .pipe(plugins.autoprefixer(config.autoprefixer.opts))
    .pipe(plugins.jsbeautifier({
      indent_size: 2
    }))
    .pipe(gulp.dest(config.sass.dest))
    .pipe(plugins.if(config.production, plugins.cssnano()))
    .pipe(plugins.if(config.production, plugins.rename("styles.min.css")))
    .pipe(plugins.if(config.production, plugins.sourcemaps.write('.')))
    .pipe(plugins.if(config.production, gulp.dest(config.sass.dest)));
});

gulp.task('scripts', function () {
  return gulp.src(config.scripts.src)
    .pipe(plugins.plumber())
    .pipe(plugins.if(config.production, plugins.sourcemaps.init()))
    .pipe(plugins.jsbeautifier({
      indent_size: 2
    }))
    .pipe(gulp.dest(config.scripts.dest))
    .pipe(plugins.if(config.production, plugins.uglify()))
    .pipe(plugins.if(config.production, plugins.rename("main.min.js")))
    .pipe(plugins.if(config.production, plugins.sourcemaps.write('.')))
    .pipe(plugins.if(config.production, gulp.dest(config.scripts.dest)));
});

gulp.task('fonts', function () {
  return gulp.src(config.fonts.src)
    .pipe(gulp.dest(config.fonts.dest));
});

gulp.task('images', function () {
  return gulp.src(config.img.src)
    .pipe(plugins.if(config.production,
      plugins.cache(plugins.imagemin([
        plugins.imagemin.gifsicle({
          interlaced: true
        }),
        plugins.imagemin.jpegtran({
          progressive: true
        }),
        imageminJpegRecompress({
          loops: 5,
          min: 65,
          max: 70,
          quality: 'medium'
        }),
        plugins.imagemin.svgo(),
        plugins.imagemin.optipng({
          optimizationLevel: 3
        }),
        imageminPngquant({
          quality: '65-70',
          speed: 5
        })
      ], {
        verbose: true
      }))
    ))
    .pipe(gulp.dest(config.img.dest));
});

gulp.task('favicons', function () {
  return gulp.src(config.favicons.src)
    .pipe(plugins.favicons(config.favicons.opts))
    .pipe(gulp.dest(config.favicons.dest));
});

gulp.task('vendor:scripts', function () {
  return gulp.src(config.vendors.js.src)
    .pipe(plugins.uglify())
    .pipe(plugins.rename({
      suffix: ".min",
      extname: ".js"
    }))
    .pipe(gulp.dest(config.vendors.js.dest));
});

gulp.task('vendor:sass', function () {
  return gulp.src(config.vendors.sass.src)
    .pipe(plugins.sass().on('error', plugins.sass.logError))
    .pipe(plugins.autoprefixer(config.autoprefixer.opts))
    .pipe(plugins.cssnano())
    .pipe(plugins.rename({
      suffix: ".min",
      extname: ".css"
    }))
    .pipe(gulp.dest(config.vendors.sass.dest));
});

gulp.task('vendor:css', function () {
  return gulp.src(config.vendors.css.src)
    .pipe(plugins.cssnano())
    .pipe(plugins.rename({
      suffix: ".min",
      extname: ".css"
    }))
    .pipe(gulp.dest(config.vendors.css.dest));
});

gulp.task('vendor', gulp.series(
  'vendor:scripts', 'vendor:sass', 'vendor:css'
));

gulp.task('moveDist', function () {
  return gulp.src('./dist/**/*.*')
    .pipe(gulp.dest(config.projectDir + config.projectName + '/' + config.projectVersion));
});

gulp.task('watch', function () {
  gulp.watch('./src/**/*.html', gulp.series('html'));
  gulp.watch(config.sass.src, gulp.series('styles'));
  gulp.watch(config.scripts.src, gulp.series('scripts'));
});

gulp.task('sync', function () {
  browserSync.init(config.browsersync.opts);
  browserSync.watch(config.browsersync.watch).on('change', browserSync.reload);
});

gulp.task('build', gulp.series('clean',
  gulp.parallel('html', 'styles', 'scripts', 'fonts', 'images', 'favicons', 'vendor')
));

gulp.task('serve', gulp.parallel('watch', 'sync'));

gulp.task('default', gulp.series('build', 'serve'));