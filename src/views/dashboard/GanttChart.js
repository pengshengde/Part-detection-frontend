var data = [];
var dataCount = 10;
var startTime = new Date();
startTime.setHours(0, 0, 0, 0);
startTime = startTime.getTime();
var categories = ['设备1', '设备2', '设备3','设备4', '设备5', '设备6'];
var types = [
  {name: '运行', color: '#75d874'},
  {name: '故障', color: '#bd6d6c'},
  {name: '等待', color: '#e0bc78'},
/*  {name: '备用', color: '#7b9ce1'},*/
];
//产生模拟数据
echarts.util.each(categories, function (category, index) {
  var baseTime = startTime;
  for (var i = 0; i < dataCount; i++) {
    var typeItem = types[Math.round(Math.random() * (types.length-1))];
    var duration = Math.round(Math.random() * 3600 * 2000);
    data.push({
      name: typeItem.name,
      value: [
        index,
        baseTime,
        baseTime += duration,
        duration
      ],
      itemStyle: {
        normal: {
          color: typeItem.color
        }
      }
    });
    baseTime += Math.round(Math.random() * 2000);
  }
});
//设定图形效果
function renderItem(params, api) {
  var categoryIndex = api.value(0);
  var start = api.coord([api.value(1), categoryIndex]);
  var end = api.coord([api.value(2), categoryIndex]);
  var height = api.size([0, 1])[1] * 0.6;

  var rectShape = echarts.graphic.clipRectByRect({
    x: start[0],
    y: start[1] - height / 2,
    width: end[0] - start[0],
    height: height
  }, {
    x: params.coordSys.x,
    y: params.coordSys.y,
    width: params.coordSys.width,
    height: params.coordSys.height
  });
  return rectShape && {
    type: 'rect',
    shape: rectShape,
    style: api.style()
  };
}
option = {
  //鼠标提示
  tooltip: {
    formatter: function (params) {
      var duration = params.value[3];
      var hours = Math.floor(duration / (60 * 60 * 1000));
      var minutes = Math.floor((duration % (60 * 60 * 1000)) / (60 * 1000));
      var seconds = Math.floor((duration % (60 * 1000)) / 1000);
      var milliseconds = duration % 1000;
      var formattedDuration = '';
      if (hours > 0) {
        formattedDuration += hours + 'h ';
      }
      if (minutes > 0) {
        formattedDuration += minutes + 'm ';
      }
      if (seconds > 0) {
        formattedDuration += seconds + 's ';
      }
      if (milliseconds > 0) {
        formattedDuration += milliseconds + 'ms ';
      }
      return params.marker + params.name + ': ' + formattedDuration.trim();
    }
  },
  //标题
  title: {
    text: '甘特图-机器运行状态',
    left: 'center'
  },
  legend: {
    show : true,
    data: ['运行', '故障', '等待'],
    right: 80,
    top: 50,
    left:'center'
  },
  //缩放
  dataZoom: [{
    type: 'slider',
    show : false,
    filterMode: 'weakFilter',
    showDataShadow: false,
    top: 550,
    height: 10,
    borderColor: 'transparent',
    backgroundColor: '#e2e2e2',
    handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7v-1.2h6.6z M13.3,22H6.7v-1.2h6.6z M13.3,19.6H6.7v-1.2h6.6z', //jshint ignore:line
    handleSize: 20,
    handleStyle: {
      shadowBlur: 6,
      shadowOffsetX: 1,
      shadowOffsetY: 2,
      shadowColor: '#aaa'
    },
    labelFormatter: '',
    start: 0,
    end: 70,
  }, {
    type: 'inside',
    filterMode: 'weakFilter'

  }],
  grid: {
    top: 100,
    height: 350
  },
  xAxis: {
    min: startTime,
    max: startTime + 24 * 60 * 60 * 1000 - 1,
    scale: true,
    axisLabel: {
      formatter: function (val) {
        var date = new Date(val);
        var hours = date.getHours().toString().padStart(2, '0');
        var minutes = date.getMinutes().toString().padStart(2, '0');
        return hours + ':' + minutes;
      }
    }
  },
  yAxis: {
    data: categories
  },

  series: [{
    name:'运行',
    type: 'custom',
    renderItem: renderItem,
    itemStyle: {
      opacity: 0.8,
      color: "#75d874"
    },
    encode: {
      x: [1, 2],
      y: 0
    },
    data: data
  },
    {
      name:'故障',
      type: 'custom',
      renderItem: renderItem,
      itemStyle: {
        opacity: 0.8,
        normal: {
          color: "#bd6d6c",
          borderWidth: 2
        }
      },
      encode: {
        x: [1, 2],
        y: 0
      },
      data: data
    },
    {
      name:'等待',
      type: 'custom',
      renderItem: renderItem,
      itemStyle: {
        opacity: 0.8,
        normal: {
          color: "#e0bc78",
          borderWidth: 2
        }
      },
      encode: {
        x: [1, 2],
        y: 0
      },
      data: data
    },
    {
      name:'备用',
      type: 'custom',
      renderItem: renderItem,
      itemStyle: {
        opacity: 0.8,
        normal: {
          color: "#7b9ce1",
          borderWidth: 2
        }
      },
      encode: {
        x: [1, 2],
        y: 0
      },
      data: data
    }
  ]
};
