var count  = 1;
var cacheObj = {};

function startArrow() {
	Arrow.fix(function (a) {
		return Arrow.seq([getValue.lift(), Arrow.try(cachedAjax, 
				Arrow.seq([
					getChachedData,
					Arrow.fanout([
					pieChart
						.on('select', clickHandlerFn)
						.on('onmouseover', mouseHandlerFn),
					barChart]),
					new DelayArrow(500),
					a
					]),
				Arrow.id())]);
		}).run();
}

function getValue() {
	/* @arrow :: _ ~> Number */
	return count++;
}
 
var getChachedData = new LiftedArrow(function getChachedData() {
	/* @arrow :: _ ~> { data: [_] }  */
	var result = [];
	Object.keys(cacheObj).forEach(function(key) {
		result = result.concat(cacheObj[key].value.data);
	});
	return {
		data: result
	}
});

var transformationFn = function (rows, x) {
	var dataArr = [[x, 'count']],
	dataMap = {};
	rows.forEach(function (data) {
		var prop = dataMap[data[x]];
		if (!prop) {
			prop = 0;
		}
		dataMap[data[x]] = ++prop;
	});
	Object.keys(dataMap).forEach(function (key) {
		dataArr.push([key, dataMap[key]]);
	});
	return dataArr;
};

var clickHandlerFn = function () {
	var pie = window.charts['piechart'];
	var selectedItem = pie.chartObj.getSelection()[0];
	if (selectedItem) {
		var value = pie.data.getValue(selectedItem.row || 0, selectedItem.column || 0);
		document.getElementById('result1').innerHTML = 'You clicked: ' + value + '!';
	}
}
var mouseHandlerFn = function (item) {
	var pie = window.charts['piechart'];
	if (item) {
		var value = pie.data.getValue(item.row || 0, item.column || 0);
		document.getElementById('result2').innerHTML = 'You hovered over on: ' + value + '!';
	}
}

var pieChart = Arrow.PieChart(function (resp) {
		return {
			'data' : resp.data,
			'chart_options' : {
				title : 'Race Count Pie Chart'
			},
			'x' : 'race'
		}
	}, transformationFn, 'piechart');

var barChart = Arrow.BarChart(function (resp) {
		return {
			'data' : resp.data,
			'chart_options' : {
				title : 'Age Count Bar Chart'
			},
			'x' : 'age'
		}
	}, transformationFn, 'barchart');

var load = new AjaxArrow(function (page) {
		/**
		 * @conf :: Number
		 * @resp :: { data: [_] }
		 */
		return {
			'url' : '../data/encounter' + page + '.json',
			'dataType' : 'json'
		};
});
	
function lookup(key) {
    /* @arrow :: 'a ~> 'b \ ({}, { 'a }) */

    if (key in cacheObj) {
        return cacheObj[key].value;
    }
    throw key;
} 
var cache = new LiftedArrow(function (key, value) {
   /* @arrow :: ('a, 'b) ~> _ */

    cacheObj[key] = {
		value: value,
		timestamp: Date.now()
	};
});

var cachedAjax = Arrow.try(
    lookup.lift(),
    Arrow.id(),
    load.carry().seq(cache.lift().remember()).seq(new NthArrow(2))
);

startArrow();
