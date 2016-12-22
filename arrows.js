var window = {
	performance: {
		now: function () {}
	}
}
var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var numarrows = 0;
var numannotations = 0;
var annotationParseTime = 0;

var typechecks = 0;
var typecheckTime = 0;

var started;
var typecheck = true;
var benchmark = false;
var displaychecks = false;

function _benchmarkStart(shouldTypecheck) {
    benchmark = true;
    typecheck = shouldTypecheck;

    started = window.performance.now();
}

function _benchmarkResultsOrRun() /* ...arrows */{
    if (benchmark) {
        var elapsed = window.performance.now() - started;

        console.log('Arrows: ' + numarrows);
        console.log('Num annotations: ' + numannotations);
        console.log('Composition time: ' + elapsed + ' (' + annotationParseTime + ')');
    } else {
        for (var i = 0; i < arguments.length; i++) {
            arguments[i].run();
        }
    }
}

function _construct(f) {
    if (typecheck) {
        return f();
    } else {
        return new ArrowType(new TopType(), new TopType());
    }
}

function _check(type, value) {
    if (typecheck) {
        var start = window.performance.now();

        type.check(value);

        var elapsed = window.performance.now() - start;
        typechecks++;
        typecheckTime += elapsed;

        if (displaychecks) {
            console.log(typechecks + ' checks, ' + typecheckTime + 'ms');
        }
    }
}

Array.create = function (length, value) {
    var arr = [];
    while (--length >= 0) {
        arr.push(value);
    }

    return arr;
};

Array.copy = function (array) {
    return [].slice.call(array);
};

Array.prototype.unique = function () {
    return this.filter(function (v, i, s) {
        return s.indexOf(v) === i;
    });
};

Function.prototype.lift = function () {
    return new LiftedArrow(this);
};

Number.prototype.lift = function () {
    var value = this.valueOf();

    return new LiftedArrow(function () {
        /* @arrow :: _ ~> Number */
        return value;
    });
};

Boolean.prototype.lift = function () {
    var value = this.valueOf();

    return new LiftedArrow(function () {
        /* @arrow : _ ~> Bool */
        return value;
    });
};

var Arrow = function () {
    function Arrow(type) {
        _classCallCheck(this, Arrow);

        numarrows++;
        this.type = type;
    }

    _createClass(Arrow, [{
        key: 'call',
        value: function call(x, p, k, h) {
            throw new Error('Call undefined');
        }
    }, {
        key: 'equals',
        value: function equals(that) {
            throw new Error('Equals undefined');
        }
    }, {
        key: 'toString',
        value: function toString() {
            return this.constructor.name + ' :: ' + this.type.toString();
        }
    }, {
        key: 'isAsync',
        value: function isAsync() {
            return false;
        }
    }, {
        key: 'run',
        value: function run() {
            var p = new Progress(true);
            this.call(null, p, function () {}, function (err) {
                throw err;
            });
            return p;
        }

        // Combinator constructors

    }, {
        key: 'noemit',
        value: function noemit() {
            return Arrow.noemit(this);
        }
    }, {
        key: 'seq',
        value: function seq() /* ...arrows */{
            return Arrow.seq([this].concat(Array.copy(arguments)));
        }
    }, {
        key: 'any',
        value: function any() /* ...arrows */{
            return Arrow.any([this].concat(Array.copy(arguments)));
        }
    }, {
        key: 'all',
        value: function all() /* ...arrows */{
            return Arrow.all([this].concat(Array.copy(arguments)));
        }
    }, {
        key: 'try',
        value: function _try(success, failure) {
            return Arrow.try(this, success, failure);
        }

        // Convenience API

    }, {
        key: 'lift',
        value: function lift() {
            return this;
        }
    }, {
        key: 'wait',
        value: function wait(duration) {
            return this.seq(new DelayArrow(duration));
        }
    }, {
        key: 'after',
        value: function after(duration) {
            return new DelayArrow(duration).seq(this);
        }
    }, {
        key: 'triggeredBy',
        value: function triggeredBy(selector, event) {
            return new ElemArrow(selector).seq(new EventArrow(event)).remember().seq(this);
        }
    }, {
        key: 'then',
        value: function then(success, failure) {
            if (failure === undefined) {
                return this.seq(success);
            } else {
                return this.try(success, failure);
            }
        }
    }, {
        key: 'catch',
        value: function _catch(failure) {
            return this.then(Arrow.id(), failure);
        }

        // Data Routing

    }, {
        key: 'split',
        value: function split(n) {
            return this.seq(new SplitArrow(n));
        }
    }, {
        key: 'nth',
        value: function nth(n) {
            return this.seq(new NthArrow(n));
        }
    }, {
        key: 'fanout',
        value: function fanout() /* ...arrows */{
            return Arrow.fanout([this].concat(Array.copy(arguments)));
        }
    }, {
        key: 'tap',
        value: function tap() /* ...functions */{
            var a = this;
            for (var i = 0; i < arguments.length; i++) {
                a = a.seq(arguments[i].lift().remember());
            }

            return a;
        }
    }, {
        key: 'on',
        value: function on(name, handler) {
            return this.seq(new SplitArrow(2), Arrow.id().all(new EventArrow(name)), handler);
        }
    }, {
        key: 'remember',
        value: function remember() {
            return this.carry().nth(1);
        }
    }, {
        key: 'carry',
        value: function carry() {
            return new SplitArrow(2).seq(Arrow.id().all(this));
        }

        // Repeating

    }, {
        key: 'repeat',
        value: function repeat() {
            var _this = this;

            return Arrow.fix(function (a) {
                return _this.wait(0).seq(Arrow.try(Arrow.repeatTail(), a, Arrow.id()));
            });
        }
    }, {
        key: 'times',
        value: function times(n) {
            var rep = new LiftedArrow(function (x, y) {
                /* @arrow :: ('a, 'b) ~> <loop: 'a, halt: 'b> */
                return --n > 0 ? Arrow.loop(x) : Arrow.halt(y);
            });

            return this.carry().seq(rep).repeat();
        }
    }, {
        key: 'forever',
        value: function forever() {
            return this.seq(Arrow.reptop()).repeat();
        }
    }, {
        key: 'whileTrue',
        value: function whileTrue() {
            return this.carry().seq(Arrow.repcond()).repeat();
        }
    }]);

    return Arrow;
}();

// Unary combinators


Arrow.noemit = function (arrow) {
    return new NoEmitCombinator(arrow);
};

// N-ary combinators
Arrow.seq = function (arrows) {
    return new SeqCombinator(arrows);
};
Arrow.any = function (arrows) {
    return new AnyCombinator(arrows);
};
Arrow.all = function (arrows) {
    return new AllCombinator(arrows);
};
Arrow.try = function (a, s, f) {
    return new TryCombinator(a, s, f);
};
Arrow.fanout = function (arrows) {
    return new SplitArrow(arrows.length).seq(Arrow.all(arrows));
};

// Convenience
Arrow.repeat = function (a) {
    return a.repeat();
};
Arrow.bind = function (event, a) {
    return Arrow.seq([new SplitArrow(2), Arrow.id().all(new EventArrow(event)), a]);
};
Arrow.catch = function (a, f) {
    return Arrow.try(a, Arrow.id(), f);
};

// Built-ins
Arrow.id = function () {
    return new LiftedArrow(function (x) {
        return (/* @arrow :: 'a ~> 'a */x
        );
    });
};
Arrow.reptop = function () {
    return new LiftedArrow(function (x) {
        return (/* @arrow :: _ ~> <loop: _, halt: _> */Arrow.loop(null)
        );
    });
};
Arrow.repcond = function () {
    return new LiftedArrow(function (x, f) {
        return (/* @arrow :: ('a, Bool) ~> <loop: 'a, halt: _> */f ? Arrow.loop(x) : Arrow.halt(null)
        );
    });
};
Arrow.repcondInv = function () {
    return new LiftedArrow(function (x, f) {
        return (/* @arrow :: ('a, Bool) ~> <loop: 'a, halt: _> */!f ? Arrow.loop(x) : Arrow.halt(null)
        );
    });
};
Arrow.throwFalse = function () {
    return new LiftedArrow(function (x) {
        /* @arrow :: Bool ~> _ \ ({}, {Bool}) */
        if (x) {
            throw x;
        }
    });
};

Arrow.repeatTail = function () {
    return new LiftedArrow(function (x) {
        /* @arrow :: <loop: 'a, halt: 'b> ~> 'a \ ({}, {'b}) */
        if (x.hasTag('loop')) {
            return x.value();
        } else {
            throw x.value();
        }
    });
};

var TaggedValue = function () {
    function TaggedValue(tag, val) {
        _classCallCheck(this, TaggedValue);

        this.tag = tag;
        this.val = val;
    }

    _createClass(TaggedValue, [{
        key: 'hasTag',
        value: function hasTag(tag) {
            return tag == this.tag;
        }
    }, {
        key: 'value',
        value: function value() {
            return this.val;
        }
    }]);

    return TaggedValue;
}();

