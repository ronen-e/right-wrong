function main() {
  console.clear();

  // create and init slider
  var manager = new MySlideManager();
  
  initVue({ manager: manager, answers: answers });
  PubSub.subscribe(ANSWER, (type, payload) => answers.update(payload));
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
  update: function update({ correct, bonus}) {
    if (correct) {
      this[CORRECT]++;
      if (bonus) {
        this[CORRECT]++;
      }
    }
    if (!correct) {
      this[WRONG]++;
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
  
  get length() {
    return this.slides.length;
  }
  
  isEmpty() {
    return this.length === 0;
  }
  
  start() {
    if (!this.isEmpty() && this.current < 0) {
      this.current = 0;
    }
    this.$emit('start', [this.current]);
    
    return this;
  }

  move(index) {
    if (this.isMoveAllowed(index)) {
      index = index % this.length;

      var oldIndex = this.current;
      this.current = index;
      this.$emit('move', [index, oldIndex]);      
    }
    return this;
  }

  isMoveAllowed(index) {
    return (this.length > 0 && index >= 0 && index < this.length);
  }
  
  $emit(...args){
    this.pubsub.publish(...args);
  }
  
  $on(...args) {
    this.pubsub.subscribe(...args);
  }
}

SlideManager.prototype.defaults = {
  slides: [],
  current: -1,
  oninit: null,
  onstart: null,
  onmove: null,
}

class MySlideManager extends SlideManager {
  constructor() {
    super();
    var slider = this;
    slider.init({
      slides: data.slides,
      onstart: function onstart(event, currentIndex) {
        slider.move(currentIndex);
      },
      onmove: function onmove(event) {
        slider.isShowAll = false;
      },
      onshowall: function onshowall(event) {
        slider.toggle('isShowAll');
      },
      onshowresults: function onshowresults(event) {
        slider.toggle('isShowResults');
      }
    })
    .start();
  }
  next() {
    return this.move(this.current + 1);
  }
  prev() {
    return this.move(this.current - 1);
  }
  showAll() {
    this.$emit('showall');
  }
  showResults() {
    this.$emit('showresults');
  }
  toggle(prop) {
    this[prop] = !this[prop];
  }
} 

MySlideManager.prototype.defaults = Object.assign(
  {},
  MySlideManager.prototype.defaults, 
  {
    isShowAll: false,
    isShowResults: false,
    onshowall: null,
    onshowresults: null
  }
);

// bind methods
boundClass(SlideManager);
boundClass(MySlideManager);

// Vue js
function initVue({manager, answers}){
  // inject a handler for translate function
  Vue.mixin({
    methods: {
      t: translate
    }
  });
  
  Vue.component('x-slide', {
    template: '#x-slide',
    props: ['title', 'questions'],
  });
  Vue.component('x-slide-header', {
    template: '#x-slide-header',
    props: ['title'],
  });
  Vue.component('x-slide-body', {
    template: '#x-slide-body',
    props: ['questions'],
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
          this.handle();
        }
        this.answerCount += 1;
        PubSub.publish(ANSWER, { correct: correct, bonus: this.bonus});
      },
      handle() {
        this.handled = true;
      }
    },
    watch: {
      answerCount(currentCount, oldCount) {
        if (!this.handled && currentCount === this.answers.length-1) {
          this.handle();
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
      show(index) {
        return manager.isShowAll || index === manager.current;
      }
    }
  });    
  
  var Total = new Vue({
    el: '#total',
    data: function() {
      return {
        answers: answers,
        manager: manager,
      }
    },
    computed: {
      showResults: () => manager.isShowResults,
      correct: () => answers.correct,
      wrong: () => answers.wrong
    }
  });
  
  var Buttons = new Vue({
    el: '#buttons',
    methods: {
      next: manager.next,
      prev: manager.prev,
      showAll: manager.showAll,
      showResults: manager.showResults
    }
  });
 
}

const translations = {
  buttons: {
    next: 'הבא',
    previous: 'הקודם',
    showall: 'הצג הכל',
    total: 'סיכום',
  },
  results: {
    total: 'סיכום',
    correct: 'תשובות נכונות',
    wrong: 'שגיאות'
  },
  slides: {
    bonus: {
      title: '2 נקודות',
      text: 'בונוס - 2 נקודות'
    }
  }
}
function translate(path) {
  return _.get(translations, path, path);
}

main();
