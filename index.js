function main() {
  console.clear();

  // create and init slider
  var manager = new MySlideManager().start();
  initVue({manager, answers});
  PubSub.subscribe(ANSWER, (type, payload) => fx.updateResult(payload));
}

let types = {
  ANSWER: 'answer',
  CORRECT: 'correct',
  WRONG: 'wrong',
}
var { ANSWER, CORRECT, WRONG } = types;
var answers = {
  [CORRECT]: 0,
  [WRONG]: 0,
};

let fx = {
  updateResult({correct, bonus}) {
    if (correct) {
      answers[CORRECT]++;
      if (bonus){
        answers[CORRECT]++;
      }
    }
    if (!correct) {
      answers[WRONG]++;
    }
  }
};

class SlideManager {
  constructor() {
    this.pubsub = Object.create(PubSub);
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
    if (this.isMoveAllowed(index)) {
      index = index % this.slides.length;

      var oldIndex = this.current;
      this.current = index;
      this.$emit('move', [index, oldIndex]);      
    }
    return this;
  }
  next() {
    return this.move(this.current + 1);
  }
  prev() {
    return this.move(this.current - 1);
  }
  showAll() {
    this.$emit('showall');
    return this;
  }
  
  isMoveAllowed(index) {
    if (this.slides.length === 0) {
      return false;
    }
    if (this.enableLoop) {
      return true;
    }
    if (index >= 0 && index < this.slides.length) {
      return true;
    }
    
    return false;
  }
  
  $emit(...args){
    this.pubsub.publish(...args);
    return this;
  }
  $on(...args) {
    this.pubsub.subscribe(...args);
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
      onmove: function onmove(event) {
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
function initVue({manager, answers}){
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
        handled: false,
        answerCount: 0,
        revealAnswer: false
      }; 
    },
    methods: {
      answered(correct) {
        if (correct) {
          this.handled = true;
        }
        this.answerCount += 1;
        PubSub.publish(ANSWER, { correct: correct, bonus: this.bonus});
      }
    },
    watch: {
      answerCount(value, oldVal) {
        if (value == this.answers.length-1 && !this.handled) {
          this.handled = true;
          this.revealAnswer = true;
        }
      }
    }
  });
  Vue.component('x-slide-answer', {
    template: '#x-slide-answer',
    props: ['text', 'correct', 'handled', 'revealed'],
    data: function() { 
      return { 
        clicked: false,
      }; 
    },
    methods: {
      clickHandler() {
        if (!this.handled) {
          this.clicked = true;
        }
      },
    },
    watch: {
      clicked(val, oldVal) {
        this.$emit(ANSWER, {correct: this.correct});
      }
    }
  });
  Vue.component('x-slide-bonus', {
    template: '#x-slide-bonus',
    data: function() { return {}; },
  });  
  
  var App = new Vue({
    el: '#vue-slider',
    template: '#x-slider',
    data: function() {
      return {
        slides: data.slides,
        manager: manager
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
        manager: manager
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
      next: () => manager.next(),
      prev: () => manager.prev(),
      showAll: () => manager.showAll(),
      showResults: () => manager.showResults()
    }
  });
 
}

main();