// Utility Constructors


Arrow.loop = function (x) {
    return new TaggedValue('loop', x);
};
Arrow.halt = function (x) {
    return new TaggedValue('halt', x);
};

var _cancelerId = 0;

var Progress = function () {
    function Progress(canEmit) {
        _classCallCheck(this, Progress);

        this.canEmit = canEmit;
        this.cancelers = {};
        this.observers = [];
    }

    _createClass(Progress, [{
        key: 'addObserver',
        value: function addObserver(observer) {
            this.observers.push(observer);
        }
    }, {
        key: 'addCanceler',
        value: function addCanceler(canceler) {
            var id = _cancelerId++;
            this.cancelers[id] = canceler;
            return id;
        }
    }, {
        key: 'advance',
        value: function advance(cancelerId) {
            if (cancelerId != null) {
                this.cancelers[cancelerId] = null;
            }

            while (this.observers.length > 0) {
                var observer = this.observers.pop();

                if (this.canEmit) {
                    observer();
                }
            }
        }
    }, {
        key: 'cancel',
        value: function cancel() {
            for (var id in this.cancelers) {
                if (this.cancelers[id] != null) {
                    this.cancelers[id]();
                }
            }

            this.cancelers = {};
        }
    }]);

    return Progress;
}();

var annotationCache = {};

// Convenience
Arrow.db = function (f, db) {
    return new DBArrow(f, db);
};

var LiftedArrow = function (_Arrow) {
    _inherits(LiftedArrow, _Arrow);

    function LiftedArrow(f) {
        _classCallCheck(this, LiftedArrow);

        if (!(f instanceof Function)) {
            throw new Error('Cannot lift non-function');
        }

        var _this2 = _possibleConstructorReturn(this, (LiftedArrow.__proto__ || Object.getPrototypeOf(LiftedArrow)).call(this, _construct(function () {
            var start = window.performance.now();

            var s = f.toString();
            var i = s.indexOf('/*');
            var j = s.indexOf('*/', i + 1);
            var c = s.substring(i + 2, j);

            if (annotationCache[c] !== undefined) {
                var parsed = annotationCache[c];
            } else {
                var comment;
                try {
                    comment = c.match(/\@arrow :: (.*)\n?/)[1];
                } catch (err) {
                    if (typecheck) {
                        console.warn('Function being lifted does not contain an @arrow annotation');
                    }

                    comment = '_ ~> _';
                }

                try {
                    parsed = parser.parse(comment);
                } catch (err) {
                    throw new ComposeError('Function being lifted does not contain a parseable @arrow annotation.\n' + err.message + '\n');
                }

                annotationCache[c] = parsed;
            }

            var elapsed = window.performance.now() - start;
            numannotations++;
            annotationParseTime += elapsed;

            var arg = parsed[0];
            var out = parsed[1];
            var ncs = new ConstraintSet([]).addAll(parsed[2][0]);

            return new ArrowType(arg, out, ncs, parsed[2][1]).sanitize();
        })));

        _this2.f = f;
        return _this2;
    }

    _createClass(LiftedArrow, [{
        key: 'call',
        value: function call(x, p, k, h) {
            try {
                // If the function has more than one parameter and we have
                // an array argument, spread the elements. Else, just call
                // the function with a single argument.

                if (x && x.constructor === Array && this.f.length > 1) {
                    var result = this.f.apply(null, x);
                } else {
                    var result = this.f(x);
                }

                _check(this.type.out, result);
            } catch (err) {
                return h(err);
            }

            k(result);
        }
    }, {
        key: 'equals',
        value: function equals(that) {
            return that instanceof LiftedArrow && this.f === that.f;
        }
    }]);

    return LiftedArrow;
}(Arrow);

var ElemArrow = function (_LiftedArrow) {
    _inherits(ElemArrow, _LiftedArrow);

    function ElemArrow(selector) {
        _classCallCheck(this, ElemArrow);

        var _this3 = _possibleConstructorReturn(this, (ElemArrow.__proto__ || Object.getPrototypeOf(ElemArrow)).call(this, function () {
            /* @arrow :: _ ~> Elem */
            return $(selector);
        }));

        _this3.selector = selector;
        return _this3;
    }

    _createClass(ElemArrow, [{
        key: 'equals',
        value: function equals(that) {
            return that instanceof ElemArrow && this.selector === that.selector;
        }
    }]);

    return ElemArrow;
}(LiftedArrow);

//
// Simple Asynchronous Arrow Implementation
//

var SimpleAsyncArrow = function (_Arrow2) {
    _inherits(SimpleAsyncArrow, _Arrow2);

    function SimpleAsyncArrow() {
        _classCallCheck(this, SimpleAsyncArrow);

        return _possibleConstructorReturn(this, (SimpleAsyncArrow.__proto__ || Object.getPrototypeOf(SimpleAsyncArrow)).apply(this, arguments));
    }

    _createClass(SimpleAsyncArrow, [{
        key: 'isAsync',
        value: function isAsync() {
            return true;
        }
    }]);

    return SimpleAsyncArrow;
}(Arrow);

// Simple Asynchronous Arrow that takes in a config object

var SimpleConfigBasedAsyncArrow = function (_SimpleAsyncArrow) {
    _inherits(SimpleConfigBasedAsyncArrow, _SimpleAsyncArrow);

    function SimpleConfigBasedAsyncArrow(f, errorType) {
        _classCallCheck(this, SimpleConfigBasedAsyncArrow);

        var _this5 = _possibleConstructorReturn(this, (SimpleConfigBasedAsyncArrow.__proto__ || Object.getPrototypeOf(SimpleConfigBasedAsyncArrow)).call(this, _construct(function () {
            var start = window.performance.now();

            var s = f.toString();
            var i = s.indexOf('/*');
            var j = s.indexOf('*/', i + 1);
            var c = s.substring(i + 2, j);

            var ncs = new ConstraintSet([]);
            var err = [new NamedType(errorType)];

            if (annotationCache[c] !== undefined) {
                var conf = annotationCache[c][0];
                var resp = annotationCache[c][1];
            } else {
                try {
                    var conf = parser.parse(c.match(/\@conf :: (.*)\n?/)[1]);

                    ncs = ncs.addAll(conf[1][0]);
                    err = err.concat(conf[1][1]);
                } catch (err) {
                    throw new ComposeError('Config does not contain a parseable @conf annotation.\n' + err.message + '\n');
                }

                try {
                    var resp = parser.parse(c.match(/\@resp :: (.*)\n?/)[1]);

                    ncs = ncs.addAll(resp[1][0]);
                    err = err.concat(resp[1][1]);
                } catch (err) {
                    throw new ComposeError('Config does not contain a parseable @resp annotation.\n' + err.message + '\n');
                }

                annotationCache[c] = [conf, resp];
            }

            var elapsed = window.performance.now() - start;
            numannotations++;
            annotationParseTime += elapsed;

            return new ArrowType(conf[0], resp[0], ncs, err).sanitize();
        })));

        _this5.c = f;
        return _this5;
    }

    return SimpleConfigBasedAsyncArrow;
}(SimpleAsyncArrow);

var AjaxArrow = function (_SimpleConfigBasedAsy) {
    _inherits(AjaxArrow, _SimpleConfigBasedAsy);

    function AjaxArrow(f, db) {
        _classCallCheck(this, AjaxArrow);

        return _possibleConstructorReturn(this, (AjaxArrow.__proto__ || Object.getPrototypeOf(AjaxArrow)).call(this, f, 'AjaxError'));
    }

    _createClass(AjaxArrow, [{
        key: 'call',
        value: function call(x, p, k, h) {
            var _this7 = this;

            // If the function has more than one parameter and we have
            // an array argument, spread the elements. Else, just call
            // the function with a single argument.

            // TODO - wrap this in try

            if (x && x.constructor === Array && this.c.length > 1) {
                var conf = this.c.apply(null, x);
            } else {
                var conf = this.c(x);
            }

            var abort = false;

            var cancel = function cancel() {
                abort = true;
            };

            var fail = h;
            var succ = function succ(x) {
                _check(_this7.type.out, x);
                k(x);
            };

            $.ajax($.extend(conf, {
                success: function success(x, status, xhr) {
                    if (!abort) {
                        p.advance(cancelerId);succ(x);
                    }
                },
                error: function error(xhr, status, x) {
                    if (!abort) {
                        p.advance(cancelerId);fail(x);
                    }
                }
            }));

            var cancelerId = p.addCanceler(cancel);
        }
    }, {
        key: 'equals',
        value: function equals(that) {
            // TODO - deep comparison of objects
            return that instanceof AjaxArrow && this.config === that.config;
        }
    }]);

    return AjaxArrow;
}(SimpleConfigBasedAsyncArrow);

