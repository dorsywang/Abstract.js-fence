{
    Array.prototype.then = function(taskArr){
        if(typeof taskArr === "function"){
            taskArr();

            return;
        }

        var val = this.concat('then').concat(taskArr);
        if(! this.length){
            val = val.slice(1);
        }

        return val;
    };

    let ServiceManager = {
    };


    class Flow{
        constructor(flow){
            this.flow = flow;
        }

        _runFunc(func, scope$, next$){
            // 这里要判断有没有next是个难点
            console.log(func, scope$, next$);

            func.apply(scope, ServiceManager.getService());
        }

        run(initScope){

            var _this = this;
            var taskModules = this.flow || [];
            var scope$ = initScope || {};

            var arr2Promise = function(arr){

                // 出口点
                if(arr.length === 1 && typeof arr[0] === 'function'){
                    var t = new Promise(function(rs, rj){
                        var returnVal = _this._runFunc(arr[0], scope$, function(){
                            rs();
                        });

                        for(var i in returnVal){
                            if(returnVal.hasOwnProperty(i)){
                                scope$[i] = returnVal[i];
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
                                var returnVal = _this._runFunc(item, scope$, function(){
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

        }
    }

    let task = (...args) => {
        let deps = args[0];
        let defineFunc = args[1];

        if(typeof deps === 'function'){
            defineFunc = deps;
            deps = [];
        }

        let flow = deps.then([defineFunc]);


        return new Flow(flow);
    };

    window.task = task;
}
