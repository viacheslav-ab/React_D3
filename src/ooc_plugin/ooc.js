import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './ooc.css';
import Databox from './components/databox';
import Scatter from './components/scatter';
import Histogramm from './components/histogram';
import Graph from './components/graph';
import Donut from './components/donut';
import Progressbar from './components/progressbar';
import _ from 'underscore';
import $ from 'jquery';
import worker_script from './ooc/ooc_worker';
const { dualPivotSort } = require('./ooc/ooc_module');
const { build_test_data } = require('./ooc/testset');
const { conf2ooc_calculation, ooc_calculation } = require('./ooc/ooc_test');
const { parseNumArray } = require('./ooc/parse_num_array');

class Ooc extends Component {
  state = {
    viewhistogram: false,
    enabled: false,
    progress: {
      show: false,
      value: 0.0,
      status: ""
    },
    data: {
      learn: [],
      window: [],
      learn_histogram: [],
      window_histogram: [],
      icdf_learn: [],
      icdf_window: [],
      quants: [],
      layers: [],
      ooc: []
    }
  }

  constructor(props) {
    super(props);
    this.parseText = this.parseText.bind(this);
    this.get_no = this.get_no.bind(this);
    this.get_icdf_no = this.get_icdf_no.bind(this);
    this.toggleChart = this.toggleChart.bind(this);
    this.buildDefaultData = this.buildDefaultData.bind(this);
    this.handleInitLHistogram = this.handleInitLHistogram.bind(this);
    this.handleInitWHistogram = this.handleInitWHistogram.bind(this);
    this.handleRefDataChanged = this.handleRefDataChanged.bind(this);
    this.handleTestDataChanged = this.handleTestDataChanged.bind(this);
    this.handleSelectScatterLSample = this.handleSelectScatterLSample.bind(this);
    this.handleSelectScatterWSample = this.handleSelectScatterWSample.bind(this);
    this.handleSelectHistogramLBar = this.handleSelectHistogramLBar.bind(this);
    this.handleSelectHistogramWBar = this.handleSelectHistogramWBar.bind(this);
    this.handleSelectGraphLSample = this.handleSelectGraphLSample.bind(this);
    this.handleSelectGraphWSample = this.handleSelectGraphWSample.bind(this);
    this.handleSelectGraphLayer = this.handleSelectGraphLayer.bind(this);
    this.handleGraphLayerHighlighted = this.handleGraphLayerHighlighted.bind(this);
    this.handleSelectDonut = this.handleSelectDonut.bind(this);
    this.handleProgressInfo = this.handleProgressInfo.bind(this);
    this.showProgressInfo = this.showProgressInfo.bind(this);
    this.handleCalculation = this.handleCalculation.bind(this);
  }

  parseText(strText) {

    var set = parseNumArray(strText.replace(/\n/g, '\n'));
    if (set.length === 0) {
      return null;
    }
  
    for (let i = 0; i < set.length; ++i) {
      if (isNaN(set[i])) {
        return -1;
      }
    }
    return set;
  }

  buildDefaultData(datacount, samples, confidences) {
    var learn, window, icdf_learn, icdf_window;
    var quants, layers, ooc;
    [learn, window, icdf_learn, icdf_window] = build_test_data(datacount);
    [icdf_learn, icdf_window, quants, layers, ooc] = ooc_calculation(learn, window, samples, confidences);

    this.setState({
      ...this.state.viewhistogram,
      ...this.state.enabled,
      ...this.state.progress,
      data: {
        ...this.state.data,
        learn: learn,
        window: window,
        icdf_learn: icdf_learn,
        icdf_window: icdf_window,
        quants: quants,
        layers: layers,
        ooc: ooc
      }
    })
  }

  get_no(data, no) {
    if (!data.length) {
      return -1;
    }

    var idx = -1;
    var sorted_data = dualPivotSort(data.slice());
    var value = sorted_data[no];
    idx = _.indexOf(data, value);

    return idx;
  }