var DBArrow = function (_SimpleConfigBasedAsy2) {
    _inherits(DBArrow, _SimpleConfigBasedAsy2);

    function DBArrow(f, db) {
        _classCallCheck(this, DBArrow);

        var _this8 = _possibleConstructorReturn(this, (DBArrow.__proto__ || Object.getPrototypeOf(DBArrow)).call(this, f, 'QueryError'));

        _this8.db = db;
        return _this8;
    }

    _createClass(DBArrow, [{
        key: 'call',
        value: function call(x, p, k, h) {
            var _this9 = this;

            if (x && x.constructor === Array && this.c.length > 1) {
                var conf = this.c.apply(null, x);
            } else {
                var conf = this.c(x);
            }

            var abort = false;

            var cancel = function cancel() {
                abort = true;
            };

            var fail = h;
            var succ = function succ(x) {
                _check(_this9.type.out, x);
                k(x);
            };
            this.db.query(conf.query, conf.param, function (err, rows) {
                if (err) {
                    if (!abort) {
                        p.advance(cancelerId);
                        fail(err);
                    }
                } else {
                    if (!abort) {
                        p.advance(cancelerId);
                        succ(rows);
                    }
                }
            });
            var cancelerId = p.addCanceler(cancel);
        }
    }, {
        key: 'equals',
        value: function equals(that) {
            return that instanceof DBArrow && this.config === that.config;
        }
    }]);

    return DBArrow;
}(SimpleConfigBasedAsyncArrow);

var EventArrow = function (_SimpleAsyncArrow2) {
    _inherits(EventArrow, _SimpleAsyncArrow2);

    function EventArrow(name) {
        _classCallCheck(this, EventArrow);

        var _this10 = _possibleConstructorReturn(this, (EventArrow.__proto__ || Object.getPrototypeOf(EventArrow)).call(this, _construct(function () {
            return new ArrowType(new NamedType('Elem'), new NamedType('Event'));
        })));
        // Elem ~> Event


        _this10.name = name;
        return _this10;
    }

    _createClass(EventArrow, [{
        key: 'call',
        value: function call(x, p, k, h) {
            var _this11 = this;

            var abort = false;

            var cancel = function cancel() {
                abort = true;
                x.off(_this11.name, runner);
            };

            var runner = function runner(ev) {
                if (!abort) {
                    cancel();
                    p.advance(cancelerId);
                    k(ev);
                }
            };

            x.on(this.name, runner);
            var cancelerId = p.addCanceler(cancel);
        }
    }, {
        key: 'equals',
        value: function equals(that) {
            return that instanceof EventArrow && this.name === that.name;
        }
    }]);

    return EventArrow;
}(SimpleAsyncArrow);

var DynamicDelayArrow = function (_SimpleAsyncArrow3) {
    _inherits(DynamicDelayArrow, _SimpleAsyncArrow3);

    function DynamicDelayArrow() {
        _classCallCheck(this, DynamicDelayArrow);

        // Number ~> _
        return _possibleConstructorReturn(this, (DynamicDelayArrow.__proto__ || Object.getPrototypeOf(DynamicDelayArrow)).call(this, _construct(function () {
            return new ArrowType(new NamedType('Number'), new TopType());
        })));
    }

    _createClass(DynamicDelayArrow, [{
        key: 'call',
        value: function call(x, p, k, h) {
            var cancel = function cancel() {
                return clearTimeout(timer);
            };
            var runner = function runner() {
                p.advance(cancelerId);
                k();
            };

            var timer = setTimeout(runner, x);
            var cancelerId = p.addCanceler(cancel);
        }
    }, {
        key: 'equals',
        value: function equals(that) {
            return that instanceof DynamicDelayArrow;
        }
    }]);

    return DynamicDelayArrow;
}(SimpleAsyncArrow);

var DelayArrow = function (_SimpleAsyncArrow4) {
    _inherits(DelayArrow, _SimpleAsyncArrow4);

    function DelayArrow(duration) {
        _classCallCheck(this, DelayArrow);

        var _this13 = _possibleConstructorReturn(this, (DelayArrow.__proto__ || Object.getPrototypeOf(DelayArrow)).call(this, _construct(function () {
            var alpha = ParamType.fresh();
            return new ArrowType(alpha, alpha);
        })));
        // 'a ~> 'a


        _this13.duration = duration;
        return _this13;
    }

    _createClass(DelayArrow, [{
        key: 'call',
        value: function call(x, p, k, h) {
            var cancel = function cancel() {
                return clearTimeout(timer);
            };
            var runner = function runner() {
                p.advance(cancelerId);
                k(x);
            };

            var timer = setTimeout(runner, this.duration);
            var cancelerId = p.addCanceler(cancel);
        }
    }, {
        key: 'equals',
        value: function equals(that) {
            return that instanceof Delay && this.duration === that.duration;
        }
    }]);

    return DelayArrow;
}(SimpleAsyncArrow);

//
// Simple (Generalized) Arrows
//

var SplitArrow = function (_Arrow3) {
    _inherits(SplitArrow, _Arrow3);

    function SplitArrow(n) {
        _classCallCheck(this, SplitArrow);

        var _this14 = _possibleConstructorReturn(this, (SplitArrow.__proto__ || Object.getPrototypeOf(SplitArrow)).call(this, _construct(function () {
            var arg = ParamType.fresh();
            var out = Array.create(n, arg);

            return new ArrowType(arg, new TupleType(out));
        })));

        _this14.n = n;
        return _this14;
    }

    _createClass(SplitArrow, [{
        key: 'call',
        value: function call(x, p, k, h) {
            // TODO - clone values
            k(Array.create(this.n, x));
        }
    }, {
        key: 'equals',
        value: function equals(that) {
            return that instanceof SplitArrow && this.n === that.n;
        }
    }]);

    return SplitArrow;
}(Arrow);

var NthArrow = function (_Arrow4) {
    _inherits(NthArrow, _Arrow4);

    function NthArrow(n) {
        _classCallCheck(this, NthArrow);

        var _this15 = _possibleConstructorReturn(this, (NthArrow.__proto__ || Object.getPrototypeOf(NthArrow)).call(this, _construct(function () {
            var arg = Array.create(n).map(function () {
                return ParamType.fresh();
            });
            var out = arg[n - 1];

            return new ArrowType(new TupleType(arg), out);
        })));

        _this15.n = n;
        return _this15;
    }

    _createClass(NthArrow, [{
        key: 'call',
        value: function call(x, p, k, h) {
            k(x[this.n - 1]);
        }
    }, {
        key: 'equals',
        value: function equals(that) {
            return that instanceof NthArrow && this.n === that.n;
        }
    }]);

    return NthArrow;
}(Arrow);

var ComposeError = function (_Error) {
    _inherits(ComposeError, _Error);

    function ComposeError(message) {
        _classCallCheck(this, ComposeError);

        var _this16 = _possibleConstructorReturn(this, (ComposeError.__proto__ || Object.getPrototypeOf(ComposeError)).call(this));

        _this16.message = message;
        return _this16;
    }

    _createClass(ComposeError, [{
        key: 'toString',
        value: function toString() {
            return this.message;
        }
    }]);

    return ComposeError;
}(Error);

var Combinator = function (_Arrow5) {
    _inherits(Combinator, _Arrow5);

    function Combinator(type, arrows) {
        _classCallCheck(this, Combinator);

        var _this17 = _possibleConstructorReturn(this, (Combinator.__proto__ || Object.getPrototypeOf(Combinator)).call(this, type));

        _this17.arrows = arrows;
        return _this17;
    }

    _createClass(Combinator, [{
        key: 'isAsync',
        value: function isAsync() {
            return this.arrows.some(function (a) {
                return a.isAsync();
            });
        }
    }, {
        key: 'equals',
        value: function equals(that) {
            if (this.constructor === that.constructor) {
                return this.arrows.length === that.arrows.length && this.arrows.every(function (a, i) {
                    return a.equals(that.arrows[i]);
                });
            }

            return false;
        }
    }]);

    return Combinator;
}(Arrow);

var NoEmitCombinator = function (_Combinator) {
    _inherits(NoEmitCombinator, _Combinator);

    function NoEmitCombinator(f) {
        _classCallCheck(this, NoEmitCombinator);

        return _possibleConstructorReturn(this, (NoEmitCombinator.__proto__ || Object.getPrototypeOf(NoEmitCombinator)).call(this, _construct(function () {
            return f.type;
        }), [f]));
    }

    _createClass(NoEmitCombinator, [{
        key: 'call',
        value: function call(x, p, k, h) {
            var quiet = new Progress(false);
            p.addCanceler(function () {
                return quiet.cancel();
            });

            this.arrows[0].call(x, quiet, function (z) {
                p.advance();

                setTimeout(function () {
                    k(z);
                }, 0);
            }, h);
        }
    }, {
        key: 'isAsync',
        value: function isAsync() {
            return true;
        }
    }]);

    return NoEmitCombinator;
}(Combinator);

