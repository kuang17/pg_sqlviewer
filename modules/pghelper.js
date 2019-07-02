///***************************************************************
///  @Filename: modules/pghelper.js
///  @Brief: 对PostgreSQL数据库的SQL变化获取
///   
///  注意:
///         1) 如果表没有创建主键，则无法探知他们的删除和更新变化 
///  @Author: kuang17 min.he@ww-it.cn
///  @Last modified: 2019-07-02 11:40
///***************************************************************
 

var pg = require('pg');
var EventEmitter = require('events').EventEmitter;
var sprintf = require('sprintf').sprintf;

function query_pg(change_type, cb){
    //var connInfo = "tcp://postgres:postgres@10.9.5.36:5432/postgres";
    var connInfo = "tcp://postgres:postgres@127.0.0.1:5433/postgres";
    var client = new pg.Client(connInfo);
    var sqls = [];
    var numeric_types = ["integer", "number", "numeric", "double", "decimal"];

    client.connect(function(err) {
        if (err){
            return console.error("could not connect to pg server, err is: ", err);
        }

        var sql = "select data from pg_logical_slot_peek_changes('nodejs_use', NULL, NULL);";
        if(change_type === "choose_get") {
            sql = "select data from pg_logical_slot_get_changes('nodejs_use', NULL, NULL);";
            console.log("use choose_get type sql change");
        }

        client.query(sql, function (err, result){
            if (err) {
                return console.log(err);
            }

            //console.log(result.rows);
            result.rows.forEach(function (oneChange, index) {
                //var ret = JSON.parse(result.rows[0].data);
                var ret = JSON.parse(oneChange.data);
                var isql;
                //console.log(ret);
                //console.log(ret.change);
                //console.log(ret.change[0]);
                ret.change.forEach(function (item, index) {
                    //if ( item.kind !== "insert" )
                    //    console.log(item);

                    //console.log(item.kind);
                    //console.log(item.columnnames);
                    if (item.kind == "insert") {
                        var col_count = item.columnnames.length;
                        //var isql_demo = "insert into public.test (id, info, crt_time) values (1, 'test', '2019-06-27')";
                        isql = sprintf("insert into %s.%s (", item.schema, item.table);
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
                    
                    if (item.kind === "delete") {
                        //删除和更新只对有主键的表才有消息
                        //在oldkeys中只记录了primary key 的变化，即使是使用非主键去删除，最后反应的也是对应主键的值来删除
                        isql = sprintf("delete from %s.%s where ", item.schema, item.table); 
                        item.oldkeys.keytypes.forEach(function (col_type, index){
                            if (numeric_types.indexOf(col_type) !== -1){
                                if (index === 0) {
                                    isql += sprintf("%s = %d ", item.oldkeys.keynames[index], item.oldkeys.keyvalues[index]); 
                                } else {
                                    isql += sprintf("and %s = %d ", item.oldkeys.keynames[index], item.oldkeys.keyvalues[index]); 
                                }
                            } else {
                                if (index === 0) {
                                    isql += sprintf("%s = \'%s\' ", item.oldkeys.keynames[index], item.oldkeys.keyvalues[index]); 
                                } else {
                                    isql += sprintf("and %s = \'%s\' ", item.oldkeys.keynames[index], item.oldkeys.keyvalues[index]); 
                                }
                            }
                        });
                        isql += ";";
                        console.log(isql);
                        sqls.push(isql);
                    }

                    if (item.kind === "update") {
                        console.log(item);
                        var col_count = item.columnnames.length;
                        isql = sprintf("update %s.%s set ", item.schema, item.table);
                        item.columnnames.forEach(function(col, index){
                            console.log(col);
                            if (numeric_types.indexOf(item.columntypes[index]) !== -1){
                                if (index !== col_count - 1) {
                                    isql += sprintf("%s = %d , ", col, item.columnvalues[index]);
                                } else {
                                    isql += sprintf("%s = %d ", col, item.columnvalues[index]);
                                }
                            } else {
                                if (index !== col_count - 1) {
                                    console.log('test string');
                                    isql += sprintf("%s = \'%s\' , ", col, item.columnvalues[index]);
                                } else {
                                    isql += sprintf("%s = \'%s\' ", col, item.columnvalues[index]);
                                }
                            }
                            console.log(isql);
                        });
                        isql += "where ";
                        col_count = item.oldkeys.keynames.length;
                        item.oldkeys.keynames.forEach(function(col, index) {
                            if (numeric_types.indexOf(item.oldkeys.keytypes[index]) !== -1){
                                if (index < col_count -1) {
                                    isql += sprintf("%s = %d and ", col, item.columnvalues[index]);
                                } else {
                                    isql += sprintf("%s = %d ", col, item.columnvalues[index]);
                                }
                            } else {
                                if (index < col_count -1) {
                                    isql += sprintf("%s = \'%s\' and ", col, item.columnvalues[index]);
                                } else {
                                    isql += sprintf("%s = \'%s\' ", col, item.columnvalues[index]);
                                }
                            }

                        });
                        isql += ";";
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
