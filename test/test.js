// Model.import("index.find", "index.tab");

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
// Model.nameSpace("index");

Model.task("dothing1", function(scope, next){
    var msg = scope.msg;

    alert(msg);

    setTimeout(function(){
        next();
    }, 10000);
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

//Model.runWorkflow(["mainFlow"].then('dothing1'));

Model.task('p', function(next){
    setTimeout(function(){
        next();
    }, 1000);
});

Model.task('f', function(){
    alert('ok');
});

// Model.runWorkflow(['p'].then1('f'));

//Model.runWorkflow(["index.mainFlow"]);
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

// Model.runWorkflow("main", {left: 1});


Model.task("bindEvent", function(scope){
    var p = $(".p");

    p.on("click", function(){
        Model.startWorkflow("add");
    });
});


Model.task('do1', function(scope, next, {$, p}){
        console.log('do1');
    setTimeout(function(){
        console.log('do1 back');
        next();
    }, 1000);
        //$q.abort();
});

Model.task('do2', function(next){
        console.log('do2');
    setTimeout(function(){
        console.log('do2 back');
        next();
    }, 2000);
});

Model.task('do3', function(){
    alert('do3');
});

Model.task('testThen', ['do1', 'do2'].then(['do3']));
// Model.runWorkflow('testThen');

/*
Model.nameSpace("index2");
    Model.task("dothing2", function(scope){

    });



Model.runWorkflow("index.mainFlow");

*/


Model.task('testGlobalService', function(scope, {Util, Test}){
});

// Model.runWorkflow('testGlobalService');
Model.task('pp', [function(getFlag){
    console.log(getFlag(2));
}]);

/*
Model.task('f', [function(){
    console.log(1);
}, function(){
    console.log(2);
}]);
*/

// Model.runWorkflow('f');


 Model.runWorkflow('pp');

