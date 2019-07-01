var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var app = express();

var bodyParser = require('body-parser');
// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false  });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


var users = { 
    'byvoid': {
        name: 'Carbo',
        website: 'http://www.byvoid.com'
    }
};

app.all('/users/:username', function(req, res, next) { // 检查用户是否存在
    if (users[req.params.username]) {
        next(); 
    } else {
        next(new Error(req.params.username + ' does not exist.')); 
    }
});

app.get('/users/:username', function(req, res) {
    // 用户一定存在,直接展示
    res.send(JSON.stringify(users[req.params.username])); 
});

app.put('/users/:username', function(req, res) { 
    console.log(req.body);
    users[req.params.username].website = "www.ks17.com"; 
    // 修改用户信息
    res.send('Done');
});

app.post('/users/:username', function(req, res) { 
    // 定义了一个post变量，用于暂存请求体的信息
   // var post = '';     

   // // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量中
   // req.on('data', function(chunk){    
   //     post += chunk;
   // });

   // // 在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
   // req.on('end', function(){    
   //     //post = querystring.parse(post);
   //     //res.end(util.inspect(post));
   //     users[req.params.username].website = "www.ks17.com"; 
   //     // 修改用户信息
   //     res.send('Done');
   // });
    users[req.params.username].website = "www.ks17.com"; 
    // 修改用户信息
    res.send('Done');
});

app.post('/process_post', urlencodedParser, function (req, res) {
    // 输出 JSON 格式
    var response = {
        "first_name":req.body.first_name,
        "last_name":req.body.last_name
    };
    console.log(response);
    res.end(JSON.stringify(response));
});




// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
