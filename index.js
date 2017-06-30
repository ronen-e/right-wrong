function main() {
  var manager = new SlideManager({
    slides: $('section'),
    buttons: '.buttons',
    enableLoop: false,
  });
}

const EVENTS = {
  click: 'click'
}

class SlideManager {
  constructor(options = {}) {
    this.pubsub = $({});

    // bind methods
    bindClassMethods(this.constructor.prototype, this);
    
    this.init(options);
  }
  init(options) {
    // configuration
    Object.assign(this, this.defaults, options);
    
    // event handlers
    this.addEventHandlers();
    
    // show 1st slide
    this.next();
    
    return this;
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
     
      this.pubsub.on('destroy', () => {
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

    this.current = index;

    this.slides.hide();
    this.slides.eq(this.current).show();

    this.isShowAll = false;
    
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
    this.pubsub.trigger('destroy');
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
  showAllSel: '.showAll'
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