  get_icdf_no(data, no) {
    if (!data.length) {
        return -1;
    }

    var idx = -1;
    var value = data[no];
    var sorted_data = dualPivotSort(data.slice());
    idx = _.indexOf(sorted_data, value, true);

    return idx;
  }

  handleInitLHistogram = (data) => {
    if (data === null || !data.length) return;

    // make histogram data
    var histogram = new Array(data.length);
    for (let i = 0; i < data.length; ++i) {
        histogram[i] = {min: Math.min(...data[i]), max: Math.max(...data[i])};
    }

    // check if it is the same as the state's histogram data
    var issame = true;
    if (histogram.length !== this.state.data.learn_histogram.length) {
      issame = false;
    } else {
      for (let i = 0; i < histogram.length; i++) {
        if (histogram[i].min !== this.state.data.learn_histogram[i].min ||
            histogram[i].max !== this.state.data.learn_histogram[i].max) {
              issame = false;
              break;
        }
      }
    }

    if (issame) return;
    // update the state
    this.setState({
      ...this.state.viewhistogram,
      ...this.state.enabled,
      ...this.state.progress,
      data: {
        ...this.state.data,
        learn_histogram: histogram
      }
    });
  }

  handleInitWHistogram = (data) => {
    if (data === null || !data.length) return;

    // make histogram data
    var histogram = new Array(data.length);
    for (let i = 0; i < data.length; ++i) {
        histogram[i] = {min: Math.min(...data[i]), max: Math.max(...data[i])};
    }

    // check if it is the same as the state's histogram data
    var issame = true;
    if (histogram.length !== this.state.data.window_histogram.length) {
      issame = false;
    } else {
      for (let i = 0; i < histogram.length; i++) {
        if (histogram[i].min !== this.state.data.window_histogram[i].min ||
            histogram[i].max !== this.state.data.window_histogram[i].max) {
            issame = false;
            break;
        }
      }
    }

    if (issame) return;
    // update the state
    this.setState({
      ...this.state.viewhistogram,
      ...this.state.enabled,
      ...this.state.progress,
      data: {
        ...this.state.data,
        window_histogram: histogram
      }
    })
  }

