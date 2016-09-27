{
    let task = Model.task.bind(Model);
    let service = Model.service.bind(Model);


    let ajax = (opt) => {
        return new Promise((rs, rj) => {
            setTimeout(rs, 1000);
        });
    };
    service('httpService', () => (opt, next) => {
        return ajax(opt).then(data => {
            next(data);
        });
    });


    task('getInfo', (httpService, scope, next) => {
        httpService({}, next);
    });


    task('log', scope => {
        console.log('xxxxxx');
    });

    Model.runWorkflow(['getInfo'].then(['log']));

    
}
