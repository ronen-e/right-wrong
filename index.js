function main() {
  console.clear();

  // create and init slider
  var manager = new MySlideManager().start();
  
  fx.on(EVENTS.correct, (event) => fx.updateResult(event.type, answers));
  fx.on(EVENTS.wrong, (event) => fx.updateResult(event.type, answers));
  
  initVue({manager, answers});
}

var answers = {
  correct: 0,
  wrong: 0
};

const EVENTS = {
  click: 'click',
  correct: 'correct',
  wrong: 'wrong'
}

let fx = Object.create($({}));
Object.assign(fx, {
  updateResult(type, answers) {
    switch(type) {
      case EVENTS.correct: answers.correct++; break;
      case EVENTS.wrong: answers.wrong++; break;
    }
  }
});

class SlideManager {
  constructor() {
    this.pubsub = $({});
  }
  init(options={}) {
    // configuration
    Object.assign(this, this.defaults, options);

    for (let prop in this) {
      var fn = this[prop];
      if (prop.startsWith('on') && typeof fn == 'function') {
        this.$on(prop.substr('on'.length), fn);
      }
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
    return this;
  }
  $emit(...args){
    this.pubsub.trigger(...args);
    return this;
  }
  $on(...args) {
    this.pubsub.on(...args);
    return this;
  }
}

SlideManager.prototype.defaults = {
  slides: [],
  current: -1,
  isShowAll: false,
  enableLoop: false,
  oninit: null,
  onstart: null,
  onmove: null,
  onshowall: null
}

class MySlideManager extends SlideManager {
  constructor() {
    super();
    
    var slider = this;
    slider.init({
      slides: data.slides,
      enableLoop: false,
      oninit: function oninit() {
      },
      onstart: function onstart(event, currentIndex) {
        slider.move(currentIndex);
      },
      onmove: function onmove(event, index, oldIndex) {
        slider.isShowAll = false;
      },
      onshowall: function onshowall(event) {
        let { move, current, slides } = slider;
        if (slider.isShowAll) {
          move(current);
        } else {
          slider.isShowAll = true;
        }
      },

      isShowResults: false,
      onshowresults: function onshowresults(event) {
        slider.isShowResults = !slider.isShowResults;
      }
    });
    
    return this;
  }
  
  showResults() {
    this.$emit('showresults');
    return this;
  }
}

// bind methods
boundClass(SlideManager);
boundClass(MySlideManager);

// Vue js
function initVue(state){
  Vue.component('x-slide', {
    template: '#x-slide',
    props: ['title', 'questions'],
    data: function() { return {}; }
  });
  Vue.component('x-slide-header', {
    template: '#x-slide-header',
    props: ['title'],
    data: function() { return {}; },
  });
  Vue.component('x-slide-body', {
    template: '#x-slide-body',
    props: ['questions'],
    data: function() { return {}; },
  });
  Vue.component('x-slide-question', {
    template: '#x-slide-question',
    props: ['text', 'answers', 'bonus'],
    data: function() { 
      return {
        handled: false
      }; 
    },
    methods: {
      correct() {
        this.handled = true;
      }
    },
  });
  Vue.component('x-slide-answer', {
    template: '#x-slide-answer',
    props: ['text', 'correct', 'handled'],
    data: function() { 
      return { 
        clicked: false,
      }; 
    },
    created() {
      this.$on(EVENTS.correct, () => fx.trigger(EVENTS.correct, answers));
      this.$on(EVENTS.wrong, () => fx.trigger(EVENTS.wrong, answers));
    },
    methods: {
      clickHandler() {
        
        this.$emit('click');
        
        if (this.handled) {
          return;
        }

        this.clicked = true;
        
        if (this.correct) {
          this.$emit(EVENTS.correct);
        } else {
          this.$emit(EVENTS.wrong)
        }
      },
    }
  });
  
  var App = new Vue({
    el: '#vue-slider',
    template: '#x-slider',
    data: function() {
      return {
        data: data,
        slides: data.slides,
        manager: state.manager
      }
    },
    methods: {
      isShow(index) {
        return index == this.manager.current || this.manager.isShowAll;
      }
    }
  });
  
  var Footer = new Vue({
    el: '#total',
    data: function() {
      return {
        answers: answers,
        manager: state.manager
      }
    },
    computed: {
      correct: function(){ return this.answers.correct; },
      wrong: function(){ return this.answers.wrong; }
    }
  });
  
  var Buttons = new Vue({
    el: '#buttons',
    data: function() { return { }; },
    methods: {
      next: () => state.manager.next(),
      prev: () => state.manager.prev(),
      showAll: () => state.manager.showAll(),
      showResults: () => state.manager.showResults()
    }
  });
 
}

main();