  handleRefDataChanged(value) {
    if (value && !this.state.enabled) {
      this.setState({
        ...this.state.viewhistogram,
        ...this.state.progress,
        enabled: true,
        data: {
          learn: [],
          icdf_learn: [],
          learn_histogram: [],
          window: [],
          icdf_window: [],
          window_histogram: [],
          quants: [],
          layers: [],
          ooc: []
        }
      })
      this.state.data.learn =[];
      this.state.data.icdf_learn = [];
      this.state.data.learn_histogram = [];
      this.state.data.window = [];
      this.state.data.icdf_window = [];
      this.state.data.window_histogram = [];
      this.state.data.quants = [];
      this.state.data.layers = [];
      this.state.data.ooc = [];
      this.state.enabled = true;
    }

    var learn = this.parseText(value);
    if (learn === -1) return;

    if (learn === null) {
      this.setState({
        ...this.state.viewhistogram,
        ...this.state.enabled,
        ...this.state.progress,
        data: {
          ...this.state.data,
          learn: [],
          icdf_learn: [],
          learn_histogram: [],
          quants: [],
          layers: [],
          ooc: []
        }
      })
      this.state.data.learn =[];
      this.state.data.icdf_learn = [];
      this.state.data.learn_histogram = [];
      this.state.data.quants = [];
      this.state.data.layers = [];
      this.state.data.ooc = [];

      return;
    }

    // check if ref data
    var same = true;
    if (!this.state.data.learn.length) {
      same = false;
    } else {
      if (this.state.data.learn.length !== learn.length) {
        same = false;
      }
      for (let i = 0; i < learn.length; ++i) {
        if (learn[i] !== this.state.data.learn[i]) {
          same = false;
          break;
        }
      }
    }
    if (same) return;

    // if these are different, recalculate!
    var test = this.state.data.window;
    var windowsize = test.length;
    if (learn.length < 5 || windowsize <= 0) {
      this.setState({
        ...this.state.viewhistogram,
        ...this.state.enabled,
        ...this.state.progress,
        data: {
          ...this.state.data,
          learn: learn,
        }
      })
      this.state.data.learn = learn;
      return;
    }

    var samples = this.props.samples;
    var confidences = this.props.confidences;

    var handle = this.handleProgressInfo;
    if (window.Worker) {
      var myWorker = new Worker(worker_script);

      var handleProgress = this.handleProgressInfo;
      var handleCalculation = this.handleCalculation;
      var handleShowProgress = this.showProgressInfo;
      var msg = {type: 0, data: {learn: learn, test: test, samples: samples, confidences: confidences}};
      myWorker.postMessage(msg);

      handleShowProgress(true);

      myWorker.onmessage = function(msg) {
        if (msg.data.type === 1) {
          handleProgress(msg.data.result);
        }
        if (msg.data.type === 2) {
          console.log("calculation result");
          icdf_learn = msg.data.result.icdf_learn;
          icdf_window = msg.data.result.icdf_window;
          quants = msg.data.result.quants;
          layers = msg.data.result.layers;
          ooc = msg.data.result.ooc;

          handleCalculation(learn, test, icdf_learn, icdf_window, quants, layers, ooc);
          handleShowProgress(false);
        }
      }
    } else {
      var icdf_learn, icdf_window;
      var quants, layers, ooc;
      [icdf_learn, icdf_window, quants, layers, ooc] = ooc_calculation(learn, test, samples, confidences, this.handleProgressInfo);
      
      this.setState({
        ...this.state.viewhistogram,
        ...this.state.enabled,
        ...this.state.progress,
        data: {
          ...this.state.data,
          learn: learn,
          window: test,
          icdf_learn: icdf_learn,
          icdf_window: icdf_window,
          quants: quants,
          layers: layers,
          ooc: ooc
        }
      })
      this.state.data.learn = learn;
      this.state.data.window = test;
      this.state.icdf_learn = icdf_learn;
      this.state.icdf_window = icdf_window;
      this.state.data.quants = quants;
      this.state.data.layers = layers;
      this.state.data.ooc = ooc;
    }
  }

