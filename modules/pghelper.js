//test for connect to pg using nodejs

var pg = require('pg');
var EventEmitter = require('events').EventEmitter;
var sprintf = require('sprintf').sprintf;

function query_pg(cb){
    //var connInfo = "tcp://postgres:postgres@10.9.5.36:5432/postgres";
    var connInfo = "tcp://postgres:postgres@127.0.0.1:5433/postgres";
    var client = new pg.Client(connInfo);
    var sqls = [];
    var numeric_types = ["integer, number, numeric, double, decimal"];

    client.connect(function(err) {
        if (err){
            return console.error("could not connect to pg server, err is: ", err);
        }

        client.query("select data from pg_logical_slot_peek_changes('nodejs_use', NULL, NULL);", function (err, result){
            if (err) {
                return console.log(err);
            }

            //console.log(result.rows);
            result.rows.forEach(function (oneChange, index) {
                //var ret = JSON.parse(result.rows[0].data);
                var ret = JSON.parse(oneChange.data);
                //console.log(ret);
                //console.log(ret.change);
                //console.log(ret.change[0]);
                ret.change.forEach(function (item, index) {
                    if ( item.kind !== "insert" )
                        console.log(item);

                    //console.log(item.kind);
                    //console.log(item.columnnames);
                    if (item.kind == "insert") {
                        var col_count = item.columnnames.length;
                        //var isql_demo = "insert into public.test (id, info, crt_time) values (1, 'test', '2019-06-27')";
                        var isql = sprintf("insert into %s.%s (", item.schema, item.table);
                        //console.log(isql);
                        item.columnnames.forEach(function(col, index){
                            if (index === col_count -1) {
                                isql += col;
                            } else {
                                isql += col + ", ";
                            }
                        });
                        isql += ") values( ";
                        //console.log(isql);

                        item.columnvalues.forEach(function(value, index){
                            if (numeric_types.indexOf(item.columntypes[index])  ===  -1){
                                if (index === col_count -1) {
                                    isql += sprintf("\'%s\'", value);
                                } else {
                                    isql += sprintf("\'%s\', ", value);
                                }

                            } else {
                                if (index === col_count -1) {
                                    isql += value;
                                } else {
                                    isql += value + ", ";
                                }
                            }
                        });
                        //console.log(isql);

                        isql += ");";
                        console.log(isql);
                        sqls.push(isql);
                    }


                });
                //处理完每行的遍历
            });

            cb(sqls);
            //console.log(sqls);
        });
    });
}

module.exports = {
    query_pg:query_pg
};
