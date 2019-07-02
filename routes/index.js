var express = require('express');
var router = express.Router();
var pghelper = require('../modules/pghelper');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('test', { title: 'Express' });
});

router.get('/pgview', function(req, res, next) {
    var change_type = "choose_peek";
    var choose_get = "false";
    var choose_peek = "true";
    pghelper.query_pg(change_type, function (data){
        res.render('show_change', { data: data, get: choose_get, peek: choose_peek});
    });
});

router.post('/pgview/choose', function(req, res) {
    console.log(req.body);

    var change_type = "choose_peek";
    var choose_peek = "true";
    var choose_get = "false";
    if (req.body.change_type === '1') {
        change_type = "choose_get";
        choose_get = "true";
        choose_peek = "false";
    }
    console.log("change_type is: %s, choose_get value is: %s, choose_peek value is: %s", change_type, choose_get, choose_peek);

    pghelper.query_pg(change_type, function (data){
        res.render('show_change', { data: data, get: choose_get, peek: choose_peek });
    });

});

/*http://localhost:3000/hello */
router.get('/hello', function(req, res, next) {
    res.send('The time is ' + new Date().toString());
});


module.exports = router;