  handleTestDataChanged(value) {
    if (value && !this.state.enabled) {
      this.setState({
        ...this.state.viewhistogram,
        ...this.state.progress,
        enabled: true,
        data: {
          ...this.state.data,
          learn: [],
          icdf_learn: [],
          learn_histogram: [],
          window: [],
          icdf_window: [],
          window_histogram: [],
          quants: [],
          layers: [],
          ooc: []
        }
      })
      this.state.data.learn =[];
      this.state.data.icdf_learn = [];
      this.state.data.learn_histogram = [];
      this.state.data.window = [];
      this.state.data.icdf_window = [];
      this.state.data.window_histogram = [];
      this.state.data.quants = [];
      this.state.data.layers = [];
      this.state.data.ooc = [];
      this.state.enabled = true;
    }

    var test = this.parseText(value);
    if (test === -1) return;

    if (test === null) {
      this.setState({
        ...this.state.viewhistogram,
        ...this.state.enabled,
        ...this.state.progress,
        data: {
          ...this.state.data,
          window: [],
          icdf_window: [],
          window_histogram: [],
          quants: [],
          layers: [],
          ooc: []
        }
      })
      this.state.data.window = [];
      this.state.data.icdf_window = [];
      this.state.data.window_histogram = [];
      this.state.data.quants = [];
      this.state.data.layers = [];
      this.state.data.ooc = [];
      return;
    }

    // check if window length
    if (this.state.data.window.length === test.length) {
      // check if window data
      var same = true;
      if (!this.state.data.window.length) {
        same = false;
      }
      for (let i = 0; i < test.length; ++i) {
        if (test[i] !== this.state.data.window[i]) {
          same = false;
          break;
        }
      }
      if (same) return;

      if (!this.state.data.learn.length) {
        this.setState({
          ...this.state.viewhistogram,
          ...this.state.enabled,
          ...this.state.progress,
          data: {
            ...this.state.data,
            window: test
          }
        })
        this.state.data.window = test;
        return;
      }

      let icdf_window, layers, ooc;
      let quants = this.state.data.quants;
      [icdf_window, layers, ooc] = conf2ooc_calculation(quants, test);
      this.setState({
        ...this.state.viewhistogram,
        ...this.state.enabled,
        ...this.state.progress,
        data: {
          ...this.state.data,
          window: test,
          icdf_window: icdf_window,
          layers: layers,
          ooc: ooc
        }
      })
      this.state.data.window = test;
      this.state.data.icdf_window = icdf_window;
      this.state.data.layers = layers;
      this.state.data.ooc = ooc;
      return;
    }

    // if these are different, recalculate!
    var learn = this.state.data.learn;
    if (learn.length <= 0) {
      this.setState({
        ...this.state.viewhistogram,
        ...this.state.enabled,
        ...this.state.progress,
        data: {
          ...this.state.data,
          window: test,
        }
      })
      this.state.data.window = test;
      return;
    }

    var samples = this.props.samples;
    var confidences = this.props.confidences;

    var handle = this.handleProgressInfo;
    if (window.Worker) {
      var myWorker = new Worker(worker_script);

      var handleProgress = this.handleProgressInfo;
      var handleCalculation = this.handleCalculation;
      var handleShowProgress = this.showProgressInfo;
      var msg = {type: 0, data: {learn: learn, test: test, samples: samples, confidences: confidences}};
      myWorker.postMessage(msg);

      handleShowProgress(true);

      myWorker.onmessage = function(msg) {
        if (msg.data.type === 1) {
          handleProgress(msg.data.result);
        }
        if (msg.data.type === 2) {
          icdf_learn = msg.data.result.icdf_learn;
          icdf_window = msg.data.result.icdf_window;
          quants = msg.data.result.quants;
          layers = msg.data.result.layers;
          ooc = msg.data.result.ooc;

          handleCalculation(learn, test, icdf_learn, icdf_window, quants, layers, ooc);
          handleShowProgress(false);
        }
      }
    } else {
      console.log("web worker doesn't supported in your browser");
      var icdf_learn, icdf_window;
      var quants, layers, ooc;

      [icdf_learn, icdf_window, quants, layers, ooc] = ooc_calculation(learn, test, samples, confidences, this.handleProgressInfo);
      this.setState({
        ...this.state.viewhistogram,
        ...this.state.enabled,
        ...this.state.progress,
        data: {
          ...this.state.data,
          learn: learn,
          window: test,
          icdf_learn: icdf_learn,
          icdf_window: icdf_window,
          quants: quants,
          layers: layers,
          ooc: ooc
        }
      })
      this.state.data.learn = learn;
      this.state.data.window = test;
      this.state.data.icdf_learn = icdf_learn;
      this.state.data.icdf_window = icdf_window;
      this.state.data.quants = quants;
      this.state.data.layers = layers;
      this.state.data.ooc = ooc;
    }
  }

  handleCalculation = (learn, test, icdf_learn, icdf_window, quants, layers, ooc) => {
    this.setState({
      ...this.state.viewhistogram,
      ...this.state.enabled,
      ...this.state.progress,
      data: {
        ...this.state.data,
        learn: learn,
        window: test,
        icdf_learn: icdf_learn,
        icdf_window: icdf_window,
        quants: quants,
        layers: layers,
        ooc: ooc
      }
    })
    this.state.data.learn = learn;
    this.state.data.window = test;
    this.state.data.icdf_learn = icdf_learn;
    this.state.data.icdf_window = icdf_window;
    this.state.data.quants = quants;
    this.state.data.layers = layers;
    this.state.data.ooc = ooc;
  }