var SeqCombinator = function (_Combinator2) {
    _inherits(SeqCombinator, _Combinator2);

    function SeqCombinator(arrows) {
        _classCallCheck(this, SeqCombinator);

        return _possibleConstructorReturn(this, (SeqCombinator.__proto__ || Object.getPrototypeOf(SeqCombinator)).call(this, _construct(function () {
            var sty = sanitizeTypes(arrows);

            try {
                var len = sty.length - 1;

                var arg = sty[0].arg;
                var out = sty[len].out;
                var ncs = new ConstraintSet([]);
                var err = sty[0].errors;

                sty.forEach(function (t, i) {
                    ncs = ncs.concat(t.constraints);
                    err = err.concat(t.errors);

                    if (i != 0) {
                        ncs = ncs.add(new Constraint(sty[i - 1].out, t.arg));
                    }
                });

                return new ArrowType(arg, out, ncs, err);
            } catch (err) {
                var message;
                var location = getLocation(err.stack);

                if (location) {
                    message = 'Unable to seq arrows at: ' + location;
                } else {
                    message = 'Unable to seq arrows';
                }

                throw new ComposeError(message + '\n\tInput => Seq(' + sty.join(', ') + ')\n\tError => ' + err);
            }
        }), arrows));
    }

    _createClass(SeqCombinator, [{
        key: 'call',
        value: function call(x, p, k, h) {
            var rec = function rec(y, _ref) {
                var _ref2 = _toArray(_ref),
                    head = _ref2[0],
                    tail = _ref2.slice(1);

                if (head === undefined) {
                    k(y);
                } else {
                    head.call(y, p, function (z) {
                        return rec(z, tail);
                    }, h);
                }
            };

            rec(x, this.arrows);
        }
    }]);

    return SeqCombinator;
}(Combinator);

var AllCombinator = function (_Combinator3) {
    _inherits(AllCombinator, _Combinator3);

    function AllCombinator(arrows) {
        _classCallCheck(this, AllCombinator);

        return _possibleConstructorReturn(this, (AllCombinator.__proto__ || Object.getPrototypeOf(AllCombinator)).call(this, _construct(function () {
            var sty = sanitizeTypes(arrows);

            try {
                var arg = [];
                var out = [];
                var ncs = new ConstraintSet([]);
                var err = [];

                sty.forEach(function (t, i) {
                    arg.push(t.arg);
                    out.push(t.out);

                    ncs = ncs.concat(t.constraints);
                    err = err.concat(t.errors);
                });

                return new ArrowType(new TupleType(arg), new TupleType(out), ncs, err);
            } catch (err) {
                var message;
                var location = getLocation(err.stack);

                if (location) {
                    message = 'Unable to all arrows at: ' + location;
                } else {
                    message = 'Unable to all arrows';
                }

                throw new ComposeError(message + '\n\tInput => All(' + sty.join(', ') + ')\n\tError => ' + err);
            }
        }), arrows));
    }

    _createClass(AllCombinator, [{
        key: 'call',
        value: function call(x, p, k, h) {
            var _this21 = this;

            var numFinished = 0;
            var callResults = this.arrows.map(function (x) {
                return null;
            });

            this.arrows.forEach(function (a, i) {
                a.call(x[i], p, function (y) {
                    callResults[i] = y;

                    // Once results array is finished, continue
                    if (++numFinished == _this21.arrows.length) {
                        k(callResults);
                    }
                }, h);
            });
        }
    }]);

    return AllCombinator;
}(Combinator);

var AnyCombinator = function (_Combinator4) {
    _inherits(AnyCombinator, _Combinator4);

    function AnyCombinator(arrows) {
        _classCallCheck(this, AnyCombinator);

        return _possibleConstructorReturn(this, (AnyCombinator.__proto__ || Object.getPrototypeOf(AnyCombinator)).call(this, _construct(function () {
            var sty = sanitizeTypes(arrows);

            try {
                var arg = ParamType.fresh();
                var out = ParamType.fresh();
                var ncs = new ConstraintSet([]);
                var err = [];

                sty.forEach(function (t, i) {
                    ncs = ncs.concat(t.constraints);
                    err = err.concat(t.errors);

                    ncs = ncs.add(new Constraint(arg, t.arg));
                    ncs = ncs.add(new Constraint(t.out, out));
                });

                return new ArrowType(arg, out, ncs, err);
            } catch (err) {
                var message;
                var location = getLocation(err.stack);

                if (location) {
                    message = 'Unable to any arrows at: ' + location;
                } else {
                    message = 'Unable to any arrows';
                }

                throw new ComposeError(message + '\n\tInput => Any(' + sty.join(', ') + ')\n\tError => ' + err);
            }
        }), arrows));
    }

    _createClass(AnyCombinator, [{
        key: 'call',
        value: function call(x, p, k, h) {
            // Note: This must be done at execution time instead of construction
            // time because a recursive arrow may present itself as falsely async.

            if (!this.arrows.every(function (a) {
                return a.isAsync();
            })) {
                throw new Error('Any combinator requires asynchronous arrow arguments');
            }

            var progress = this.arrows.map(function () {
                return new Progress(true);
            });

            // If combinator is canceled, cancel all children
            p.addCanceler(function () {
                return progress.forEach(function (p) {
                    return p.cancel();
                });
            });

            this.arrows.forEach(function (a, i) {
                // When arrow[i] progresses, cancel others
                progress[i].addObserver(function () {
                    p.advance();

                    progress.forEach(function (p, j) {
                        if (j != i) {
                            p.cancel();
                        }
                    });
                });

                // TODO - clone value
                // Kick off execution synchronously
                a.call(x, progress[i], k, h);
            });
        }
    }, {
        key: 'isAsync',
        value: function isAsync() {
            return true;
        }
    }]);

    return AnyCombinator;
}(Combinator);

var TryCombinator = function (_Combinator5) {
    _inherits(TryCombinator, _Combinator5);

    function TryCombinator(a, s, f) {
        _classCallCheck(this, TryCombinator);

        return _possibleConstructorReturn(this, (TryCombinator.__proto__ || Object.getPrototypeOf(TryCombinator)).call(this, _construct(function () {
            var sta = sanitizeTypes([a])[0];
            var sts = sanitizeTypes([s])[0];
            var stf = sanitizeTypes([f])[0];

            try {
                var arg = sta.arg;
                var out = ParamType.fresh();
                var ncs = new ConstraintSet([]);
                var err = [];

                ncs = ncs.concat(sta.constraints);
                ncs = ncs.concat(sts.constraints);
                ncs = ncs.concat(stf.constraints);
                ncs = ncs.add(new Constraint(sta.out, sts.arg));
                ncs = ncs.add(new Constraint(sts.out, out));
                ncs = ncs.add(new Constraint(stf.out, out));

                sta.errors.forEach(function (e, i) {
                    ncs = ncs.add(new Constraint(e, stf.arg));
                });

                err = err.concat(sts.errors);
                err = err.concat(stf.errors);

                return new ArrowType(arg, out, ncs, err);
            } catch (err) {
                var message;
                var location = getLocation(err.stack);

                if (location) {
                    message = 'Unable to try arrows at: ' + location;
                } else {
                    message = 'Unable to try arrows';
                }

                throw new ComposeError(message + '\n\tInput => Try(' + [sta, sts, stf].join(', ') + ')\n\tError => ' + err);
            }
        }), [a, s, f]));
    }

    _createClass(TryCombinator, [{
        key: 'call',
        value: function call(x, p, k, h) {
            var _this24 = this;

            // Invoke original error callback 'h' if either
            // callback creates an error value. This allows
            // nesting of error callbacks.

            var branch = new Progress(true);
            p.addCanceler(function () {
                return branch.cancel();
            });
            branch.addObserver(function () {
                return p.advance();
            });

            this.arrows[0].call(x, branch, function (y) {
                return _this24.arrows[1].call(y, p, k, h);
            }, function (z) {
                branch.cancel();
                _this24.arrows[2].call(z, p, k, h);
            });
        }
    }, {
        key: 'isAsync',
        value: function isAsync() {
            return (this.arrows[0].isAsync() || this.arrows[1].isAsync()) && this.arrows[2].isAsync();
        }
    }]);

    return TryCombinator;
}(Combinator);

//
// Fix-Point Combinator
//

Arrow.fix = function (ctor) {
    var arg = ParamType.fresh(true);
    var out = ParamType.fresh(true);

    var p = new ProxyArrow(arg, out);
    var a = ctor(p);
    p.freeze(a);

    if (!(a instanceof Arrow)) {
        throw new Error('Fix constructor must return an arrow');
    }

    var t = a.type.toString();

    var map = {};
    descendants(arg).forEach(function (d) {
        return map[d.id] = arg;
    });
    descendants(out).forEach(function (d) {
        return map[d.id] = out;
    });

    arg.noreduce = false;
    out.noreduce = false;
    a.type.substitute(map);

    a.type.constraints = a.type.constraints.add(new Constraint(a.type.arg, arg));
    a.type.constraints = a.type.constraints.add(new Constraint(arg, a.type.arg));
    a.type.constraints = a.type.constraints.add(new Constraint(a.type.out, out));
    a.type.constraints = a.type.constraints.add(new Constraint(out, a.type.out));

    try {
        a.type.resolve();
    } catch (err) {
        var message;
        var location = getLocation(err.stack);

        if (location) {
            message = 'Unable to fix arrow at: ' + location;
        } else {
            message = 'Unable to fix arrow';
        }

        throw new ComposeError(message + '\n\tInput => Fix(' + t + ')\n\tError => ' + err);
    }

    return a;
};

