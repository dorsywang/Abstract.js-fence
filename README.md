#Abstract-fence

##Abstract-Fence
Abstract-fence是为了规范Abstract的代码而生的，为了使Abstract整洁而有效的模块化管理，Abstract携一系列全新理念而来

##Abstract-fence理念
###一阶抽象：面向过程
最开始的编程语言为了解决代码复用的问题，提出了面向过程，自顶向下逐级细化的编程理念，这时候诞生了function，于时语言为不同的function与子function堆砌
###二阶抽象: 面向对象
编程语言发展到后期，大量的function堆砌与子过程间的调用已无法使代码变得清晰可读，于是有了后来的面向对象的抽象体系，一切皆对象，比如人，比如动物，人有什么方法，可以有什么行为等等引入到编程抽象中去，使得代码变得易读
###三阶抽象：面向流程
如果再从现实进行抽象，世界发展到后期，并非一切都能做为对象来描述，再进一步抽象，我们每天为了完成一系列任务，而每个任务就是一个流程，流程由人（对象）进行一系列行为组成，这就是现实世界

###代码乱的原因
####编程语言不符合人类阅读习惯
人类的阅读是自上而下的阅读，而程序的阅读要求按照计算机执行的方式去阅读，即，经常是A中的代码读到一半就会调用B中的代码，B中的代码调用一半可能就会调用C中的代码，等等，C执行完了要求再回到B刚才的位置继续往下读，B执行完了又要跳到A中继续下去，这种调来调去的写法经常会使我们无法理清其中的逻辑
####清晰的编程方式
#####从上到下的一直读下去
这个即是说符合人类阅读习惯的方式，即是没有子过程的调用，就像一本书一样，从前一直读到后面，通篇下来，没有function。但这种方式很明显是在编程语言初期的代码，没有function的概念，不利于代码复用
#####理清调用关系
如果能让我们一眼知道每个模块之前的调用关系，将会使我们的代码变得非常具有可读性。这也是require框架要做的事情。但require是基于模块间依赖进行描述的，模块内部并没有很清晰的调用关系，Abstract-fence要做的事情就是规范模块内的调用方式

##Abstract-fence来源
Abstract-fence借鉴优秀的前端工程化构建框架Grunt、Gulp的工作流思想与优秀的MVVM框架AngularJS的Service与依赖注入优化功能

##Abstract-fence优势
#####轻量 
#####清晰 逻辑清晰可读
#####可测试  任务分散 统一入口和出口，很好做自动化测试

##Abstract-fence构成
### 无独立Function
Function是为了解决代码复用而产生的，Function代表过程，但在Abstract-fence中Function可以规范为两种，一种是任务，一种是服务

###任务（task)
任务代表为达到一个目的而进行的过程，为了清晰任务间的调用方式，任务可以依赖其他任务的完成。任务内部要求无独立Function跳转出现（除了全局方法）。

#####任务使用task进行声明
```javascript
// 声明initParams任务
Model.task("initParams", function(scope){
});
```
#####任务写明依赖的其他任务关系
通过第二个参数（Array）可以声明任务间的依赖, array元素会依次进行
```javascript
// 声明initParams任务
Model.task("initParams", function(scope){
});

// defineModels任务依赖initParams完成后进行
Model.task("defineModels", ['initParams'], function(scope){
});
```
#####任务通过依赖注入使用服务
```javascript
// 声明initParams任务
// initParmas使用getURLParams和getWork服务
Model.task("initParams", function(scope, getURLParams, getWork){
});
```

#####任务写明依赖的服务关系
#####任务内部不能出现 未写明依赖关系的 function出现跳转（除了全局方法外）
```javascript
// 声明initParams任务
// initParmas使用getURLParams和getWork服务
Model.task("initParams", function(scope, getURLParams, getWork){
       testParams('p');// 不允许的，testParams未通过注入使用，不能使用, 产生未声明的依赖，导致逻辑会不清晰
});
```

#####每个任务中都有scope服务，scope从workflow开始进行传递给任务和调用的服务
```javascript
// 声明initParams任务
Model.task("initParams", function(scope){
});

// defineModels任务依赖initParams完成后进行
Model.task("defineModels", ['initParams'], function(scope){
      // scope和initParams享有相同的对象，scope在任务间传递
});
```

#####task异步流程
异步是js中处理问题的关键，Abstract-fence引入了异步机制

使用异步能力，只需要引入next服务即可

```javascript
Model.task('sleep', function(scope, next){
    var sleepTime = scope.sleepTime;
    
    setTimeout(function(){
        next();
    }, sleepTime)
});

Model.task('say', function(scope){
    var words = scope.words;
    
    alert(words);
})

Model.task('sleep3say', ['sleep'].then('say'));

Model.runWorkflow('sleep3say', {
    words: 'wake',
    sleepTime: 3000
});
```

#####流程控制
很多时候，有一些流程，我们需要根据不同的流数据进行不同的流处理