  handleSelectScatterLSample = (no, selected) => {
    var learn_no = +no;
    if (learn_no === -1) return;
    var sel = selected;

    var icdf_learn_no = this.get_icdf_no(this.state.data.learn, learn_no);

    this.refs.graph.highlight_lsample(icdf_learn_no, sel);
  }

  handleSelectScatterWSample = (no, selected) => {
    var window_no = +no;
    if (window_no === -1) return;
    var sel = selected;

    var icdf_window_no = this.get_icdf_no(this.state.data.window, window_no);
    this.refs.graph.highlight_wsample(icdf_window_no, sel);
  }

  handleSelectHistogramLBar = (no, selected) => {
    var bar_no = +no;
    if (bar_no === -1) return;
    var sel = selected;

    this.refs.graph.highlight_lhistogram_samples(bar_no, sel);
  }

  handleSelectHistogramWBar = (no, selected) => {
    var bar_no = +no;
    if (bar_no === -1) return;
    var sel = selected;

    this.refs.graph.highlight_whistogram_samples(bar_no, sel);
  }

  handleSelectGraphLSample = (no, selected) => {
    var icdf_no = +no;
    if (icdf_no === -1) return;
    var sel = selected;

    var learn_no = this.get_no(this.state.data.learn, icdf_no);
    this.refs.learn_scatter.highlight_sample(learn_no, sel);
  }

  handleSelectGraphWSample = (no, selected) => {
    var icdf_no = +no;
    if (icdf_no === -1) return;
    var sel = selected;

    var window_no = this.get_no(this.state.data.window, icdf_no);
    this.refs.window_scatter.highlight_sample(window_no, sel);
  }

  handleSelectGraphLayer = (id, selected, outsamples = null) => {
    var sel = selected;

    if (outsamples) {
      var samples = outsamples.slice();
      for (let i = 0; i < samples.length; ++i) {
        samples[i] = this.get_no(this.state.data.window, samples[i]);
      }
      this.refs.window_scatter.highlight_outsamples(samples, sel);
    } else {
      this.refs.window_scatter.highlight_outsamples(null, false);
    }

    var donut_no = parseInt(id.substring(5), 10);
    if (isNaN(donut_no) === true) return;

    if (donut_no === 0) {
      this.refs.first_donut.highlight(sel);
      return;
    }
    if (donut_no === 1) {
      this.refs.second_donut.highlight(sel);
      return;
    }
    if (donut_no === 2) {
      this.refs.third_donut.highlight(sel);
      return;
    }
    if (donut_no === 3) {
      this.refs.fourth_donut.highlight(sel);
      return;
    }
  }

  handleGraphLayerHighlighted = (outsamples, selected) => {
    if (outsamples === null) {
      this.refs.window_scatter.highlight_outsamples(null, false);
      return;
    }

    if (outsamples.length <= 0) {
      return;
    }
     
    var samples = outsamples.slice();
    for (let i = 0; i < samples.length; ++i) {
      samples[i] = this.get_no(this.state.data.window, samples[i]);
    }
    this.refs.window_scatter.highlight_outsamples(samples, true);
  }


  handleSelectDonut = (donutname, selected) => {
    function strcmp(str1, str2) {
      if (str1 < str2) return -1;
      if (str1 > str2) return 1;
      return 0;
    }

    var sel = selected;
    var name = donutname;

    if (!strcmp(name, 'first_donut')) {
      this.refs.graph.highlight_layer(0, sel);
      return;
    }
    if (!strcmp(name, 'second_donut')) {
      this.refs.graph.highlight_layer(1, sel);
      return;
    }
    if (!strcmp(name, 'third_donut')) {
      this.refs.graph.highlight_layer(2, sel);
      return;
    }
    if (!strcmp(name, 'fourth_donut')) {
      this.refs.graph.highlight_layer(3, sel);
      return;
    }
  }

