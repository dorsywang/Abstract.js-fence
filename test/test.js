Model.import("index.find", "index.tab");

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

//Model.runWorkflow(["index.mainFlow"]);
Model.runWorkflow("index.mainFlow");


Model.task("bindEvent", function(scope){
    var p = $(".p");

    p.on("click", function(){
        Model.startWorkflow("add");
    });
});

/*
Model.nameSpace("index2");
    Model.task("dothing2", function(scope){

    });



Model.runWorkflow("index.mainFlow");

*/
