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

Array.prototype.then1 = function(taskArr){
    if(this.length){
        return this.concat('then').concat(taskArr);
    }else{
        return [taskArr];
    }
};


Model.extend({
    // 给func加一层语法糖
    tasks: {
    },

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
        if(func.hasOwnProperty("length") && func[0]){
            var len = func.length;
            var _func = func.splice(len - 1, 1)
            deps = func;

            func = _func[0];

        }else{
           // 进行预处理
            var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
            var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
            var fnText = func.toString().replace(STRIP_COMMENTS, '');
            var argDecl = fnText.match(FN_ARGS);

            var GLOBAL_REG = /\{([^\}]*)\}/g;

            console.log(argDecl[1]);

            var r;
            r = GLOBAL_REG.exec(argDecl[1]);

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
            var serviceFunc = service.func;

            if(typeof serviceFunc === "undefined"){
                console.error("Model: " + serviceName + " is not defined");

                return function(){};
            }

            if(service.serviceResult){
            }else{
                var serviceResult = _this._runFunc(serviceFunc);
                service.serviceResult = serviceResult;
            }

            return service.serviceResult;
        };

        console.log(deps, 'deps');
        for(var i = 0; i < deps.length; i ++){
            args.push(getServiceObj(deps[i]));
        }

        var scope = {};

        if(hasNext){
            return func.apply(scope, args);
        }else{
            var val = func.apply(scope, args);

            next(val);

            return val;
        }
    },

    task: function(name, taskModules, func){
        // task转成arr形式

       if(typeof taskModules === "function"){
            func = taskModules;
            taskModules = [];
        }

        if(taskModules.length && typeof taskModules[taskModules.length - 1] === "function"){
            func = taskModules;
            taskModules = [];
        }

        var _this = this;

        if(func){
            taskModules = taskModules.then1(func);
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
            console.log(arr, 'arr2Promise');

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
                    console.log('sdfsdf', t);
                });

                return t;
            }

            var thenQueue2Promise = function(queue){
                var p;
                queue.map(function(item){
                    if(p){
                        p.then(function(){
                            console.log('------------------');
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

                            return arr2Promise(taskDefination);
                        }else if(item.length){
                            return arr2Promise(item);
                        }else{
                            return item;
                        }
                    });

                    console.log(promiseAllQueue, 'allQeueu');
                    var f = Promise.all(promiseAllQueue);
                    
                    f.then(function(){
                        console.log('-------------');
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