  handleProgressInfo(progress) {
    var progressInfo = progress;
    progressInfo.progress = progressInfo.progress * 100;
    // console.log("Progress(Msg) value=" + progressInfo.progress + ", status=" + progressInfo.status);

    this.setState({
      ...this.state.viewhistogram,
      ...this.state.enabled,
      progress: {
        ...this.state.progress,
        value: progressInfo.progress,
        status: progressInfo.status
      },
      ...this.state.data
    });
    
    // console.log("Progress(State) value=" + this.state.progress.value + ", status=" + this.state.progress.status);
  }

  showProgressInfo(show) {
    var doshow = show;

    this.setState({
      ...this.state.viewhistogram,
      ...this.state.enabled,
      progress: {
        ...this.state.progress,
        show: doshow
      },
      ...this.state.data
    })
  }

  toggleChart() {
    if(this.state.viewhistogram) {
      $("#scatterArea").removeClass("hidden_css");
      $("#histogramArea").addClass("hidden_css");
      $("#darstellungalsHist").removeClass("hidden_css");
      $("#darstellungalsPunk").addClass("hidden_css");
    }
    else {
      $("#histogramArea").removeClass("hidden_css");
      $("#scatterArea").addClass("hidden_css");
      $("#darstellungalsHist").addClass("hidden_css");
      $("#darstellungalsPunk").removeClass("hidden_css");
    }
    this.setState({
      viewhistogram: !this.state.viewhistogram
    });
  }

  componentDidMount() {
    // construct default data
    var datacount = this.props.test_sample_count;
    var samples = this.props.samples;
    var confidences = this.props.confidences;
    this.buildDefaultData(datacount, samples, confidences);
  }

