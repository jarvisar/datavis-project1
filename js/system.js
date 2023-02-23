class System {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _callback) {
    // Configuration object with defaults
    // Important: depending on your vis and the type of interactivity you need
    // you might want to use getter and setter methods for individual attributes
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 600,
      containerHeight: _config.containerHeight || 400,
      margin: _config.margin || {top: 25, right: 20, bottom: 20, left: 35}
    }
    this.data = _data;
    this.callback = _callback;
    this.selectedValues = [];
    this.brushEnabled = false;
    this.initVis();
  }
  
  initVis() {

    let vis = this;

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
 
    
    vis.updateVis();
  }

  updateVis(brushEnabled) {
    let vis = this;

    vis.renderVis(brushEnabled)
  }

  renderVis(brushEnabled) {
    let vis = this;

    
      
  }

}

