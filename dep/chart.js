

    google.charts.load('current', {
        'packages': ['corechart', 'annotationchart', 'calendar']
    });
    google.charts.setOnLoadCallback(startArrow);

	function startArrow() {
		Arrow.seq([load,
				Arrow.fanout([
						drawAllCharts.lift(),
						drawAllCharts2.lift()])]).run();
	}
	function test() {
	/* @arrow :: Elem ~> String */
		return "mock";
	}
	
	function transformPiData(resp) {
        var dataArr = [['Race', 'Age']],
          raceMap = {};
        resp.forEach(function (data) {
            var race = raceMap[data.race];
            if (!race) {
                race = 0;
            }
            raceMap[data.race] = ++race;
        });
        Object.keys(raceMap).forEach(function (key) {
            dataArr.push([key, raceMap[key]]);
        });
        return dataArr;
    }

	var chart = new ChartArrow(function (data) {
			/* @conf :: { data: [{id: Number, name: String, encounter_num: Number, age: Number, race: String, date: String, rxnorm: [String]}] }
			 * @resp :: _ */
			return {
				'data' : transformPiData(data.data),
				'options' : {
					title : 'Race Count'
				},
				'type': 'pie',
				'x': 'race',
				'elem' : 'piechart'
			}
		});

	var load = new AjaxArrow(function (str) {
	/**
     * @conf :: (Elem, Event)
     * @resp :: { data: [{id: Number, name: String, encounter_num: Number, age: Number, race: String, date: String, rxnorm: [String]}] }
     */
		return {
			'url': 'data/encounter.json',
			'dataType': 'json'
		};
	});
	
	 function drawAllCharts(response) {
    /** @arrow :: { data: [{id: Number, name: String, encounter_num: Number, age: Number, race: String, date: String, rxnorm: [String]}] } ~>  _ */

        drawScatterChart(transformEncounterData(response.data));
        drawBubbleChart(transformRaceData(response.data));
    }
	
    function drawAllCharts(response) {
    /** @arrow :: { data: [{id: Number, name: String, encounter_num: Number, age: Number, race: String, date: String, rxnorm: [String]}] } ~>  _ */

        drawScatterChart(transformEncounterData(response.data));
        drawBubbleChart(transformRaceData(response.data));
    }
	
	function drawAllCharts2(response) {
    /** @arrow :: { data: [{id: Number, name: String, encounter_num: Number, age: Number, race: String, date: String, rxnorm: [String]}] } ~> _ */
		var columns = [];
        drawCalendarChart(transformCalendarData(response.data));
        drawAnnotationChart(columns, transformTimelineData(columns, response.data));
    }

    function transformCalendarData(resp) {
        var dataArr = [],
            dateMap = {};
        resp.forEach(function (data) {
            var count = dateMap[data.date];
            if (!count) {
                count = 0;
            }
            dateMap[data.date] = ++count;
        });
        Object.keys(dateMap).forEach(function (key) {
            dataArr.push([new Date(key), dateMap[key]]);
        });
        return dataArr;
    }

    function transformEncounterData(resp) {
        var dataArr = [['Age', 'Encounters']],
            ageMap = {};
        resp.forEach(function (data) {
            var count = ageMap[data.age];
            if (!count) {
                count = 0;
            }
            ageMap[data.age] = ++count;
        });
        Object.keys(ageMap).forEach(function (key) {
            dataArr.push([key, ageMap[key]]);
        });
        return dataArr;
    }

    function transformRaceData(resp) {

        var dataArr = [['Race', "Average Age", 'Encounters', "Race"]],
            raceMap = {};
        resp.forEach(function (data) {
            var race = raceMap[data.race];
            if (!race) {
                race = {
                    count: 0,
                    age: data.age
                };
            }
            race.count++;
            race.age = (race.age + data.age) / 2;
            raceMap[data.race] = race;
        });
        Object.keys(raceMap).forEach(function (key) {
            dataArr.push([key, raceMap[key].age, raceMap[key].count, key]);
        });
        return dataArr;
    }

    /*
     Should run in O(n * m), where n is the response count & m is the size of the race map
     */
    function transformTimelineData(columns, resp) {

        var racesData = {};
        resp.forEach(function (data) {
            if (racesData[data.race] === undefined) {
                racesData[data.race] = data.race;
            }
        });

        var dataArr = [],
            dateMap = {};
        resp.forEach(function (data) {
            var dateObj = dateMap[data.date];
            if (!dateObj) {
                dateObj = {};
            }
            var raceObj = dateObj[data.race];
            if (!raceObj) {
                dateObj[data.race] = 0;
            }
            dateObj[data.race] = dateObj[data.race] + 1;
            dateMap[data.date] = dateObj;
        });
        Object.keys(dateMap).forEach(function (key) {
            var data = [new Date(key)];
            Object.keys(racesData).forEach(function (race) {
                data.push(dateMap[key][race] || 0);
            });
            dataArr.push(data);
        });

        Object.keys(racesData).forEach(function (race) {
            columns.push(['number', race])
        });
        return dataArr;

    }

    function drawBubbleChart(raw) {
        var data = google.visualization.arrayToDataTable(raw);

        var options = {
            title: 'Encounters categorized by race & age',
            hAxis: {
                title: 'Average Age'
            },
            vAxis: {
                title: 'Encounters',
                maxValue: 225
            },
            bubble: {
                textStyle: {
                    fontSize: 11
                }
            }
        };

        var chart = new google.visualization.BubbleChart(document.getElementById('bubble_chart_div'));
        chart.draw(data, options);
    }

    function drawScatterChart(arr) {
        var data = google.visualization.arrayToDataTable(arr);

        var options = {
            title: 'Age vs. # of encounters',
            hAxis: {
                title: 'Age'
            },
            vAxis: {
                title: '# of encounters'
            },
            legend: 'none'
        };

        var chart = new google.visualization.ScatterChart(document.getElementById('scatter_div'));

        chart.draw(data, options);
    }

    function drawAnnotationChart(columns, rows) {
        var data = new google.visualization.DataTable();
        data.addColumn('date', 'Date');
        columns.forEach(function (col) {
            data.addColumn(col[0], col[1]);
        });
        data.addRows(rows);

        var chart = new google.visualization.AnnotationChart(document.getElementById('chart_div'));

        var options = {
            title: "Timeline Chart",
            displayAnnotations: false,
            zoomStartTime: new Date("2016", "11", "01")
        };

        chart.draw(data, options);
    }

    function drawCalendarChart(resp) {
        var dataTable = new google.visualization.DataTable();
        dataTable.addColumn({type: 'date', id: 'Date'});
        dataTable.addColumn({type: 'number', id: 'Encounters'});
        dataTable.addRows(resp);


        var chart = new google.visualization.Calendar(document.getElementById('calendar_basic'));

        var options = {
            title: "Encounters for Influenza A virus vaccine",
            height: 200
        };

        chart.draw(dataTable, options);
    }


function sendQueryRequest() {
        var xhttp = new XMLHttpRequest(),
            item = document.getElementById('item').value,
            table = document.getElementById('table').value,
            response, result, tr, td;
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                response = JSON.parse(xhttp.responseText);
                result = document.getElementById('result');
                result.innerHTML = '';
                if (response.items && response.items.length > 0) {
                    item = response.items[0];
                    tr = document.createElement('tr');
                    Object.keys(item).forEach(function (key) {
                        td = document.createElement('th');
                        td.innerHTML = key;
                        tr.appendChild(td);
                    }, this);
                    result.appendChild(tr);

                    response.items.forEach(function (item) {
                        tr = document.createElement('tr');
                        Object.keys(item).forEach(function (key) {
                            td = document.createElement('td');
                            td.innerHTML = item[key];
                            tr.appendChild(td);
                        }, this);
                        result.appendChild(tr);
                    }, this);
                }
            }
        };
        xhttp.open("GET", 'api/transactions?query=select ' + item + ' from ' + table, true);
        xhttp.send();
    }
