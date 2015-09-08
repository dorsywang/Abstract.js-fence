Model.service("alert1", function(scope){
    var msg = scope.msg;

    return {
        msg: "ok"
    };
});

Model.service("getMsg", function(scope){
    return {
        msg: "test1"
    };
});

Model.service("runCode", ["getMsg", "alert1"]);

var scope = Model.runWorkflow("runCode");
console.log(scope);

var f = function(){
    var a = 'red';

    var p = dosomething(a);

    dosmoething2(p);
};


Model.task("varInit", function(scope){
    var a = 3;

    return {
        a: 3
    };
});

Model.task("dosomething", function(scope){
    var a = scope.a;

    return {
        p: red
    };
});

Model.task("dosomething2", function(scope){
    var p = scope.p;

    return {
        hello: 'ok'
    };
});

Model.task("init", ['varInit', 'dosomething', 'dosomething2']);

Model.runWorkflow('init');


//Model.nameSpace("Flash", function(){
    Model.task("setULHeight", function(scope){
        var height = $(".sliderItem img").height();

        $("#sliderWrapper").height(height);
    });

    Model.task("bindEvent", function(scope){
    });

    Model.task("intervalTask", function(scope){
    });

    Model.task("play", [function(scope){
    }, task($setInterval, intervalTask)]);

    Model.task("init", ['setULHeight', 'bindEvent', 'play']);

    Model.runWorkflow("init");
//});


/*
Model.nameSpace("Flash", {
    setULHeight: function(scope){
    },

    bindEvent: function(scope){
    },

    init: ['setULHeight', 'bindEvent', 'play']
});

Model.runWorkflow("Flash.init");
*/
