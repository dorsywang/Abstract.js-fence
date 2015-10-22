Model.import("index.find", "index.tab");

Model.service("scope", function(){
    return {
    };
});

Model.service("di2", function(){
    return function(p){
    };
});

Model.service("di1", function(di2, di3, di4){
    return function(){
    };
});


//声明命名空间
Model.nameSpace("index");

Model.task("dothing1", function(scope){
    var msg = scope.msg;

    alert(msg);
    //var {name, pig}
    //var {name, pig, right} = scope;
});

Model.task("dothing2", function(scope){
    return {
        msg: 'yeah!'
    };
});

Model.task("mainFlow", ['dothing2', 'dothing1'], function(scope){
    alert("OK");
});

Model.runWorkflow(["index.mainFlow"]);
//Model.runWorkflow("index.mainFlow");
//

Model.service("processBig", function(){
    return function(input){
        return input * 2; 
    };
});

Model.service("getFlag", function(processBig){
    return function(input){
        return processBig(++ input); 
    };
});


Model.service("scope", function(){
    return {
    };
});

Model.task("main", function(getFlag, scope){
    var p = getFlag(1);

    alert(p);
});

//Model.runWorkflow("main", {left: 1});


Model.task("bindEvent", function(scope){
    var p = $(".p");

    p.on("click", function(){
        Model.startWorkflow("add");
    });
});


Model.task('do1', function($q){
    setTimeout(function(){
        $q.next();
    }, 1000);
});

Model.task('do2', function($q){
    setTimeout(function(){
        $q.next();
    }, 2000);
});

Model.task('do3', function(){
});

Model.task('testThen', ['do1', 'do2'].then(['do3']));

/*
Model.nameSpace("index2");
    Model.task("dothing2", function(scope){

    });



Model.runWorkflow("index.mainFlow");

*/