var ProxyArrow = function (_Arrow6) {
    _inherits(ProxyArrow, _Arrow6);

    function ProxyArrow(arg, out) {
        _classCallCheck(this, ProxyArrow);

        var _this25 = _possibleConstructorReturn(this, (ProxyArrow.__proto__ || Object.getPrototypeOf(ProxyArrow)).call(this, _construct(function () {
            return new ArrowType(arg, out);
        })));

        _this25.arrow = null;
        return _this25;
    }

    _createClass(ProxyArrow, [{
        key: 'freeze',
        value: function freeze(arrow) {
            this.arrow = arrow;
        }
    }, {
        key: 'call',
        value: function call(x, p, k, h) {
            return this.ensureFrozen(function (a) {
                return a.call(x, p, k, h);
            });
        }
    }, {
        key: 'equals',
        value: function equals(that) {
            return this.ensureFrozen(function (a) {
                return a.equals(that);
            });
        }
    }, {
        key: 'isAsync',
        value: function isAsync() {
            return this.ensureFrozen(function (a) {
                return a.isAsync();
            });
        }
    }, {
        key: 'ensureFrozen',
        value: function ensureFrozen(f) {
            if (this.arrow != null) {
                return f(this.arrow);
            }

            throw new Error('Proxy not frozen');
        }
    }]);

    return ProxyArrow;
}(Arrow);

function descendants(param) {
    var children = [param];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = param.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var child = _step.value;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = descendants(child)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var descendant = _step2.value;

                    children.push(descendant);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return children;
}

var TypeClash = function (_Error2) {
    _inherits(TypeClash, _Error2);

    function TypeClash(type, value) {
        _classCallCheck(this, TypeClash);

        var _this26 = _possibleConstructorReturn(this, (TypeClash.__proto__ || Object.getPrototypeOf(TypeClash)).call(this));

        _this26.type = type;
        _this26.value = value;
        return _this26;
    }

    _createClass(TypeClash, [{
        key: 'toString',
        value: function toString() {
            return 'Runtime type assertion failure: Expected ' + this.type.toString() + '\', got \'' + JSON.stringify(this.value) + '\'.';
        }
    }]);

    return TypeClash;
}(Error);

var Constraint = function () {
    function Constraint(lower, upper) {
        _classCallCheck(this, Constraint);

        this.lower = lower;
        this.upper = upper;
    }

    _createClass(Constraint, [{
        key: 'equals',
        value: function equals(that) {
            if (that instanceof Constraint) {
                return this.lower.equals(that.lower) && this.upper.equals(that.upper);
            }

            return false;
        }
    }, {
        key: 'toString',
        value: function toString() {
            return this.lower.toString() + ' <= ' + this.upper.toString();
        }
    }, {
        key: 'isUseless',
        value: function isUseless() {
            return this.lower.equals(this.upper) || this.upper instanceof TopType;
        }
    }, {
        key: 'isConsistent',
        value: function isConsistent() {
            var a = this.lower;
            var b = this.upper;

            if (a instanceof NamedType || a instanceof SumType) {
                if (b instanceof NamedType || b instanceof SumType) {
                    var na = a instanceof NamedType ? [a] : a.names;
                    var nb = b instanceof NamedType ? [b] : b.names;

                    return na.every(function (t1) {
                        return nb.some(function (t2) {
                            return t1.equals(t2);
                        });
                    });
                }
            }

            if (a instanceof ArrayType && b instanceof ArrayType) return true;
            if (a instanceof TupleType && b instanceof TupleType) return b.types.length <= a.types.length;
            if (a instanceof TaggedUnionType && b instanceof TaggedUnionType) return a.keys.every(function (k) {
                return b.keys.indexOf(k) >= 0;
            });
            if (a instanceof RecordType && b instanceof RecordType) return b.keys.every(function (k) {
                return a.keys.indexOf(k) >= 0;
            });

            return b instanceof TopType || a.isParam() || b.isParam();
        }
    }, {
        key: 'unary',
        value: function unary() {
            var _this27 = this;

            if (this.lower instanceof ArrayType && this.upper instanceof ArrayType) {
                return [new Constraint(this.lower.type, this.upper.type)];
            }

            if (this.lower instanceof TupleType && this.upper instanceof TupleType) {
                return this.upper.types.map(function (t, i) {
                    return new Constraint(_this27.lower.types[i], t);
                });
            }

            if (this.lower instanceof TaggedUnionType && this.upper instanceof TaggedUnionType) {
                return this.lower.keys.map(function (k) {
                    return new Constraint(_this27.lower.vals[k], _this27.upper.vals[k]);
                });
            }

            if (this.lower instanceof RecordType && this.upper instanceof RecordType) {
                return this.upper.keys.map(function (k) {
                    return new Constraint(_this27.lower.vals[k], _this27.upper.vals[k]);
                });
            }

            return [];
        }
    }, {
        key: 'binary',
        value: function binary(that) {
            if (this.upper.equals(that.lower)) {
                return [new Constraint(this.lower, that.upper)];
            }

            if (this.lower.equals(that.upper)) {
                return [new Constraint(that.lower, this.upper)];
            }

            return [];
        }
    }]);

    return Constraint;
}();

var ConstraintSet = function () {
    function ConstraintSet(constraints) {
        _classCallCheck(this, ConstraintSet);

        this.constraints = constraints.filter(function (c) {
            return !c.isUseless();
        });
        var inconsistent = constraints.filter(function (c) {
            return !c.isConsistent();
        });

        if (inconsistent.length != 0) {
            throw new Error('Inconsistent constraints: [' + inconsistent.map(function (c) {
                return c.toString();
            }).join(', ') + ']');
        }
    }

    _createClass(ConstraintSet, [{
        key: 'equals',
        value: function equals(that) {
            if (this.constraints.length == that.constraints.length) {
                for (var i = 0; i < this.constraints.length; i++) {
                    if (!this.contains(this.constraints[i])) {
                        return false;
                    }
                }

                return true;
            }

            return false;
        }
    }, {
        key: 'contains',
        value: function contains(constraint) {
            for (var i = 0; i < this.constraints.length; i++) {
                if (this.constraints[i].equals(constraint)) {
                    return true;
                }
            }

            return false;
        }
    }, {
        key: 'toString',
        value: function toString() {
            return '{' + this.constraints.map(function (c) {
                return c.toString();
            }).join(', ') + '}';
        }
    }, {
        key: 'add',
        value: function add(constraint) {
            if (this.constraints.some(function (c) {
                return c.equals(constraint);
            })) {
                return this;
            }

            return new ConstraintSet(this.constraints.concat([constraint]));
        }
    }, {
        key: 'addAll',
        value: function addAll(constraints) {
            return constraints.reduce(function (set, c) {
                return set.add(c);
            }, this);
        }
    }, {
        key: 'concat',
        value: function concat(cs) {
            return this.addAll(cs.constraints);
        }
    }, {
        key: 'substitute',
        value: function substitute(map) {
            return new ConstraintSet(this.constraints.map(function (c) {
                return new Constraint(c.lower.substitute(map), c.upper.substitute(map));
            }));
        }
    }, {
        key: 'sanitize',
        value: function sanitize(map) {
            return new ConstraintSet(this.constraints.map(function (c) {
                return new Constraint(c.lower.sanitize(map), c.upper.sanitize(map));
            }));
        }
    }]);

    return ConstraintSet;
}();

//
// Arrow Type
//

