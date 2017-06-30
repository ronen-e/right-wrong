function main() {
  var manager = new SlideManager({
    slides: $('section'),
    buttons: '.buttons',
    enableLoop: false,
    onmove: function onmove(event, index, oldIndex) {
      manager.slides.hide();
      manager.slides.eq(index).show();
    },
    onstart: function onstart(event, currentIndex) {
      manager.move(currentIndex);
    }
  });
  
  $('.questions').on('click', '.correct', function() {
    $(this).css({ color: 'green' });
  });
  
  manager.start();
}

const EVENTS = {
  click: 'click'
}

class SlideManager {
  constructor(options = {}) {
    this.pubsub = $({});

    // bind methods
    bindClassMethods(this.constructor.prototype, this);
    
    return this.init(options);
  }
  init(options) {
    // configuration
    Object.assign(this, this.defaults, options);
    
    // event handlers
    this.addEventHandlers();
    
    if (this.onstart) {
      this.$on('start', this.onstart);
    }
    if (this.onmove) {
      this.$on('move', this.onmove);
    }
    
    return this;
  }
  start() {
    if (this.current < 0) {
      this.current = 0;
    }
    this.$emit('start', [this.current]);
  }
  addEventHandlers() {
    // button event handlers
    if (this.buttons !== null) {
      let { click } = this.events;
      let { nextSel, prevSel, showAllSel, next, prev, showAll } = this;
      let buttons = $(this.buttons);

      buttons.find(nextSel).on(click, next);
      buttons.find(prevSel).on(click, prev);
      buttons.find(showAllSel).on(click, showAll);
     
      this.$on('destroy', () => {
        buttons.find(nextSel).off(click, next);
        buttons.find(prevSel).off(click, prev);
        buttons.find(showAllSel).off(click, showAll);
      });
    }    
  }
  move(index) {
    var len = this.slides.length;

    if (len === 0) {
      return;
    }
    
    if (index >= len) {
      index = 0;
    }
    if (index < 0) {
      index = len - 1;
    }
  
    var oldIndex = index;
    this.current = index;
    this.isShowAll = false;
    this.$emit('move', [index, oldIndex]);
    
    return this;
  }
  next() {
    var idx = this.current + 1;
    if (this.isMoveAllowed(idx)){
      this.move(idx);
    }
    
    return this;
  }
  prev() {
    var idx = this.current - 1;
    if (this.isMoveAllowed(idx)){
      this.move(idx);
    }
    
    return this;
  }
  showAll() {
    if (this.isShowAll) {
      this.move(this.current);
    } else {
      this.slides.show();
      this.isShowAll = true;
    }
    return this;
  }
  
  isMoveAllowed(index) {
    if (this.enableLoop) {
      return true;
    }
    if (index >= 0 && index < this.slides.length) {
      return true;
    }
    
    return false;
  }
  
  destroy() {
    Object.assign(this, this.defaults);
    this.$emit('destroy');
  }
  $emit(...args){
    this.pubsub.trigger(...args);
  }
  $on(...args) {
    this.pubsub.on(...args);
  }
}

SlideManager.prototype.defaults = {
  slides: [],
  buttons: null,
  current: -1,
  isShowAll: false,
  enableLoop: false,
  events: EVENTS,
  nextSel: '.next',
  prevSel: '.prev',
  showAllSel: '.showAll',
  onstart: null,
  onmove: null
}

function bind(obj, methods) {
  for (let m of methods)
    obj[m] = obj[m].bind(obj);
}

function bindClassMethods(prototype, instance) {
  var methods = Object.getOwnPropertyNames(prototype)
		.filter(k => typeof prototype[k] == 'function')
		.filter(k => k != 'constructor');

  bind(instance, methods);
}

main();
