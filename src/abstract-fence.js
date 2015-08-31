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

    // 进行任务配置
    task: function(name, serviceModules, func){
        if(typeof serviceModules === "function"){
            func = serviceModules;
            serviceModules = [];
        }


        var tasks;
        if(this.currNameSpace){
            tasks = this.tasks[this.currNameSpace];


            // 判读serviceModules是否有前缀，无前缀加前缀
            for(var i = 0; i < serviceModules.length; i ++){
                var item = serviceModules[i];

                if(item.indexOf(".") > -1){
                }else{
                    item = this.currNameSpace + "." + item;
                }

                serviceModules[i] = item;
            }
        }else{
            tasks = this.tasks;
        }

        tasks[name] = {
            serviceModules: serviceModules,
            func: func
        };
    },

    runWorkflow: function(nameOrServiceFlow, initScope){
        var serviceModules;
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
                serviceModules = funcOpt.serviceModules;
                initFunc= funcOpt.func;
            }
        }else if(nameOrServiceFlow.hasOwnProperty("length")){
            serviceModules = nameOrServiceFlow;
            initFunc = function(scope){return scope;};
        }

        var scope = initScope;

        var addScope = function(scope){
            
        };

        for(var i = 0; i < serviceModules.length; i ++){
            var serviceName = serviceModules[i];
            scope = this.runWorkflow(serviceName, scope);
        }

        if(initFunc){
            return initFunc(scope);
        }else{
            return scope;
        }
    }
});