  render() {

    return (
      <div id="signalEmpoweringSignificancePlaceholder">
        <div className="title">
          <div id="signifikanzberechne">Signifikanz berechnen</div>
          <div id="referenzdatensatzun">Referenzdatensatz und Testdatensatz einfügen, um den Signifikanztest zu starten.</div>
        </div>
        
        <Progressbar name={"progressbar"}
          ref="progressbar"
          progress={this.state.progress.value}
          status={this.state.progress.status}
          open={this.state.progress.show}>
        </Progressbar>

        {/* data input area - textarea */}
        <div className="area" id="dataArea">
          <div className="left-box">
            <div id="referenz">
              Referenz
            </div>
            <div className="datatextarea">
              <Databox name={"fgehierdeineRefe"} id={"reference"}
                placeholder={"Füge hier deine Referenzdaten ein."}
                onDataChanged={this.handleRefDataChanged}
                enabled={this.state.enabled}>
              </Databox>
            </div>
          </div>

          <div className="right-box">
            <div id="referenz">
              Test
            </div>
            <div className="datatextarea">
              <Databox name={"fgehierdeineRefe"} id={"test"}
                placeholder={"Füge hier deine Referenzdaten ein."}
                onDataChanged={this.handleTestDataChanged}
                enabled={this.state.enabled}>
              </Databox>
            </div>
          </div>
        </div>

        {/* data plot area - chart */}
        <div className="area" id="switchbuttons">
          <div id="darstellungalsHist">
            <a onClick={this.toggleChart}>Darstellung als Histogramm</a>
          </div>
          <div id="darstellungalsPunk" className="hidden_css">
            <a onClick={this.toggleChart}>Darstellung als Punktdiagramm</a>
          </div>
        </div>

        <div className="area" id="scatterArea">
          <div className="left-box leftmargin">
            <Scatter name="left_dotchart" width={400} height={346} 
              ref="learn_scatter"
              discolor={this.props.scatter_disable_color}
              color={this.props.learn_color}
              radius={this.props.sample_radius}
              hlradius={this.props.highlight_sample_radius}
              data={this.state.data.learn} 
              onSelected={this.handleSelectScatterLSample}
              enabled={this.state.enabled}>
            </Scatter>
          </div>
          <div className="right-box">
            <Scatter name="right_dotchart" width={400} height={346}
              ref="window_scatter"
              discolor={this.props.scatter_disable_color}
              color={this.props.window_color}
              outcolor={this.props.graph_layerout_color}
              radius={this.props.sample_radius}
              hlradius={this.props.highlight_sample_radius}
              data={this.state.data.window} 
              onSelected={this.handleSelectScatterWSample}
              enabled={this.state.enabled}>
            </Scatter>
          </div>
        </div>

        <div className="area hidden_css" id="histogramArea">
          <div className="left-box leftmargin">
            <Histogramm name="left_barchart" width={400} height={346}
              ref="learn_histogram"
              discolor={this.props.histogram_disable_color}
              color={this.props.learn_color}
              hlcolor={this.props.histogram_highlight_color}
              data={this.state.data.learn}
              onInit={this.handleInitLHistogram}
              onSelected={this.handleSelectHistogramLBar}
              enabled={this.state.enabled}>
            </Histogramm>
          </div>
          <div className="right-box">
            <Histogramm name="right_barchart" width={400} height={346}
              ref="window_histogram"
              discolor={this.props.histogram_disable_color}
              color={this.props.window_color}
              hlcolor={this.props.histogram_highlight_color}
              data={this.state.data.window}
              onInit={this.handleInitWHistogram}
              onSelected={this.handleSelectHistogramWBar}
              enabled={this.state.enabled}>
            </Histogramm>
          </div>
        </div>

        {/* calculation plot area - graph */}
        <div className="area" id="graphArea">
          <Graph name="graph" width={834} height={401}
            ref="graph"
            learncolor={this.props.learn_color}
            windowcolor={this.props.window_color}
            disablecolor={this.props.scatter_disable_color}
            sampleradius={this.props.sample_radius}
            hlsampleradius={this.props.highlight_sample_radius}
            layerstyle={this.props.graph_layerstyle}
            hllayerstyle={this.props.graph_highlight_layerstyle}
            layeroutcolor={this.props.graph_layerout_color}
            learndata={this.state.data.icdf_learn}
            windowdata={this.state.data.icdf_window}
            lhistogram={this.state.data.learn_histogram}
            whistogram={this.state.data.window_histogram}
            layerdata={this.state.data.layers}
            onLSampleSelected={this.handleSelectGraphLSample}
            onWSampleSelected={this.handleSelectGraphWSample}
            onLayerSelected={this.handleSelectGraphLayer}
            onLayerHighlighted={this.handleGraphLayerHighlighted}
            enabled={this.state.enabled}>
          </Graph>
        </div>

        {/* calculation plot area - donut */}
        <div className="area" id="donutArea">
          <div className="area" id="donut_title">
            <div id="dieTestwerteuntersCopy">
              Die Testwerte unterscheiden sich von den Referenzwerten zu …
            </div>
          </div>

          <div className="area" id="donut_boxes">
            <div className="donutbox combinedShapeCopy">
              <Donut name="first_donut" width={128} height={128} 
                ref="first_donut"
                backcolor={this.props.donut_backcolor}
                forecolor={this.props.donut_forecolor}
                disbackcolor={this.props.donut_disable_backcolor}
                disforecolor={this.props.donut_disable_forecolor}
                hlbackcolor={this.props.donut_highlight_backcolor}
                hlforecolor={this.props.donut_highlight_forecolor}
                progress={this.state.data.ooc[0]}
                onSelected={this.handleSelectDonut}
                enabled={this.state.enabled}>
              </Donut>
                <div id="tendenziell">tendenziell</div>
            </div>
            <div className="donutbox combinedShapeCopy">
              <Donut name="second_donut" width={128} height={128}
                ref="second_donut"
                backcolor={this.props.donut_backcolor}
                forecolor={this.props.donut_forecolor}
                disbackcolor={this.props.donut_disable_backcolor}
                disforecolor={this.props.donut_disable_forecolor}
                hlbackcolor={this.props.donut_highlight_backcolor}
                hlforecolor={this.props.donut_highlight_forecolor}
                progress={this.state.data.ooc[1]}
                onSelected={this.handleSelectDonut}
                enabled={this.state.enabled}>
              </Donut>
              <div id="signifikant">signifikant</div>
            </div>
            <div className="donutbox combinedShapeCopy">
              <Donut name="third_donut" width={128} height={128}
                ref="third_donut"
                backcolor={this.props.donut_backcolor}
                forecolor={this.props.donut_forecolor}
                disbackcolor={this.props.donut_disable_backcolor}
                disforecolor={this.props.donut_disable_forecolor}
                hlbackcolor={this.props.donut_highlight_backcolor}
                hlforecolor={this.props.donut_highlight_forecolor}
                progress={this.state.data.ooc[2]}
                onSelected={this.handleSelectDonut}
                enabled={this.state.enabled}>
              </Donut>
              <div id="sehrsignifikant">sehr signifikant</div>
            </div>
            <div className="donutbox combinedShapeCopy">
              <Donut name="fourth_donut" width={128} height={128}
                ref="fourth_donut"
                backcolor={this.props.donut_backcolor}
                forecolor={this.props.donut_forecolor}
                disbackcolor={this.props.donut_disable_backcolor}
                disforecolor={this.props.donut_disable_forecolor}
                hlbackcolor={this.props.donut_highlight_backcolor}
                hlforecolor={this.props.donut_highlight_forecolor}
                progress={this.state.data.ooc[3]}
                onSelected={this.handleSelectDonut}
                enabled={this.state.enabled}>
              </Donut>
              <div id="hochsignifikant">hoch signifikant</div>
            </div>
          </div>
        </div>

      </div>
    );
  }
}