var ArrowType = function () {
    function ArrowType(arg, out, constraints, errors) {
        var _this28 = this;

        _classCallCheck(this, ArrowType);

        this.arg = arg;
        this.out = out;
        this.constraints = constraints || new ConstraintSet([]);
        this.errors = [];

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            var _loop = function _loop() {
                var type = _step3.value;

                if (!_this28.errors.some(function (e) {
                    return e.equals(type);
                })) {
                    _this28.errors.push(type);
                }
            };

            for (var _iterator3 = (errors || [])[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                _loop();
            }
        } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                    _iterator3.return();
                }
            } finally {
                if (_didIteratorError3) {
                    throw _iteratorError3;
                }
            }
        }

        this.resolve();
    }

    _createClass(ArrowType, [{
        key: 'toString',
        value: function toString() {
            var type = this.arg.toString() + ' ~> ' + this.out.toString();

            if (this.constraints.constraints.length > 0 || this.errors.length > 0) {
                type += ' \\ (';
                type += this.constraints.toString();
                type += ', {';
                type += this.errors.map(function (t) {
                    return t.toString();
                }).join(', ');
                type += '})';
            }

            return type;
        }
    }, {
        key: 'resolve',
        value: function resolve() {
            var initial = this.constraints;

            while (true) {
                this.constraints = this.closure();
                this.constraints = this.mergeConcreteBounds();

                var map = this.collectBounds();

                if (Object.getOwnPropertyNames(map).length === 0) {
                    break;
                }

                this.substitute(map);
            }

            var cs = this.prune();

            if (cs.constraints.length === this.constraints.constraints.length || initial.equals(cs)) {
                return;
            }

            this.constraints = cs;
            this.resolve();
        }
    }, {
        key: 'substitute',
        value: function substitute(map) {
            this.arg = this.arg.substitute(map);
            this.out = this.out.substitute(map);
            this.constraints = this.constraints.substitute(map);
            this.errors = this.errors.map(function (e) {
                return e.substitute(map);
            });
        }

        /**
         * Add the result of unary and binary closure rules on each constraint in
         * the set until no new constraints are produced (a fixed point reached).
         */

    }, {
        key: 'closure',
        value: function closure() {
            var cs = [];
            var wl = Array.copy(this.constraints.constraints);

            while (wl.length > 0) {
                var w = wl.pop();

                if (!cs.some(function (c) {
                    return c.equals(w);
                })) {
                    w.unary().forEach(function (c) {
                        return wl.push(c);
                    });

                    var _iteratorNormalCompletion4 = true;
                    var _didIteratorError4 = false;
                    var _iteratorError4 = undefined;

                    try {
                        for (var _iterator4 = cs[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            var c = _step4.value;

                            w.binary(c).forEach(function (c) {
                                return wl.push(c);
                            });
                        }
                    } catch (err) {
                        _didIteratorError4 = true;
                        _iteratorError4 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                _iterator4.return();
                            }
                        } finally {
                            if (_didIteratorError4) {
                                throw _iteratorError4;
                            }
                        }
                    }

                    cs.push(w);
                }
            }

            return new ConstraintSet(cs);
        }

        /**
         * Replace multiple constraints which upper bound or lower bound a param
         * type with the lub or glb, respectively, of the concrete bound.
         */

    }, {
        key: 'mergeConcreteBounds',
        value: function mergeConcreteBounds() {
            var idmap = {};
            var lower = {};
            var upper = {};
            var other = [];

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = this.constraints.constraints[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var c = _step5.value;

                    var a = c.lower;
                    var b = c.upper;

                    if (a.isParam()) idmap[a.id] = a;
                    if (b.isParam()) idmap[b.id] = b;

                    if (a.isParam() && b.isConcrete()) lower[a.id] = a.id in lower ? glb(lower[a.id], b) : b;else if (b.isParam() && a.isConcrete()) upper[b.id] = b.id in upper ? lub(upper[b.id], a) : a;else other.push(c);
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            if (lower.length === 0 && upper.length === 0) {
                return null;
            }

            Object.keys(lower).forEach(function (id) {
                return other.push(new Constraint(idmap[id], lower[id]));
            });
            Object.keys(upper).forEach(function (id) {
                return other.push(new Constraint(upper[id], idmap[id]));
            });

            return new ConstraintSet(other);
        }

        /**
         * Create a substitution map. A param type p can be replaced by type t iff
         * one of the following hold:
         *
         *    - t <= p and p <= t
         *    - p^- <= t (and t is sole upper bound of p)
         *    - t <= p^+ (and t is sole lower bound of p)
         */

    }, {
        key: 'collectBounds',
        value: function collectBounds() {
            var map = {};

            function addToMap(p, t) {
                map[p.id] = t.isParam() && t.id in map ? map[t.id] : t;
            }

            var cs = this.constraints.constraints;
            var lowerParam = cs.filter(function (c) {
                return c.lower.isParam() && !c.lower.noreduce;
            });
            var upperParam = cs.filter(function (c) {
                return c.upper.isParam() && !c.upper.noreduce;
            });

            lowerParam.forEach(function (c1) {
                upperParam.forEach(function (c2) {
                    if (c1.lower.equals(c2.upper) && c1.upper.equals(c2.lower)) {
                        addToMap(c1.lower, c1.upper);
                    }
                });
            });

            var _polarity = this.polarity(),
                _polarity2 = _slicedToArray(_polarity, 2),
                n = _polarity2[0],
                p = _polarity2[1];

            var negVar = n.filter(function (v) {
                return !p.some(function (x) {
                    return x.equals(v);
                });
            }); // negative-only params
            var posVar = p.filter(function (v) {
                return !n.some(function (x) {
                    return x.equals(v);
                });
            }); // positive-only params

            // Replace negative variables by their sole upper bound, if it exists
            negVar.map(function (p) {
                return cs.filter(function (c) {
                    return c.lower === p;
                });
            }).filter(function (cs) {
                return cs.length === 1;
            }).forEach(function (c) {
                addToMap(c[0].lower, c[0].upper);
            });

            // Replace positive variables by their sole lower bound, if it exists
            posVar.map(function (p) {
                return cs.filter(function (c) {
                    return c.upper === p;
                });
            }).filter(function (cs) {
                return cs.length === 1;
            }).forEach(function (c) {
                addToMap(c[0].upper, c[0].lower);
            });

            return map;
        }

        /**
         * Remove all constraints which are in one of the following forms:
         *
         *    - t <= t where neither are params
         *    - a <= b and (a or b) is not in the arrow type
         *    - t <= p^-
         *    - p^+ <= t
         */

    }, {
        key: 'prune',
        value: function prune() {
            var _polarity3 = this.polarity(),
                _polarity4 = _slicedToArray(_polarity3, 2),
                n = _polarity4[0],
                p = _polarity4[1];

            var params = this.arg.harvest().concat(this.out.harvest()).concat(this.errors);

            return new ConstraintSet(this.constraints.constraints.filter(function (c) {
                // Keep no-reduce parameters
                if (c.lower.isParam() && c.lower.noreduce) return true;
                if (c.upper.isParam() && c.upper.noreduce) return true;

                // Remove non-parameter constraints
                if (!c.lower.isParam() && !c.upper.isParam()) return false;

                // Remove unknown type variables
                if (c.lower.isParam() && c.upper.isParam() && !params.some(function (p) {
                    return p.equals(c.lower);
                })) return false;
                if (c.lower.isParam() && c.upper.isParam() && !params.some(function (p) {
                    return p.equals(c.upper);
                })) return false;

                // Remove constraints with useless polarity
                if (c.lower.isParam() && !n.some(function (p) {
                    return p.equals(c.lower);
                })) return false;
                if (c.upper.isParam() && !p.some(function (p) {
                    return p.equals(c.upper);
                })) return false;

                return true;
            }));
        }

        /**
         * Determine which variables in arg and out have negative or positive position. This algorithm uses
         * dumb iteration and may be improved by the use of a worklist. The return value fo this function is
         * a pair [n, p] where n is the set of negative variables and p is the set of positive variables. If
         * a variable is both negative and positive it exists in both sets. If a variable is unreachable by
         * arg or out then it will be absent from both lists.
         */

    }, {
        key: 'polarity',
        value: function polarity() {
            var neg = this.arg.harvest();
            var pos = this.out.harvest().concat(this.errors);

            var changed = true;
            var negDefs = this.constraints.constraints.filter(function (c) {
                return c.lower.isParam();
            }).map(function (c) {
                return [c.lower, c.upper.harvest()];
            });
            var posDefs = this.constraints.constraints.filter(function (c) {
                return c.upper.isParam();
            }).map(function (c) {
                return [c.upper, c.lower.harvest()];
            });

            while (changed) {
                changed = false;

                var extraNeg = negDefs.filter(function (_ref3) {
                    var _ref4 = _slicedToArray(_ref3, 2),
                        a = _ref4[0],
                        b = _ref4[1];

                    return neg.some(function (p) {
                        return p === a;
                    });
                }).reduce(function (c, _ref5) {
                    var _ref6 = _slicedToArray(_ref5, 2),
                        a = _ref6[0],
                        b = _ref6[1];

                    return c.concat(b);
                }, []).filter(function (x) {
                    return !neg.some(function (p) {
                        return p === x;
                    });
                });
                var extraPos = posDefs.filter(function (_ref7) {
                    var _ref8 = _slicedToArray(_ref7, 2),
                        a = _ref8[0],
                        b = _ref8[1];

                    return pos.some(function (p) {
                        return p === a;
                    });
                }).reduce(function (c, _ref9) {
                    var _ref10 = _slicedToArray(_ref9, 2),
                        a = _ref10[0],
                        b = _ref10[1];

                    return c.concat(b);
                }, []).filter(function (x) {
                    return !pos.some(function (p) {
                        return p === x;
                    });
                });

                if (extraNeg.length > 0 || extraPos.length > 0) {
                    changed = true;
                    neg = neg.concat(extraNeg);
                    pos = pos.concat(extraPos);
                }
            }

            return [neg, pos];
        }
    }, {
        key: 'sanitize',
        value: function sanitize() {
            var map = {};
            var arg = this.arg.sanitize(map);
            var out = this.out.sanitize(map);
            var constraints = this.constraints.sanitize(map);
            var errors = this.errors.map(function (e) {
                return e.sanitize(map);
            });

            return new ArrowType(arg, out, constraints, errors);
        }
    }]);

    return ArrowType;
}();

