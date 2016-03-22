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

Array.prototype.then = function(taskArr){
    if(typeof taskArr === "function"){
        console.log('then call --------------');
        taskArr();

        return;
    }

    var val = this.concat('then').concat(taskArr);
    if(! this.length){
        val = val.slice(1);
    }

    return val;
};


Model.extend({
    // 给func加一层语法糖
    tasks: {
    },

    fence: 1,

    version: '2.0',

    serviceMap: {
    },
       // 服务
    service: function(name, func){
        name = name.trim();

        this.serviceMap[name] = {
             func: func,
             serviceResult: null
        };
    },

    _runFunc: function(func, scope, next){
        var deps;

        // 是一个数组
        if(func.deps){
            deps = func.deps;
/*
        }
        else if(func.hasOwnProperty("length") && func[0]){
            var len = func.length;
            var _func = func.splice(len - 1, 1)
            deps = func;

            func = _func[0];
            */

        }else{
           // 进行预处理
            var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
            var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
            var fnText = func.toString().replace(STRIP_COMMENTS, '');
            var argDecl = fnText.match(FN_ARGS);

            var GLOBAL_REG = /\{([^\}]*)\}/g;

            var r;
            if(argDecl && argDecl[1]){
                r = GLOBAL_REG.exec(argDecl[1]);
            }

            var globalVals;
            if(r && r[1]){
                argDecl[1] = argDecl[1].replace(r[0], 'global');
                globalVals = r[1];
            }

            // 依赖的模块
            deps = (argDecl[1] && argDecl[1].split(",")) || [];
        }

        var args = [];
        var _this = this;

        var hasNext = false;

        // 取到service的实体
        var getServiceObj = function(serviceName){
            serviceName = serviceName.trim();
            if(serviceName === "scope"){
                return scope;
            }

            if(serviceName === "next"){
                hasNext = true;
                return next;
            }

            if(serviceName === "global"){
                return window;
            }


            var service = _this.serviceMap[serviceName];
            var serviceFunc = service && service.func;

            if(typeof serviceFunc === "undefined"){
                console.error("Model: service " + serviceName + " is not defined");
                throw new error("Model: " + serviceName + " is not defined");

                return function(){};
            }

            if(service.serviceResult){
            }else{
                var serviceResult = _this._runFunc(serviceFunc, scope);
                service.serviceResult = serviceResult;
            }

            return service.serviceResult;
        };

        for(var i = 0; i < deps.length; i ++){
            args.push(getServiceObj(deps[i]));
        }

        // var scope = {};

        if(hasNext){
            return func.apply(scope, args);
        }else{
            var val = func.apply(scope, args);

            next && next(val);

            return val;
        }
    },

    task: function(name, taskModules, func){
        // task转成arr形式

       if(typeof taskModules === "function"){
            func = taskModules;
            taskModules = [];
        }

        // 这里是防压缩形式
        /*
        if(taskModules.length && typeof taskModules[taskModules.length - 1] === "function"){
            func = taskModules;
            taskModules = [];
        }
        */

        var _this = this;


        // 对func为数组的处理，统一处理为函数
        if(func && func.length && func.splice){
            var f = func.splice(func.length - 1, 1)[0];

            var args = func;

            func = f;

            func.deps = args;
        }

        if(func){
            taskModules = taskModules.then([func]);
        }

        this.tasks[name] = taskModules;



        // check taskModules是否为虚的function
        /*
        */
        
        /*
        var arr2Promise = function(arr){
            var thenQueue2Promise = function(arr){
                var p = new Promise(function(rs, rj){
                    rs();
                });;

                for(var i = 0; i < arr.length; i ++){
                    p.then(function(){
                        return arr2Promise(arr[i]);
                    });
                }

                return p;
            };

            var decode2ThenQueue = function(arr){
                // 在一级数组上 分解then链
                var queue = [];
                var tmpArr = [];
                queue.push(tmpArr);

                for(var i = 0; i < arr.length; i ++){
                    if(arr[i] === 'then'){
                        tmpArr = [];
                        queue.push(tmpArr);
                    }else{
                        tmpArr.push(arr[i]);
                    }
                }

                thenQueue2Promise(queue);
            };
        };


        this.tasks[name] = function(scope){
            var moduleArr = taskModules.map(function(item){
                return _this.tasks[item](scope);
            });

            moduleArr.push(new Promise(function(rs, rj){
                var returnVal = _this._runFunc(func, scope, function(){
                    rs();
                });

                for(var i in returnVal){
                    if(returnVal.hasOwnProperty(i)){
                        scope[i] = returnVal[i];
                    }
                }
            }));

            return Promise.all(moduleArr);
        };
        */
    },

    runWorkflow: function(nameOrServiceFlow, initScope){
        var taskModules;
        var initFunc;
        if(typeof nameOrServiceFlow === "string"){
            var name = nameOrServiceFlow;

            taskModules = [nameOrServiceFlow];
            
            initFunc = null;
        }else if(nameOrServiceFlow.hasOwnProperty("length")){

            taskModules = nameOrServiceFlow;
            initFunc = ['scope', function(scope){return scope;}];
        }

        var scope = initScope || {};

        var addScope = function(scope){
            
        };


        var c = 0;

        var _this = this;

        var arr2Promise = function(arr){

            if(c ++ > 100){
                return;
            }

            // 出口点
            if(arr.length === 1 && typeof arr[0] === 'function'){
                var t = new Promise(function(rs, rj){
                    var returnVal = _this._runFunc(arr[0], scope, function(){
                        rs();
                    });

                    for(var i in returnVal){
                        if(returnVal.hasOwnProperty(i)){
                            scope[i] = returnVal[i];
                        }
                    }
                });

                t.then(function(){
                });

                return t;
            }

            var thenQueue2Promise = function(queue){
                var p;
                queue.map(function(item){
                    if(p){
                        p.then(function(){
                             return arr2Promise(item);
                        });
                    }else{
                        p = arr2Promise(item);
                    }
                });

                return p;
            };



            var decode2ThenQueue = function(arr){
                // 在一级数组上 分解then链
                var queue = [];
                var tmpArr = [];
                queue.push(tmpArr);

                for(var i = 0; i < arr.length; i ++){
                    if(arr[i] === 'then'){
                        tmpArr = [];
                        queue.push(tmpArr);
                    }else{
                        tmpArr.push(arr[i]);
                    }
                }

                if(queue.length > 1){
                    return thenQueue2Promise(queue);

                // 检查有没有then，没有就不用执行then
                }else{
                    var promiseAllQueue = queue[0].map(function(item){
                        if(typeof item === 'string'){
                            var taskDefination = _this.tasks[item];

                            if(! taskDefination){
                                console.error('Model:', item, ' not defined');

                                throw new Error('Model:' + item + ' not defined');
                            }

                            return arr2Promise(taskDefination);

                        // 如果某个元素为function, 则为动态计算的task
                        }else if(item.length && item.splice === "function"){
                            return arr2Promise(item);
                        }else if(typeof item === "function"){
                            var returnVal = _this._runFunc(item, scope, function(){
                            });

                            if(returnVal && typeof returnVal === "string"){
                                var taskDefination = _this.tasks[returnVal];

                                return arr2Promise(taskDefination);
                            // 否则就不加到task里去了
                            }else if(returnVal && returnVal.length && returnVal.splice){
                                return arr2Promise(returnVal);
                            }else{
                            }



                            /*
                            var t = new Promise(function(rs, rj){
                                var returnVal = _this._runFunc(item, scope, function(){
                                    rs();
                                });

                                for(var i in returnVal){
                                    if(returnVal.hasOwnProperty(i)){
                                        scope[i] = returnVal[i];
                                    }
                                }
                            });

                            return t;
                            */
                        }else{
                            return item;
                        }
                    });

                    var f = Promise.all(promiseAllQueue);
                    
                    f.then(function(){
                    });

                    return f;
                }
            };

            var decodedPromiseQueue = decode2ThenQueue(arr);

            return decodedPromiseQueue;
        };

        return arr2Promise(taskModules);


        /*
        var _this = this;
        var tasksArr = taskModules.map(function(item){
            return _this.tasks[item](scope);
        });

        if(initFunc){
            tasksArr.push(new Promise(function(rs, rj){
                var returnVal = _this._runFunc(initFunc, scope, function(){
                    rs();
                });

                for(var i in returnVal){
                    if(returnVal.hasOwnProperty(i)){
                        scope[i] = returnVal[i];
                    }
                }
            }));
        }
        *、

        /*
        if(initFunc){
            // 接力scope
            return this._runFunc(initFunc, scope);
        }else{
            return scope;
        }
        */

        // return Promise.all(tasksArr);
    }
});


