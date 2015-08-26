var Model = {
    pool: {
    },
    task: function(name, serviceModules, func){
        if(typeof serviceModules === "function"){
            func = serviceModules;
            serviceModules = [];
        }

        this.pool[name] = {
            serviceModules: serviceModules,
            func: func
        };
    },

    runWorkflow: function(nameOrServiceFlow, initScope){
        if(typeof nameOrServiceFlow === "string"){
            var name = nameOrServiceFlow;

            if(this.pool[name]){
                var funcOpt = this.pool[name];
                var serviceModules = funcOpt.serviceModules;
                var func = funcOpt.func;
                var scope = initScope;

                var addScope = function(scope){
                    
                };

                for(var i = 0; i < serviceModules.length; i ++){
                    var serviceName = serviceModules[i];
                    scope = this.runWorkflow(serviceName, scope);
                }

                if(func){
                    return func(scope);
                }else{
                    return scope;
                }
            }
        }
    }
};
