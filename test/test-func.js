/*
var service1 = service(() => {
});
*/
var t2 = task(({scope$}) => {
});

var t1 = task([t2], ({scope$}) => {
});

t1.run();