比如，下雨天，就带伞，烈日天，就戴帽子

```javascript
Model.task('checkWeather', function(scope){
    return {
        weather: 'rainny'
    };
});

Model.task('takeUm', function(){
    return {
         taking: 'um'
    };
});

Model.task('takeHat', function(){
    return {
         taking: 'hat'
    };
});

Model.task('go', function(scope){
    alert(scope.taking);
})

Model.task('goOut', ['checkWheather', function(scope){
    var weather = scope.weather;
    
    if(weather === 'rainny'){
         return 'takeUm';
    }else if(weather === 'sunny'){
        return 'takeHat';
    }
}].then('go'));

Model.runWorkflow('goOut');
```

#####统一的入口和出口
任务中通过scope获取参数，任务return一个对象出去，将会挂到scope上去，为后面的任务调用
```javascript
// 声明initParams任务
Model.task("initParams", function(scope){
        return {
            msg: 'initOK'
        }
});

// defineModels任务依赖initParams完成后进行
Model.task("defineModels", ['initParams'], function(scope){
      var msg = scope.msg;

      // 打印出 initOK
      console.log(msg);
});
```


###服务(service)
服务是提供可代码复用的一种处理数据的手段

#####服务通过"依赖注入" 注入到 任务内
#####服务间可以通过过依赖注入使用其他服务
#####服务不可以使用任务

```javascript
// editor为service
// editor依赖toNumber服务
Model.service("editor", function(toNumber){
        return {
            status: '1',
            getEditorStatus: function(){
                toNumber(this.status);
            }
        };
});

// 声明service function中参数可定义依赖
Model.service("toNumber", function(){
    return function(str){
        return parseInt(str);
    };
});

// defineModels任务依赖initParams完成后进行
Model.task("initParams", function(scope, toNumber, editor){
        var str = '12a';

        var num = toNumber(str);

        var editorStauts = editor.getEditorStatus();

        return {
            num: num
        };
});
```

###执行服务(runWorkflow)
使用runWorkflow方法执行任务流

##简单的示例
如下是重构后的index.my.js的主要逻辑
```javascript
(function() {
    require('../../css/index_my.min.css');

    var isFirstTab = false;

    // service配置区
    Model.service("getGradeT", function(){
        return function(level) {
            // more code here
        }
    });

    Model.service("getFlagArr", function(){
        return function(flag) {
            // more code here
        }
    });

    Model.service("clearActiveLi", function(){
        return function(){

            // more code here

        }
    });

    Model.service("editorManager", function(){
        return {
            beginEdit: function() {
            },

            finishEdit: function(){
            },

            getEditing: function(){
            },

            checKEmpty: checKEmpty
        };
    });


    Model.service("tribeTapHandler", function(){
        return function(e) {
            // more code here
        }
    });

    Model.task("getInitParam", function(scope){

        // more code here
    });


    Model.task('defineModels', function(scope, getGradeT, getFlagArr, clearActiveLi, tribeTapHandler, editorManager) {
        // more code here

    });

    Model.task("$re",  function(scope){
        // more code here

    });

    Model.task('exportTab', function(scope) {
        // more code here

    });

    Model.task('bindMsgEvent', function(){
        // more code here

    });

    Model.task('init', ['getInitParam', 'defineModels', 'exportTab', 'bindMsgEvent']);

    Model.runWorkflow('init');

})();
```

##构建
为了防止代码压缩依赖注入失效的问题，Abstract-fence会先进行grunt编译处理（新版构建开发中）


/*
Abstract-fence使用Grunt进行构建编译，会对依赖注入进行一些参数处理

如
```javascript
Model.task("initParams", function(scope, toNumber){
});
```
会构建成
```
Model.task("initParams", ['scope', 'toNumber', function(scope, toNumber){
}]);
```
*/


##自动化测试
由于task任务是分散的，且入口与出口统一，可方便进行自动化测试

Jasmine的一种未经验证的测试方法如下

```javascript
Model.task("initParams", function(scope, toNumber){
        var msg = scope.msg;

        msg = toNumber(msg);

        return {
            intMsg: msg
        };
});
```

测试代码

```javascript
describe('Abstract-fence单元测试',function(){
    it('测试initParams任务',function(){ 
         expect(Model.runWorkflow("initParams", {msg: '1a'}).toEqual({msg: 1}); 
         expect(Model.runWorkflow("initParams", {msg: '2'}).toEqual({msg: 2}); 
    });
});
```

##ES6的入口写法
入口为获得参数，在es6中，入口可以轻易的写成更易懂的方式
```javascript
Model.task("initParams", function(scope, toNumber){
        // es6 取到入口参数
        var {msg, bid, pid} = scope;

        return {
            intMsg: msg
        };
});
```
##Further More
后续Abstract-fence将会支持按Promise模式写法的依赖方式，很好的支持异步的Task

