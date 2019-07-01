var express = require('express');
var router = express.Router();
var pghelper = require('../modules/pghelper');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('test', { title: 'Express' });
});

router.get('/pgview', function(req, res, next) {
    pghelper.query_pg(function (data){
        res.render('show_change', { data: data });
    });
});

/*http://localhost:3000/hello */
router.get('/hello', function(req, res, next) {
    res.send('The time is ' + new Date().toString());
});


module.exports = router;