//
// Type Utilities
//

function sanitizeTypes(arrows) {
    return arrows.map(function (a) {
        return a.type;
    }).map(function (t) {
        return t.sanitize();
    });
}

function lub(a, b) {
    if (a.equals(b)) {
        return a;
    }

    if (a instanceof NamedType || a instanceof SumType) {
        if (b instanceof NamedType || b instanceof SumType) {
            var na = a instanceof NamedType ? [a] : a.names;
            var nb = b instanceof NamedType ? [b] : b.names;
            var nu = na.concat(nb.filter(function (n) {
                return na.indexOf(n) < 0;
            }));

            if (nu.length == 1) return new NamedType(nu[0]);
            if (nu.length >= 2) return new SumType(nu);
        }
    }

    if (a instanceof TaggedUnionType && b instanceof TaggedUnionType) {
        var map = {};
        b.labels().filter(function (k) {
            return a.labels().indexOf(k) >= 0;
        }).forEach(function (k) {
            map[k] = lub(a.typeMap[k], b.typeMap[k]);
        });

        return new TaggedUnionType(map);
    }

    if (a instanceof ArrayType && b instanceof ArrayType) {
        return new ArrayType(lub(a.type, b.type));
    }

    if (a instanceof TupleType && b instanceof TupleType) {
        return new TupleType(a.types.length < b.types.length ? a.types.map(function (t, i) {
            return lub(t, b.types[i]);
        }) : b.types.map(function (t, i) {
            return lub(t, a.types[i]);
        }));
    }

    if (a instanceof RecordType && b instanceof RecordType) {
        var map = {};
        a.keys.filter(function (k) {
            return b.keys.indexOf(k) >= 0;
        }).forEach(function (k) {
            map[k] = lub(a.vals[k], b.vals[k]);
        });

        return new RecordType(map);
    }

    return new TopType();
}

function glb(a, b) {
    if (a.equals(b)) {
        return a;
    }

    if (a instanceof TopType) return b;
    if (b instanceof TopType) return a;

    if (a instanceof NamedType || a instanceof SumType) {
        if (b instanceof NamedType || b instanceof SumType) {
            var na = a instanceof NamedType ? [a] : a.names;
            var nb = b instanceof NamedType ? [b] : b.names;
            var ni = na.filter(function (t1) {
                return nb.some(function (t2) {
                    return t1 === t2;
                });
            });

            if (ni.length == 1) return new NamedType(ni[0]);
            if (ni.length >= 2) return new SumType(ni);
        }
    }

    if (a instanceof ArrayType && b instanceof ArrayType) {
        return new ArrayType(glb(a.type, b.type));
    }

    if (a instanceof TupleType && b instanceof TupleType) {
        return new TupleType(a.types.length < b.types.length ? b.types.map(function (t, i) {
            return i >= a.types.length ? t : glb(t, a.types[i]);
        }) : a.types.map(function (t, i) {
            return i >= b.types.length ? t : glb(t, b.types[i]);
        }));
    }

    if (a instanceof TaggedUnionType && b instanceof TaggedUnionType) {
        var map = {};
        a.keys.forEach(function (k) {
            map[k] = k in map ? glb(map[k], a.vals[k]) : a.vals[k];
        });
        b.keys.forEach(function (k) {
            map[k] = k in map ? glb(map[k], b.vals[k]) : b.vals[k];
        });

        return new RecordType(map);
    }

    if (a instanceof RecordType && b instanceof RecordType) {
        var map = {};
        a.keys.forEach(function (k) {
            map[k] = k in map ? glb(map[k], a.vals[k]) : a.vals[k];
        });
        b.keys.forEach(function (k) {
            map[k] = k in map ? glb(map[k], b.vals[k]) : b.vals[k];
        });

        return new RecordType(map);
    }

    throw new Error('No greatest lower bound of \'' + a.toString() + '\' and \'' + b.toString() + '\'.');
}

var Type = function () {
    function Type() {
        _classCallCheck(this, Type);
    }

    _createClass(Type, [{
        key: 'equals',
        value: function equals(that) {
            throw new Error('Equals undefined');
        }
    }, {
        key: 'check',
        value: function check(value) {
            throw new TypeClash(this, value);
        }
    }, {
        key: 'isParam',
        value: function isParam() {
            return false;
        }
    }, {
        key: 'isConcrete',
        value: function isConcrete() {
            return true;
        }
    }, {
        key: 'harvest',
        value: function harvest() {
            return [];
        }
    }, {
        key: 'substitute',
        value: function substitute(map) {
            return this;
        }
    }, {
        key: 'sanitize',
        value: function sanitize(map) {
            return this;
        }
    }]);

    return Type;
}();

var uniqid = 0;

var ParamType = function (_Type) {
    _inherits(ParamType, _Type);

    _createClass(ParamType, null, [{
        key: 'fresh',
        value: function fresh(noreduce) {
            return new ParamType(++uniqid, noreduce || false);
        }
    }]);

    function ParamType(id, noreduce) {
        _classCallCheck(this, ParamType);

        var _this29 = _possibleConstructorReturn(this, (ParamType.__proto__ || Object.getPrototypeOf(ParamType)).call(this));

        _this29.id = id;
        _this29.noreduce = noreduce;
        _this29.children = [];
        return _this29;
    }

    _createClass(ParamType, [{
        key: 'equals',
        value: function equals(that) {
            return that instanceof ParamType && this.id === that.id;
        }
    }, {
        key: 'toString',
        value: function toString() {
            return "'" + this.id;
        }
    }, {
        key: 'check',
        value: function check(value) {}
    }, {
        key: 'isParam',
        value: function isParam() {
            return true;
        }
    }, {
        key: 'isConcrete',
        value: function isConcrete() {
            return false;
        }
    }, {
        key: 'harvest',
        value: function harvest() {
            return [this];
        }
    }, {
        key: 'substitute',
        value: function substitute(map) {
            return this.id in map ? map[this.id] : this;
        }
    }, {
        key: 'sanitize',
        value: function sanitize(map) {
            if (!(this.id in map)) {
                var p = ParamType.fresh(this.noreduce);
                this.children.push(p);
                map[this.id] = p;
            }

            return map[this.id];
        }
    }]);

    return ParamType;
}(Type);

var TopType = function (_Type2) {
    _inherits(TopType, _Type2);

    function TopType() {
        _classCallCheck(this, TopType);

        return _possibleConstructorReturn(this, (TopType.__proto__ || Object.getPrototypeOf(TopType)).apply(this, arguments));
    }

    _createClass(TopType, [{
        key: 'equals',
        value: function equals(that) {
            return that instanceof TopType;
        }
    }, {
        key: 'toString',
        value: function toString() {
            return '_';
        }
    }, {
        key: 'check',
        value: function check(value) {}
    }]);

    return TopType;
}(Type);

var runtimeCheckers = {
    'Bool': function Bool(v) {
        return v === true || v === false;
    },
    'Number': function Number(v) {
        return typeof v == "number";
    },
    'String': function String(v) {
        return typeof v == "string";
    },
    'Elem': function Elem(v) {
        return v instanceof jQuery;
    },
    'Event': function Event(v) {
        return false;
    } };

function checkNamedType(name, value) {
    var checker = runtimeCheckers[name];

    if (checker) {
        return checker(value);
    } else {
        throw new Error('Named type \'' + name + '\' does not have an associated checker.');
    }
}

var NamedType = function (_Type3) {
    _inherits(NamedType, _Type3);

    function NamedType(name) {
        _classCallCheck(this, NamedType);

        var _this31 = _possibleConstructorReturn(this, (NamedType.__proto__ || Object.getPrototypeOf(NamedType)).call(this));

        _this31.name = name;
        return _this31;
    }

    _createClass(NamedType, [{
        key: 'equals',
        value: function equals(that) {
            return that instanceof NamedType && this.name === that.name;
        }
    }, {
        key: 'toString',
        value: function toString() {
            return this.name;
        }
    }, {
        key: 'check',
        value: function check(value) {
            if (!checkNamedType(this.name, value)) {
                _get(NamedType.prototype.__proto__ || Object.getPrototypeOf(NamedType.prototype), 'check', this).call(this, value);
            }
        }
    }]);

    return NamedType;
}(Type);

var SumType = function (_Type4) {
    _inherits(SumType, _Type4);

    function SumType(names) {
        _classCallCheck(this, SumType);

        var _this32 = _possibleConstructorReturn(this, (SumType.__proto__ || Object.getPrototypeOf(SumType)).call(this));

        _this32.names = names.unique().sort();
        return _this32;
    }

    _createClass(SumType, [{
        key: 'equals',
        value: function equals(that) {
            if (that instanceof SumType) {
                return this.names.length === that.names.length && this.names.every(function (n, i) {
                    return n === that.names[i];
                });
            }

            return false;
        }
    }, {
        key: 'toString',
        value: function toString() {
            return this.names.join('+');
        }
    }, {
        key: 'check',
        value: function check(value) {
            if (!this.names.some(function (name) {
                return checkNamedType(name, value);
            })) {
                _get(SumType.prototype.__proto__ || Object.getPrototypeOf(SumType.prototype), 'check', this).call(this, value);
            }
        }
    }]);

    return SumType;
}(Type);