Ooc.defaultProps = {
  name: "ooc_package",
  width: 1920,
  height: 1080,
  margin: {top: 20, right: 20, bottom: 30, left: 40},
  test_sample_count: 80,
  samples: [10000, 10000, 10000, 10000],
  confidences: [0.80, 0.90, 0.98, 0.995],
  learn_color: "#333333",
  window_color: "#00c6ff",
  sample_radius: 2.5,
  highlight_sample_radius: 6.5,
  scatter_disable_color: "#979797",
  histogram_disable_color: "#c6c6c6",
  histogram_highlight_color: "#d3d3d3",
  donut_disable_backcolor: "#e5e4e4",
  donut_disable_forecolor: "#c6c6c6",
  donut_backcolor: "#C2C2C2",
  donut_forecolor: "#474747",
  donut_highlight_backcolor: "#50e3c2",
  donut_highlight_forecolor: "#ff2d80",
  graph_layerstyle: {strokecolor: "#032a3d", strokewidth: 1, fillcolor: "#e6f4e6", opacity: 0.2},
  graph_highlight_layerstyle: {strokecolor: "#33cc33", strokewidth: 2, fillcolor: "#c6d4c6", opacity: 0.7},
  graph_layerout_color: "#ff2d80"
};

Ooc.propsType = {
  name:     PropTypes.string.isRequired,
  width:    PropTypes.number,
  height:   PropTypes.number,
  margin:   PropTypes.object,
  test_sample_count: PropTypes.number,
  samples:  PropTypes.array,
  confidences: PropTypes.array,
  learn_color: PropTypes.string,
  window_color: PropTypes.string,
  sample_radius: PropTypes.number,
  highlight_sample_radius: PropTypes.number,
  scatter_disable_color: PropTypes.string,
  histogram_disable_color: PropTypes.string,
  histogram_highlight_color: PropTypes.string,
  donut_disable_backcolor: PropTypes.string,
  donut_disable_forecolor: PropTypes.string,
  donut_backcolor: PropTypes.string,
  donut_forecolor: PropTypes.string,
  donut_highlight_backcolor: PropTypes.string,
  donut_highlight_forecolor: PropTypes.string,
  graph_layerout_color: PropTypes.string,
  graph_layerstyle: PropTypes.object,
  graph_highlight_layerstyle: PropTypes.object
};


export default Ooc;
