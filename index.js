function main() {
  var answers = {
    correct: 0,
    wrong: 0
  };
  
  // highlight click on correct answer
  fx.highlight({
    'correct': 'green',
    'wrong': 'red'
  });

  // create and init slider
  var manager = new MySlideManager().start();
  
  fx.on('correct', (event) => fx.updateResult(event.type, answers));
  fx.on('wrong', (event) => fx.updateResult(event.type, answers));
}

const EVENTS = {
  click: 'click'
}
let $events = $({});
let fx = Object.create($events);
Object.assign(fx, {
  highlight({ correct, wrong }) {
    $('.questions').on('click', '.answers li', function() {
      var $el = $(this);
      var color = $el.is('.correct') ? correct : wrong;
      $el.css({ color: color });
      
      var event = (color == correct) ? 'correct' : 'wrong';
      fx.trigger(event);
    });
    return this;
  },
  updateResult(result, answers) {
    if (result == 'correct') {
      answers.correct++;
    }
    if (result == 'wrong') {
      answers.wrong++;
    }

    $('.results .correct').text(answers.correct);
    $('.results .wrong').text(answers.wrong);
  }
});

class SlideManager {
  constructor() {
    this.pubsub = $({});
  }
  init(options={}) {
    // configuration
    Object.assign(this, this.defaults, options);
    
    // event handlers
    this.addEventHandlers();
    
    if (this.oninit) {
      this.$on('init', this.oninit);
    }
    if (this.onstart) {
      this.$on('start', this.onstart);
    }
    if (this.onmove) {
      this.$on('move', this.onmove);
    }
    if (this.onshowall) {
      this.$on('showall', this.onshowall);
    }
    
    this.$emit('init');
    
    return this;
  }
  start() {
    if (this.current < 0) {
      this.current = 0;
    }
    this.$emit('start', [this.current]);
    
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
    this.$emit('showall');
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
  oninit: null,
  onstart: null,
  onmove: null
}

class MySlideManager extends SlideManager {
  constructor(options={}) {
    super();
    
    var slider = this;
    this.init({
      slides: $('section'),
      buttons: '.buttons',
      enableLoop: false,
      onstart: function onstart(event, currentIndex) {
        slider.move(currentIndex);
      },
      onmove: function onmove(event, index, oldIndex) {
        slider.slides.hide();
        slider.slides.eq(index).show();
        slider.isShowAll = false;
      },
      onshowall: function onshowall(event) {
        let { move, current, slides } = slider;
        if (slider.isShowAll) {
          move(current);
        } else {
          slides.show();
          slider.isShowAll = true;
        }      
      }
    });
    
    return this;
  }
}

/**
 * Use boundMethod to bind all methods on the target.prototype
 */
function boundClass(target) {
  // (Using reflect to get all keys including symbols)
  let keys;
  // Use Reflect if exists
  if (false && typeof Reflect !== 'undefined' && typeof Reflect.ownKeys === 'function') {
    keys = Reflect.ownKeys(target.prototype);
  } else {
    keys = Object.getOwnPropertyNames(target.prototype);
    // use symbols if support is provided
    if (typeof Object.getOwnPropertySymbols === 'function') {
      keys = keys.concat(Object.getOwnPropertySymbols(target.prototype));
    }
  }
  
  keys.forEach(key => {
    // Ignore special case target method
    if (key === 'constructor') {
      return;
    }

    let descriptor = Object.getOwnPropertyDescriptor(target.prototype, key);

    // Only methods need binding
    if (typeof descriptor.value === 'function') {
      Object.defineProperty(target.prototype, key, boundMethod(target, key, descriptor));
    }
  });
  return target;
}

/**
 * Return a descriptor removing the value and returning a getter
 * The getter will return a .bind version of the function
 * and memoize the result against a symbol on the instance
 */
function boundMethod(target, key, descriptor) {
  let fn = descriptor.value;
  if (typeof fn !== 'function') {
    throw new Error(`@autobind decorator can only be applied to methods not: ${typeof fn}`);
  }

  // In IE11 calling Object.defineProperty has a side-effect of evaluating the
  // getter for the property which is being replaced. This causes infinite
  // recursion and an "Out of stack space" error.
  let definingProperty = false;

  return {
    configurable: true,
    get() {
      if (definingProperty || this === target.prototype || this.hasOwnProperty(key)) {
        return fn;
      }

      let boundFn = fn.bind(this);
      definingProperty = true;
      Object.defineProperty(this, key, {
        value: boundFn,
        configurable: true,
        writable: true
      });
      definingProperty = false;
      return boundFn;
    }
  };
}

// bind methods
boundClass(SlideManager);
boundClass(MySlideManager);


main();