var TaggedUnionType = function (_Type5) {
    _inherits(TaggedUnionType, _Type5);

    function TaggedUnionType(map) {
        _classCallCheck(this, TaggedUnionType);

        var _this33 = _possibleConstructorReturn(this, (TaggedUnionType.__proto__ || Object.getPrototypeOf(TaggedUnionType)).call(this));

        _this33.vals = map;
        _this33.keys = Object.keys(map).sort();
        return _this33;
    }

    _createClass(TaggedUnionType, [{
        key: 'equals',
        value: function equals(that) {
            var _this34 = this;

            if (that instanceof TaggedUnionType) {
                return this.keys.length === that.keys.length && this.keys.every(function (k) {
                    return _this34.vals[k].equals(that.vals[k]);
                });
            }

            return false;
        }
    }, {
        key: 'toString',
        value: function toString() {
            var _this35 = this;

            return '<' + this.keys.map(function (k) {
                return k + ': ' + _this35.vals[k].toString();
            }).join(', ') + '>';
        }
    }, {
        key: 'check',
        value: function check(value) {
            try {
                for (var key in this.keys) {
                    if (value.hasTag(key)) {
                        return this.vals[key].check(value.value());
                    }
                }

                return false;
            } catch (err) {
                _get(TaggedUnionType.prototype.__proto__ || Object.getPrototypeOf(TaggedUnionType.prototype), 'check', this).call(this, value);
            }
        }
    }, {
        key: 'isConcrete',
        value: function isConcrete() {
            var _this36 = this;

            return this.keys.every(function (k) {
                return _this36.vals[k].isConcrete();
            });
        }
    }, {
        key: 'harvest',
        value: function harvest() {
            var _this37 = this;

            return this.keys.reduce(function (acc, k) {
                return acc.concat(_this37.vals[k].harvest());
            }, []);
        }
    }, {
        key: 'substitute',
        value: function substitute(map) {
            var _this38 = this;

            var map = {};
            this.keys.forEach(function (k) {
                map[k] = _this38.vals[k].substitute(map);
            });

            return new TaggedUnionType(map);
        }
    }, {
        key: 'sanitize',
        value: function sanitize(map) {
            var _this39 = this;

            var vals = {};
            this.keys.forEach(function (k) {
                vals[k] = _this39.vals[k].sanitize(map);
            });

            return new TaggedUnionType(vals);
        }
    }]);

    return TaggedUnionType;
}(Type);

var ArrayType = function (_Type6) {
    _inherits(ArrayType, _Type6);

    function ArrayType(type) {
        _classCallCheck(this, ArrayType);

        var _this40 = _possibleConstructorReturn(this, (ArrayType.__proto__ || Object.getPrototypeOf(ArrayType)).call(this));

        _this40.type = type;
        return _this40;
    }

    _createClass(ArrayType, [{
        key: 'equals',
        value: function equals(that) {
            if (that instanceof ArrayType) {
                return this.type.equals(that.type);
            }

            return false;
        }
    }, {
        key: 'toString',
        value: function toString() {
            return '[' + this.type.toString() + ']';
        }
    }, {
        key: 'check',
        value: function check(value) {
            var _this41 = this;

            if (value && value.constructor === Array) {
                value.forEach(function (v) {
                    return _this41.type.check(v);
                });
            } else {
                _get(ArrayType.prototype.__proto__ || Object.getPrototypeOf(ArrayType.prototype), 'check', this).call(this, value);
            }
        }
    }, {
        key: 'isConcrete',
        value: function isConcrete() {
            return this.type.isConcrete();
        }
    }, {
        key: 'harvest',
        value: function harvest() {
            return this.type.harvest();
        }
    }, {
        key: 'substitute',
        value: function substitute(map) {
            return new ArrayType(this.type.substitute(map));
        }
    }, {
        key: 'sanitize',
        value: function sanitize(map) {
            return new ArrayType(this.type.sanitize(map));
        }
    }]);

    return ArrayType;
}(Type);

var TupleType = function (_Type7) {
    _inherits(TupleType, _Type7);

    function TupleType(types) {
        _classCallCheck(this, TupleType);

        var _this42 = _possibleConstructorReturn(this, (TupleType.__proto__ || Object.getPrototypeOf(TupleType)).call(this));

        _this42.types = types;
        return _this42;
    }

    _createClass(TupleType, [{
        key: 'equals',
        value: function equals(that) {
            if (that instanceof TupleType) {
                return this.types.length === that.types.length && this.types.every(function (t, i) {
                    return t.equals(that.types[i]);
                });
            }

            return false;
        }
    }, {
        key: 'toString',
        value: function toString() {
            return '(' + this.types.map(function (t) {
                return t.toString();
            }).join(', ') + ')';
        }
    }, {
        key: 'check',
        value: function check(value) {
            var _this43 = this;

            if (value && value.constructor === Array) {
                value.forEach(function (v, i) {
                    return _this43.types[i].check(v);
                });
            } else {
                _get(TupleType.prototype.__proto__ || Object.getPrototypeOf(TupleType.prototype), 'check', this).call(this, value);
            }
        }
    }, {
        key: 'isConcrete',
        value: function isConcrete() {
            return this.types.every(function (t) {
                return t.isConcrete();
            });
        }
    }, {
        key: 'harvest',
        value: function harvest() {
            return this.types.reduce(function (acc, t) {
                return acc.concat(t.harvest());
            }, []);
        }
    }, {
        key: 'substitute',
        value: function substitute(map) {
            return new TupleType(this.types.map(function (t) {
                return t.substitute(map);
            }));
        }
    }, {
        key: 'sanitize',
        value: function sanitize(map) {
            return new TupleType(this.types.map(function (t) {
                return t.sanitize(map);
            }));
        }
    }]);

    return TupleType;
}(Type);

var RecordType = function (_Type8) {
    _inherits(RecordType, _Type8);

    function RecordType(map) {
        _classCallCheck(this, RecordType);

        var _this44 = _possibleConstructorReturn(this, (RecordType.__proto__ || Object.getPrototypeOf(RecordType)).call(this));

        _this44.vals = map;
        _this44.keys = Object.keys(map).sort();
        return _this44;
    }

    _createClass(RecordType, [{
        key: 'equals',
        value: function equals(that) {
            var _this45 = this;

            if (that instanceof RecordType) {
                return this.keys.length === that.keys.length && this.keys.every(function (k) {
                    return _this45.vals[k].equals(that.vals[k]);
                });
            }

            return false;
        }
    }, {
        key: 'toString',
        value: function toString() {
            var _this46 = this;

            return '{' + this.keys.map(function (k) {
                return k + ': ' + _this46.vals[k].toString();
            }).join(', ') + '}';
        }
    }, {
        key: 'check',
        value: function check(value) {
            var _this47 = this;

            try {
                this.keys.forEach(function (k) {
                    _this47.vals[k].check(value[k]);
                });
            } catch (err) {
                _get(RecordType.prototype.__proto__ || Object.getPrototypeOf(RecordType.prototype), 'check', this).call(this, value);
            }
        }
    }, {
        key: 'isConcrete',
        value: function isConcrete() {
            var _this48 = this;

            return this.keys.every(function (k) {
                return _this48.vals[k].isConcrete();
            });
        }
    }, {
        key: 'harvest',
        value: function harvest() {
            var _this49 = this;

            return this.keys.reduce(function (acc, k) {
                return acc.concat(_this49.vals[k].harvest());
            }, []);
        }
    }, {
        key: 'substitute',
        value: function substitute(map) {
            var _this50 = this;

            var vals = {};
            this.keys.forEach(function (k) {
                vals[k] = _this50.vals[k].substitute(map);
            });

            return new RecordType(vals);
        }
    }, {
        key: 'sanitize',
        value: function sanitize(map) {
            var _this51 = this;

            var vals = {};
            this.keys.forEach(function (k) {
                vals[k] = _this51.vals[k].sanitize(map);
            });

            return new RecordType(vals);
        }
    }]);

    return RecordType;
}(Type);

function getLocation(stack) {
    var r = new RegExp(/(?:https?|file):\/\/(.+):(\d+):\d+/g);

    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
        for (var _iterator6 = stack.match(r)[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var match = _step6.value;

            var parts = new RegExp(/(?:https?|file):\/\/(.+):(\d+):\d+/g).exec(match);

            if (!parts[1].endsWith('arrows.js')) {
                return parts[1] + ':' + parts[2];
            }
        }
    } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion6 && _iterator6.return) {
                _iterator6.return();
            }
        } finally {
            if (_didIteratorError6) {
                throw _iteratorError6;
            }
        }
    }

    return '';
}