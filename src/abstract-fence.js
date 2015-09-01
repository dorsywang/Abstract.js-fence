if(typeof Model !== "undefined"){
}else{
    Model = {};
}

Model.extend = function(opt){
    for(var i in opt){
        if(opt.hasOwnProperty(i)){
            Model[i] = opt[i];
        }
    }
};

Model.extend({
    fence: 1,
    tasks: {
    },

    serviceMap: {
    },

    importList: [],

    // 引入的列表
    "import": function(){
        var args = arguments;
    },

    nameSpace: function(name){
        this.currNameSpace = name;

        if(! this.tasks[name]){
            this.tasks[name] = {};
        }
    },

    // 服务
    service: function(name, func){
        name = name.trim();

        this.serviceMap[name] = func;
    },

    // 进行任务配置
    task: function(name, taskModules, func){
        if(typeof taskModules === "function"){
            func = taskModules;
            taskModules = [];
        }


        var tasks;
        if(this.currNameSpace){
            tasks = this.tasks[this.currNameSpace];


            // 判读taskModules是否有前缀，无前缀加前缀
            for(var i = 0; i < taskModules.length; i ++){
                var item = taskModules[i];

                if(item.indexOf(".") > -1){
                }else{
                    item = this.currNameSpace + "." + item;
                }

                taskModules[i] = item;
            }
        }else{
            tasks = this.tasks;
        }

        tasks[name] = {
            taskModules: taskModules,
            func: func
        };
    },

    _runFunc: function(func, scope){
       // 进行预处理
        var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
        var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        var fnText = func.toString().replace(STRIP_COMMENTS, '');
        var argDecl = fnText.match(FN_ARGS);

        // 依赖的模块
        var deps = (argDecl[1] && argDecl[1].split(",")) || [];

        var args = [];
        var _this = this;

        // 取到service的实体
        var getServiceObj = function(serviceName){
            serviceName = serviceName.trim();

            var serviceFunc = _this.serviceMap[serviceName];

            if(serviceName === "scope"){
                return scope;
            }

            if(typeof serviceFunc === "undefined"){
                console.error("Model: " + serviceName + " is not defined");

                return function(){};
            }

            return _this._runFunc(serviceFunc);
        };

        for(var i = 0; i < deps.length; i ++){
            args.push(getServiceObj(deps[i]));
        }

        var scope = {};

        return func.apply(scope, args);
    },

    runWorkflow: function(nameOrServiceFlow, initScope){
        var taskModules;
        var initFunc;
        if(typeof nameOrServiceFlow === "string"){
            var name = nameOrServiceFlow;

            var argsList;
            // 进行nameSpace处理
            if(/\./.test(name)){
                argsList = name.split(".");
            }else{
                argsList = [name];
            }

            var _this = this;
            var getFuncOpt = function(list){
                var val = _this.tasks;
                for(var i = 0; i < list.length; i ++){
                    var item = list[i];
                    if(val[item]){
                        val = val[item];
                    }else{
                        return;
                    }
                }

                return val;
            };

            var funcOpt = getFuncOpt(argsList);


            if(funcOpt){
                taskModules = funcOpt.taskModules;
                initFunc= funcOpt.func;
            }
        }else if(nameOrServiceFlow.hasOwnProperty("length")){
            taskModules = nameOrServiceFlow;
            initFunc = function(scope){return scope;};
        }

        var scope = initScope || {};

        var addScope = function(scope){
            
        };

        for(var i = 0; i < taskModules.length; i ++){
            var taskName = taskModules[i];
            var returnScope = this.runWorkflow(taskName, scope);

            for(var j in returnScope){
                if(returnScope.hasOwnProperty(j)){
                    scope[j] = returnScope[j];
                }
            }
        }

        if(initFunc){
            // 接力scope
            return this._runFunc(initFunc, scope);
        }else{
            return scope;
        }
    }
});
